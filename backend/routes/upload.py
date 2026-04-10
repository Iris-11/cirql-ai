"""
upload.py — Image upload endpoint.

POST /api/v1/product/upload-images
  - Accepts multipart files with an `angle` field per image
  - Uploads to Supabase Storage bucket "product-images" using service role key
  - Returns [{ photo_id, url, label }] ready for use in /full-assessment

This keeps Supabase credentials server-side and avoids RLS issues on mobile.
"""

import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
from pydantic import BaseModel

from utils.supabase_client import get_supabase_client, create_listing
from config import SUPABASE_URL

router = APIRouter()

BUCKET = "product-images"

ANGLE_TO_LABEL = {
    "front": "front_view",
    "back": "back_view",
    "top": "top_view",
    "bottom": "bottom_view",
    "side": "side_left",
    "label": "close_up_damage",
}


class UploadedImage(BaseModel):
    photo_id: str
    url: str
    label: str


@router.post(
    "/upload-images",
    response_model=List[UploadedImage],
    summary="Upload product images to Supabase Storage",
    description="Accepts multipart image files, uploads them to Supabase Storage, and returns public URLs.",
)
async def upload_images(
    files: List[UploadFile] = File(...),
    angles: List[str] = Form(...),
    customer_id: str = Form(...),
):
    if len(files) != len(angles):
        raise HTTPException(
            status_code=400,
            detail="Number of files must match number of angles.",
        )

    client = get_supabase_client(use_admin=True)
    results: List[UploadedImage] = []

    session_id = uuid.uuid4().hex[:12]   # unique per submission

    for i, (file, angle) in enumerate(zip(files, angles)):
        photo_id = f"photo_{i + 1}_{uuid.uuid4().hex[:8]}"
        # Path: products/{customer_id}/{session_id}/{angle}.jpg
        # — scoped per user, unique per submission
        path = f"products/{customer_id}/{session_id}/{angle}.jpg"
        content = await file.read()

        try:
            client.storage.from_(BUCKET).upload(
                path,
                content,
                {"content-type": file.content_type or "image/jpeg", "upsert": "true"},
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload image for angle '{angle}': {str(e)}",
            )

        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{path}"
        label = ANGLE_TO_LABEL.get(angle, f"{angle}_view")

        results.append(UploadedImage(photo_id=photo_id, url=public_url, label=label))

    return results


class CreateListingRequest(BaseModel):
    passport_id: str
    seller_id: str
    photo_urls: List[str]


class CreateListingResponse(BaseModel):
    listing_id: str


@router.post(
    "/create-listing",
    response_model=CreateListingResponse,
    summary="Create a resale listing row before assessment",
)
def create_listing_endpoint(body: CreateListingRequest):
    listing_id = create_listing(
        passport_id=body.passport_id,
        seller_id=body.seller_id,
        photo_urls=body.photo_urls,
    )
    if not listing_id:
        raise HTTPException(status_code=500, detail="Failed to create listing in database.")
    return CreateListingResponse(listing_id=listing_id)
