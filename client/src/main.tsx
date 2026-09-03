import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Filter out third-party browser extension errors from triggering dev runtime overlays
if (typeof window !== "undefined") {
  window.addEventListener(
    "error",
    (event) => {
      if (
        event.filename?.startsWith("chrome-extension://") ||
        event.filename?.startsWith("moz-extension://") ||
        (typeof event.error?.stack === "string" && event.error.stack.includes("chrome-extension://"))
      ) {
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      if (
        typeof reason?.stack === "string" &&
        (reason.stack.includes("chrome-extension://") || reason.stack.includes("moz-extension://"))
      ) {
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById("root")!).render(<App />);

