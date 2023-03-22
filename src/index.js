import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CanvasProvider } from "./canvas-context";

import App from "./app";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <CanvasProvider>
      <App />
    </CanvasProvider>
  </StrictMode>
);
