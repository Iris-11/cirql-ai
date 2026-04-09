from typing import Dict, Any, List, Optional
from models.schemas import VerificationResult

def format_e1_for_ui(result: VerificationResult) -> Dict[str, Any]:
    """
    Converts internal verification result into a secure, UI-safe response.
    Never exposes internal flags (like 'location_mismatch') directly to the user.
    """
    # 1. Determine Status
    if not result.complete:
        status = "needs_more_photos"
    elif result.proceed and result.confidence_score > 0.75:
        status = "verified"
    elif result.proceed:
        # proceed is True, but score is <= 0.75
        status = "under_review"
    else:
        status = "rejected"

    # 2. Determine Confidence Label
    if result.confidence_score > 0.75:
        confidence = "high"
    elif result.confidence_score > 0.5:
        confidence = "medium"
    else:
        confidence = "low"

    # 3. Generate User-safe Guidance Strings
    guidance: List[str] = []

    if status == "needs_more_photos" and result.missing_angles:
        # Clean up angle strings for UI (e.g. "side-left" -> "Side Left")
        readable_angles = [
            angle.replace("-", " ").replace("_", " ").title() 
            for angle in result.missing_angles
        ]
        angles_str = ", ".join(readable_angles)
        guidance.append(f"Please provide clear photos showing the following angles: {angles_str}.")
    
    if status == "rejected":
        guidance.append(
            "We were unable to verify your item automatically. "
            "Please ensure you submit original, well-lit photos and that your location services are active."
        )

    if status == "under_review":
        guidance.append(
            "Your photos have been received but require a manual review by our specialists."
        )
        
    if status == "verified":
        guidance.append(
            "Your product images have been successfully verified."
        )

    return {
        "status": status,
        "guidance": guidance,
        "confidence": confidence
    }
