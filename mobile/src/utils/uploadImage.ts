/**
 * uploadImages — Sends local image URIs to the backend for upload to Supabase Storage.
 * Returns [{ photo_id, url, label }] ready to use in /full-assessment.
 */

import { BASE_URL } from "../api/apiClient";

export interface UploadedImage {
  photo_id: string;
  url: string;
  label: string;
}

type Slot = { angle: string; uri: string };

export async function uploadImages(slots: Slot[], customerId: string): Promise<UploadedImage[]> {
  const formData = new FormData();

  for (const slot of slots) {
    // React Native FormData accepts { uri, name, type } as a file
    formData.append("files", {
      uri: slot.uri,
      name: `${slot.angle}.jpg`,
      type: "image/jpeg",
    } as any);
    formData.append("angles", slot.angle);
  }
  formData.append("customer_id", customerId);

  const response = await fetch(`${BASE_URL}/product/upload-images`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type manually — fetch sets it with the boundary automatically
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Upload failed (${response.status}): ${err}`);
  }

  return response.json() as Promise<UploadedImage[]>;
}
