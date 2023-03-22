import "./reset.css";
import "./styles.css";
import { Canvas } from "./canvas";
import { DrawingToolsPanel } from "./drawing-tools";

export default function App() {
  return (
    <>
      <Canvas />
      <DrawingToolsPanel />
    </>
  );
}
