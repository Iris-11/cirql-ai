/**
 * React Query hooks — Products & Verification
 */

import { useMutation } from "@tanstack/react-query";
import {
  verifyProductImages,
  evaluateCondition,
  fullAssessment,
  routeProduct,
} from "../api/services/productService";
import type { ProductSubmission, ConditionResponse } from "../types";

export function useVerifyProduct() {
  return useMutation({
    mutationFn: (submission: ProductSubmission) =>
      verifyProductImages(submission),
  });
}

export function useEvaluateCondition() {
  return useMutation({
    mutationFn: (submission: ProductSubmission) =>
      evaluateCondition(submission),
  });
}

export function useFullAssessment() {
  return useMutation({
    mutationFn: (submission: ProductSubmission) => fullAssessment(submission),
  });
}

export function useRouteProduct() {
  return useMutation({
    mutationFn: (request: {
      product_id: string;
      category: string;
      weight: number;
      location: string;
      condition_report: ConditionResponse;
    }) => routeProduct(request),
  });
}
