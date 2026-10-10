import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/react";
import { BrowserRouter } from "react-router";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <p style={{ padding: 24, fontFamily: "system-ui" }}>
        Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code>. Add it to <code>frontend/.env</code> (local) or pass it as a
        build argument (Docker / hosting) and rebuild.
      </p>
    )}
  </StrictMode>,
);
