/**
 * AssessmentContext — Passes the pipeline result from VerifyProductScreen
 * to VerificationPendingScreen without prop drilling through navigation params.
 */

// @ts-ignore — React 19.1 + TS 5.9 false-positive
import React, { createContext, useContext, useState } from "react";
import type { FullPipelineResult } from "../types";

interface AssessmentContextValue {
  result: FullPipelineResult | null;
  error: boolean;
  setResult: (r: FullPipelineResult) => void;
  setError: (e: boolean) => void;
  clear: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

// @ts-ignore — React.ReactNode false-positive
export function AssessmentProvider({ children }: { children?: React.ReactNode }) {
  const [result, setResultState] = useState<FullPipelineResult | null>(null);
  const [error, setErrorState] = useState(false);

  const setResult = (r: FullPipelineResult) => { setResultState(r); setErrorState(false); };
  const setError  = (e: boolean) => setErrorState(e);
  const clear     = () => { setResultState(null); setErrorState(false); };

  return (
    <AssessmentContext.Provider value={{ result, error, setResult, setError, clear }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used inside <AssessmentProvider>");
  return ctx;
}
