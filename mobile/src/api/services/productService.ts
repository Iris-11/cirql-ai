/**
 * Product & Verification Service
 */

import apiClient, { simulateDelay } from "../apiClient";
import {
  mockVerificationResult,
  mockConditionResult,
  mockRoutingResult,
} from "../mockData";
import type {
  ProductSubmission,
  VerificationResult,
  ConditionResponse,
  FullPipelineResult,
  RoutingResponse,
} from "../../types";

/**
 * Create a resale listing row before submitting for assessment.
 * Returns the new listing_id.
 */
export async function createListing(
  passportId: string,
  sellerId: string,
  photoUrls: string[]
): Promise<string> {
  const { data } = await apiClient.post<{ listing_id: string }>(
    "/product/create-listing",
    { passport_id: passportId, seller_id: sellerId, photo_urls: photoUrls }
  );
  return data.listing_id;
}

/**
 * E1 — Verify product images
 * POST /api/v1/product/verify-images
 */
export async function verifyProductImages(
  _submission: ProductSubmission
): Promise<VerificationResult> {
  await simulateDelay(2000);
  return mockVerificationResult;
}

/**
 * E2 — Evaluate product condition
 * POST /api/v1/product-condition/evaluate-condition
 */
export async function evaluateCondition(
  _submission: ProductSubmission
): Promise<ConditionResponse> {
  await simulateDelay(1500);
  return mockConditionResult;
}

/**
 * E1 + E2 + E3 — Full pipeline
 * POST /api/v1/product/full-assessment
 */
export async function fullAssessment(
  submission: ProductSubmission
): Promise<FullPipelineResult> {
  const { data } = await apiClient.post<FullPipelineResult>(
    "/product/full-assessment",
    submission
  );
  return data;
}

/**
 * Confirm user's chosen action after seeing results.
 * POST /api/v1/product/confirm-action
 */
export async function confirmAction(
  listingId: string,
  action: "resale" | "donate" | "recycle"
): Promise<void> {
  await apiClient.post("/product/confirm-action", {
    listing_id: listingId,
    action,
  });
}

/**
 * E3 — Route product (resale / donate / recycle)
 * POST /api/v1/routing/route-product
 */
export async function routeProduct(_request: {
  product_id: string;
  category: string;
  weight: number;
  location: string;
  condition_report: ConditionResponse;
}): Promise<RoutingResponse> {
  await simulateDelay(1000);
  return mockRoutingResult;
}
