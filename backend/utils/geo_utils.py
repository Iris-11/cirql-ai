"""
geo_utils.py — EXIF GPS + Timestamp extraction and validation utilities.

Used by the E1 verification engine to validate that submitted images:
  1. Were taken near the user's current location (GPS EXIF vs. user_location)
  2. Were taken recently relative to the submission timestamp (EXIF DateTime)
"""

import math
import io
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, List
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS


# ── Constants ─────────────────────────────────────────────────────────────────
LOCATION_MISMATCH_THRESHOLD_KM = 100   # Flag if photo taken >100km from user
STALE_IMAGE_THRESHOLD_DAYS = 30        # Flag if photo taken >30 days before submission


# ── EXIF Extraction ───────────────────────────────────────────────────────────

def _parse_exif(image_bytes: bytes) -> Optional[dict]:
    """Open image bytes and return the raw EXIF dict, or None."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_raw = img._getexif()
        if not exif_raw:
            return None
        return {TAGS.get(tag_id, tag_id): value for tag_id, value in exif_raw.items()}
    except Exception as e:
        print(f"[geo_utils] EXIF parse error: {e}")
        return None


def _convert_to_degrees(value) -> float:
    """Convert GPS rational (degrees, minutes, seconds) → decimal degrees."""
    def to_float(v):
        if hasattr(v, "numerator"):
            return v.numerator / v.denominator if v.denominator else 0.0
        if isinstance(v, tuple):
            return v[0] / v[1] if v[1] else 0.0
        return float(v)

    return to_float(value[0]) + to_float(value[1]) / 60.0 + to_float(value[2]) / 3600.0


def extract_gps_from_exif(exif: dict) -> Optional[Tuple[float, float]]:
    """Extract (lat, lng) decimal degrees from a parsed EXIF dict."""
    gps_raw = exif.get("GPSInfo")
    if not gps_raw:
        return None

    gps = {GPSTAGS.get(k, k): v for k, v in gps_raw.items()}
    if "GPSLatitude" not in gps or "GPSLongitude" not in gps:
        return None

    lat = _convert_to_degrees(gps["GPSLatitude"])
    if gps.get("GPSLatitudeRef") == "S":
        lat = -lat

    lng = _convert_to_degrees(gps["GPSLongitude"])
    if gps.get("GPSLongitudeRef") == "W":
        lng = -lng

    return (lat, lng)


def extract_datetime_from_exif(exif: dict) -> Optional[datetime]:
    """
    Extract the photo capture time from EXIF DateTimeOriginal or DateTime.
    Returns a timezone-aware UTC datetime, or None if unavailable.
    EXIF format: "YYYY:MM:DD HH:MM:SS"
    """
    raw_dt = exif.get("DateTimeOriginal") or exif.get("DateTime")
    if not raw_dt:
        return None
    try:
        # EXIF stores local time — we treat it as UTC (conservative for hackathon)
        dt = datetime.strptime(raw_dt, "%Y:%m:%d %H:%M:%S")
        return dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


# ── Haversine Distance ────────────────────────────────────────────────────────

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate great-circle distance between two GPS points in kilometres."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ── Main Geo + Time Validation ────────────────────────────────────────────────

def validate_geo(
    image_bytes_list: List[bytes],
    user_lat: Optional[float],
    user_lng: Optional[float],
    submission_timestamp: Optional[str] = None,
) -> dict:
    """
    Cross-reference EXIF data from all submitted images against:
      - User's claimed current location  (GPS mismatch → "location_mismatch")
      - Submission timestamp             (old photo → "stale_image")

    Returns:
        has_exif            bool    — Any image had GPS EXIF data
        has_datetime_exif   bool    — Any image had DateTimeOriginal EXIF
        exif_coords         list    — (lat, lng) tuples found across images
        max_distance_km     float   — Worst-case distance from user's location
        max_age_days        float   — Oldest photo age in days vs submission time
        flags               list    — "no_exif_data" | "location_mismatch" | "stale_image"
        geo_risk_score      float   — Risk score (0.0 to 1.0) based on distance
        time_risk_score     float   — Risk score (0.0 to 1.0) based on age
    """
    result = {
        "has_exif": False,
        "has_datetime_exif": False,
        "exif_coords": [],
        "max_distance_km": None,
        "max_age_days": None,
        "flags": [],
        "geo_risk_score": 0.0,
        "time_risk_score": 0.0,
    }

    # Parse submission timestamp once
    submission_dt: Optional[datetime] = None
    if submission_timestamp:
        try:
            # Handle both offset-aware and naive ISO strings
            submission_dt = datetime.fromisoformat(
                submission_timestamp.replace("Z", "+00:00")
            )
        except ValueError:
            pass

    coords_found: List[Tuple[float, float]] = []
    datetimes_found: List[datetime] = []

    for img_bytes in image_bytes_list:
        exif = _parse_exif(img_bytes)
        if not exif:
            continue

        # GPS
        coords = extract_gps_from_exif(exif)
        if coords:
            coords_found.append(coords)

        # DateTime
        photo_dt = extract_datetime_from_exif(exif)
        if photo_dt:
            datetimes_found.append(photo_dt)

    # ── GPS check & Risk Scoring ──
    if not coords_found:
        result["flags"].append("no_exif_data")
        # Lack of metadata is itself a minor risk (0.2)
        result["geo_risk_score"] = 0.2
    else:
        result["has_exif"] = True
        result["exif_coords"] = coords_found

        if user_lat is not None and user_lng is not None:
            distances = [
                haversine_km(lat, lng, user_lat, user_lng)
                for lat, lng in coords_found
            ]
            max_dist = max(distances)
            result["max_distance_km"] = round(max_dist, 2)

            # Probabilistic Scoring:
            # < 50 km    → 0.0 risk
            # 50–200 km  → 0.3 risk
            # > 200 km   → 0.6 risk
            if max_dist < 50:
                result["geo_risk_score"] = 0.0
            elif max_dist <= 200:
                result["geo_risk_score"] = 0.3
                # Keep compatibility with binary flags if > threshold
                if max_dist > LOCATION_MISMATCH_THRESHOLD_KM:
                    result["flags"].append("location_mismatch")
            else:
                result["geo_risk_score"] = 0.6
                result["flags"].append("location_mismatch")

    # ── Timestamp check & Risk Scoring ──
    if not datetimes_found:
        result["has_datetime_exif"] = False
        # Missing temporal metadata is a minor risk
        result["time_risk_score"] = 0.1
    else:
        result["has_datetime_exif"] = True
        if submission_dt:
            ages_days = [
                (submission_dt - photo_dt).total_seconds() / 86400
                for photo_dt in datetimes_found
            ]
            max_age = max(ages_days)
            result["max_age_days"] = round(max_age, 1)

            # Probabilistic Scoring:
            # < 30 days    → 0.0 risk
            # 30–180 days  → 0.3 risk
            # > 180 days   → 0.6 risk
            if max_age < 30:
                result["time_risk_score"] = 0.0
            elif max_age <= 180:
                result["time_risk_score"] = 0.3
                if max_age > STALE_IMAGE_THRESHOLD_DAYS:
                    result["flags"].append("stale_image")
            else:
                result["time_risk_score"] = 0.6
                result["flags"].append("stale_image")

            # Hard Fraud: Future timestamp
            if max_age < 0:
                result["time_risk_score"] = 1.0
                if "stale_image" not in result["flags"]:
                    result["flags"].append("stale_image")

    return result
