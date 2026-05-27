// QueryContext.tsx
import { createContext, useContext } from "react";

export type QueryState = { base: string; path: string };

export const QueryContext = createContext<QueryState | null>(null);
export const useQuery = () => {
  const ctx = useContext(QueryContext);
  if (!ctx) throw new Error("useQuery must be used inside provider");
  return ctx;
};
