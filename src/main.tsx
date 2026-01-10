import * as React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as RRD from "react-router-dom";
import App from "./App.tsx";

// Runtime checks to debug Invalid hook call
console.log(
  "React version →",
  (React as unknown as { version?: string }).version,
);
console.log("react-router-dom export keys →", Object.keys(RRD));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
