import { createContext, useContext } from "react";
import useCanteenState from "../hooks/useCanteenState";

const CanteenContext = createContext(null);

export function CanteenProvider({ children }) {
  const value = useCanteenState();
  return <CanteenContext.Provider value={value}>{children}</CanteenContext.Provider>;
}

export function useCanteen() {
  const context = useContext(CanteenContext);

  if (!context) {
    throw new Error("useCanteen must be used inside CanteenProvider");
  }

  return context;
}
