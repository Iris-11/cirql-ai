import pytest
import json
from unittest.mock import patch, MagicMock, AsyncMock

from models.schemas import ProductSubmission, UserLocation, Passport, ProductImage
from services.gemini_service import verify_product

def build_dummy_submission() -> ProductSubmission:
    """Helper to generate a base ProductSubmission for testing."""
    return ProductSubmission(
        product_id="TEST-123",
        submission_timestamp="2026-04-09T12:00:00Z",
        images=[
            ProductImage(photo_id="1", url="http://example.com/1.jpg", label="top_view"),
            ProductImage(photo_id="2", url="http://example.com/2.jpg", label="front_view")
        ],
        passport=Passport(
            brand="TestBrand",
            product_name="TestProduct",
            category="TestCategory",
        ),
        user_location=UserLocation(lat=40.7128, lng=-74.0060)
    )

@pytest.fixture
def mock_fetch():
    """Mocks image downloading to avoid external network requests."""
    with patch("services.gemini_service._fetch_all_images", new_callable=AsyncMock) as m:
        m.return_value = ([{"inline_data": "dummy"}], [b"dummybytes"], None)
        yield m

@pytest.fixture
def mock_geo():
    """Mocks the EXIF extraction and validation utility."""
    with patch("services.gemini_service.validate_geo") as m:
        m.return_value = {
            "flags": [],
            "max_distance_km": 10.0,
            "max_age_days": 1.0,
            "geo_risk_score": 0.0,
            "time_risk_score": 0.0,
            "has_exif": True,
            "has_datetime_exif": True,
        }
        yield m

@pytest.fixture
def mock_gemini():
    """Mocks the Gemini Vision API response."""
    with patch("google.generativeai.GenerativeModel.generate_content_async", new_callable=AsyncMock) as m:
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "complete": True,
            "authenticity_score": 0.9,
            "missing_angles": [],
            "flags": [],
            "proceed": True,
            "sku_match": True,
            "damage_detected": False,
            "damage_summary": None
        })
        m.return_value = mock_response
        yield m

# ── 1. Perfect Submission ─────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_perfect_submission(mock_fetch, mock_geo, mock_gemini):
    sub = build_dummy_submission()
    res = await verify_product(sub)
    
    assert res.proceed is True
    assert res.confidence_score >= 0.7  # Based on 0.5*0.9 + 0.2*1.0 + 0.2*1.0 + 0.1*1.0 = 0.95
    assert res.complete is True
    assert not res.flags

# ── 2. Missing Angles ─────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_missing_angles(mock_fetch, mock_geo, mock_gemini):
    sub = build_dummy_submission()
    
    # Override Gemini to indicate missing angles
    mock_gemini.return_value.text = json.dumps({
        "complete": False,
        "authenticity_score": 0.8,
        "missing_angles": ["side_left", "side_right"],
        "flags": ["insufficient_images"],
        "proceed": False,
        "sku_match": True,
        "damage_detected": False,
        "damage_summary": None
    })
    
    res = await verify_product(sub)
    
    assert res.complete is False
    assert "side_left" in res.missing_angles
    assert "insufficient_images" in res.flags

# ── 3. No EXIF Data ───────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_no_exif_data(mock_fetch, mock_geo, mock_gemini):
    sub = build_dummy_submission()
    
    # Inject lack of EXIF into geo mocker
    mock_geo.return_value["flags"] = ["no_exif_data"]
    mock_geo.return_value["geo_risk_score"] = 0.2
    
    res = await verify_product(sub)
    
    assert "no_exif_data" in res.geo_flags
    assert res.geo_risk_score == 0.2

# ── 4. Location Mismatch ──────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_location_mismatch(mock_fetch, mock_geo, mock_gemini):
    sub = build_dummy_submission()
    
    # Inject severe location mismatch
    mock_geo.return_value["flags"] = ["location_mismatch"]
    mock_geo.return_value["geo_risk_score"] = 0.8
    
    res = await verify_product(sub)
    
    assert "location_mismatch" in res.geo_flags
    assert res.geo_risk_score == 0.8
    # System should explicitly overwrite 'proceed' to False due to high geo risk
    assert res.proceed is False

# ── 5. Old Images ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_old_images(mock_fetch, mock_geo, mock_gemini):
    sub = build_dummy_submission()
    
    # Inject stale image
    mock_geo.return_value["flags"] = ["stale_image"]
    mock_geo.return_value["time_risk_score"] = 0.6
    
    res = await verify_product(sub)
    
    assert "stale_image" in res.geo_flags
    assert res.time_risk_score == 0.6
    # System should overwrite 'proceed' to False
    assert res.proceed is False

# ── 6. Duplicate/Stock Images ─────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_duplicate_images(mock_fetch, mock_geo, mock_gemini):
    sub = build_dummy_submission()
    
    # Override Gemini to indicate duplicate or stock photos
    mock_gemini.return_value.text = json.dumps({
        "complete": False,
        "authenticity_score": 0.2, # Very low authenticity
        "missing_angles": [],
        "flags": ["inconsistent_images", "possible_stock_images"],
        "proceed": False,
        "sku_match": True,
        "damage_detected": False,
        "damage_summary": None
    })
    
    res = await verify_product(sub)
    
    assert res.authenticity_score == 0.2
    assert "inconsistent_images" in res.flags
    assert "possible_stock_images" in res.flags
    assert res.proceed is False
    # Verify the confidence score was pulled down significantly
    assert res.confidence_score < 0.6
