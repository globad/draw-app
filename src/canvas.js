import React, { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useCanvas } from "./canvas-context";

export function Canvas() {
  const {
    canvasRef,
    canvasOverlayRef,
    init,
    resize,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    onMouseLeave
  } = useCanvas();

  const handleResize = useDebouncedCallback(resize, 200);

  useEffect(() => {
    init();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="canvas-container">
      <canvas
        id="main-layer"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        ref={canvasRef}
      />
      <canvas id="canvas-overlay" ref={canvasOverlayRef} />
    </div>
  );
}
