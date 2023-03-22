import React, { useContext, useRef, useState } from "react";
import {
  prepareCanvas,
  clear,
  calculateLength,
  calculateWidthAndHeight,
  hex2rgba,
  saveFile,
  drawBrushStroke,
  drawCursor,
  resizeCanvas
} from "./utils";

const CanvasContext = React.createContext();

export const CanvasProvider = ({ children }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState("brush");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [useFillColor, setUseFillColor] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const canvasRef = useRef(null);
  const canvasOverlayRef = useRef(null);
  const contextRef = useRef(null);
  const overlayContextRef = useRef(null);
  const startCoord = useRef(null);
  const lastCoord = useRef(null);
  const endCoord = useRef(null);
  const mouseButton = useRef(null);

  const init = () => {
    contextRef.current = prepareCanvas(canvasRef.current, {
      fillColor,
      strokeColor,
      lineWidth
    });
    overlayContextRef.current = prepareCanvas(canvasOverlayRef.current, {
      fillColor,
      strokeColor,
      lineWidth
    });
  };

  const resize = () => {
    contextRef.current = resizeCanvas(canvasRef.current, {
      fillColor,
      strokeColor,
      lineWidth
    });
    overlayContextRef.current = resizeCanvas(canvasOverlayRef.current, {
      fillColor,
      strokeColor,
      lineWidth
    });
  };

  const startDrawing = (nativeEvent) => {
    if (isDrawing) {
      finishDrawing(nativeEvent);
      return;
    }

    const { offsetX, offsetY, button } = nativeEvent;
    mouseButton.current = button;
    const isMainButton = button === 0;
    startCoord.current = [offsetX, offsetY];
    lastCoord.current = [offsetX, offsetY];
    contextRef.current.beginPath();
    if (selectedTool === "brush" || selectedTool === "eraser") {
      contextRef.current.moveTo(offsetX, offsetY);
      drawBrushStroke({
        lineWidth,
        lastCoord: lastCoord.current,
        offsetX,
        offsetY,
        context: contextRef.current,
        fillColor,
        strokeColor,
        isMainButton: selectedTool === "brush" ? isMainButton : false
      });
    }
    if (selectedTool === "line") {
      contextRef.current.moveTo(offsetX, offsetY);
    }
    setIsDrawing(true);
  };

  const draw = (nativeEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    const isMainButton = mouseButton.current === 0;
    clear(canvasOverlayRef.current);
    overlayContextRef.current.strokeStyle = hex2rgba(
      isMainButton ? strokeColor : fillColor,
      0.5
    );
    overlayContextRef.current.fillStyle = hex2rgba(fillColor, 0.5);
    if (isDrawing) {
      if (selectedTool === "brush" || selectedTool === "eraser") {
        drawBrushStroke({
          lineWidth,
          lastCoord: lastCoord.current,
          offsetX,
          offsetY,
          context: contextRef.current,
          fillColor,
          strokeColor,
          isMainButton: selectedTool === "brush" ? isMainButton : false
        });
      }
      if (!startCoord.current) {
        lastCoord.current = [offsetX, offsetY];
        return;
      }
      overlayContextRef.current.lineWidth = lineWidth;
      const startX = startCoord.current[0];
      const startY = startCoord.current[1];
      if (selectedTool === "line") {
        overlayContextRef.current.beginPath();
        overlayContextRef.current.moveTo(startX, startY);
      }
      if (selectedTool === "circle" || selectedTool === "rectangle") {
        overlayContextRef.current.beginPath();
      }
      if (selectedTool === "line") {
        overlayContextRef.current.lineTo(offsetX, offsetY);
        overlayContextRef.current.stroke();
        overlayContextRef.current.closePath();
      }
      if (selectedTool === "circle") {
        const radius = calculateLength(startX, startY, offsetX, offsetY);
        overlayContextRef.current.arc(
          startX,
          startY,
          radius,
          0,
          2 * Math.PI,
          false
        );
        if (useFillColor) {
          overlayContextRef.current.fill();
        }
        overlayContextRef.current.stroke();
      }
      if (selectedTool === "rectangle") {
        const { width, height } = calculateWidthAndHeight(
          startX,
          startY,
          offsetX,
          offsetY
        );
        if (useFillColor) {
          overlayContextRef.current.fillRect(startX, startY, width, height);
        }
        overlayContextRef.current.strokeRect(startX, startY, width, height);
      }
    } else {
      drawCursor({
        context: overlayContextRef.current,
        lineWidth,
        fillColor,
        strokeColor,
        selectedTool,
        offsetX,
        offsetY
      });
    }
    lastCoord.current = [offsetX, offsetY];
  };

  const finishDrawing = (nativeEvent) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    endCoord.current = [offsetX, offsetY];

    const isMainButton = mouseButton.current === 0;
    contextRef.current.strokeStyle = isMainButton ? strokeColor : fillColor;

    if (selectedTool === "brush") {
      contextRef.current.closePath();
    }
    if (!startCoord.current) {
      return;
    }
    const startX = startCoord.current[0];
    const startY = startCoord.current[1];
    if (selectedTool === "line") {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.strokeStyle = isMainButton ? strokeColor : fillColor;
      contextRef.current.stroke();
      contextRef.current.closePath();
    }
    if (selectedTool === "circle") {
      const radius = calculateLength(startX, startY, offsetX, offsetY);
      contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI, false);
      if (useFillColor) {
        contextRef.current.fill();
      }
      contextRef.current.stroke();
    }
    if (selectedTool === "rectangle") {
      const { width, height } = calculateWidthAndHeight(
        startX,
        startY,
        offsetX,
        offsetY
      );
      if (useFillColor) {
        contextRef.current.fillRect(startX, startY, width, height);
      }
      contextRef.current.strokeRect(startX, startY, width, height);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    clear(canvasRef.current, fillColor);
  };

  const changeTool = (tool) => {
    setSelectedTool(tool);
  };

  const setValue = (parameter, value) => {
    if (parameter === "fillColor") {
      setFillColor(value);
      setUseFillColor(true);
      contextRef.current.fillStyle = value;
      overlayContextRef.current.fillStyle = value;
    }
    if (parameter === "strokeColor") {
      setStrokeColor(value);
      contextRef.current.strokeStyle = value;
      overlayContextRef.current.strokeStyle = value;
    }
    if (parameter === "lineWidth") {
      setLineWidth(value);
      contextRef.current.lineWidth = value;
      overlayContextRef.current.lineWidth = value;
    }
    if (parameter === "useFillColor") {
      setUseFillColor((prev) => !prev);
    }
  };

  const saveAsFile = () => {
    const dataURL = canvasRef.current.toDataURL("image/png", 1.0);
    saveFile(dataURL, "image.png");
  };

  const onMouseDown = ({ nativeEvent }) => {
    startDrawing(nativeEvent);
  };

  const onMouseUp = ({ nativeEvent }) => {
    finishDrawing(nativeEvent);
  };

  const onMouseMove = ({ nativeEvent }) => {
    draw(nativeEvent);
  };

  const onMouseLeave = ({ nativeEvent }) => {
    if (selectedTool === "brush") {
      clear(canvasOverlayRef.current);
    }
  };

  return (
    <CanvasContext.Provider
      value={{
        canvasRef,
        canvasOverlayRef,
        contextRef,
        init,
        onMouseDown,
        onMouseUp,
        onMouseMove,
        onMouseLeave,
        clearCanvas,
        selectedTool,
        changeTool,
        setValue,
        saveAsFile,
        resize,
        values: {
          fillColor,
          strokeColor,
          lineWidth,
          useFillColor
        }
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);
