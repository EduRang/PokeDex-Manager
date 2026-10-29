import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Solo el subconjunto latino: cubre el español (é, ñ, ¿, ¡)
import "@fontsource/dotgothic16/latin-400.css";
import "@fontsource/pixelify-sans/latin-400.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
