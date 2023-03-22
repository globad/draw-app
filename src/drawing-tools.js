import React, { useState } from "react";
import cn from "classnames";
import { useCanvas } from "./canvas-context";
import { colors, paletteBgColor } from "./constants";

function ToolButton({
  name,
  title,
  symbol,
  symbolClassName,
  selectedTool,
  isVertical,
  onClick
}) {
  return (
    <button
      className={cn("button", { selected: selectedTool === name })}
      title={isVertical ? "" : title}
      onClick={() => onClick(name)}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <span role="img" aria-label={name} className={symbolClassName}>
        {symbol}
      </span>{" "}
      {isVertical && <label>{title}</label>}
    </button>
  );
}

function Color({ color, onClick, onChangeHoverColor }) {
  return (
    <div
      className="color"
      style={{ backgroundColor: color }}
      onMouseUp={({ nativeEvent }) => onClick(color, nativeEvent)}
      onMouseEnter={() => onChangeHoverColor(color)}
      onMouseLeave={() => onChangeHoverColor(paletteBgColor)}
    />
  );
}

export const DrawingToolsPanel = () => {
  const [isVerticalMode, setIsVerticalMode] = useState(true);
  const [hoveringColor, setHoveringColor] = useState(paletteBgColor);
  const {
    clearCanvas,
    changeTool,
    setValue,
    saveAsFile,
    values,
    selectedTool
  } = useCanvas();

  const handleDoubleClick = () => {
    setIsVerticalMode((prevState) => !prevState);
  };

  const handleButtonClick = (tool) => {
    changeTool(tool);
    if (isVerticalMode) {
      setIsVerticalMode(false);
    }
  };

  const handleColorClick = (color, nativeEvent) => {
    const { button } = nativeEvent;
    if (button === 0) {
      setValue("strokeColor", color);
    } else {
      setValue("fillColor", color);
    }
  };

  const handleChangeHoverColor = (color) => {
    setHoveringColor(color);
  };

  return (
    <>
      <div
        className={cn("drawing-tools-container", { vertical: isVerticalMode })}
        onDoubleClick={handleDoubleClick}
        title="Двойной клик переключает положение панели"
      >
        <ToolButton
          name="brush"
          title="Кисть"
          symbol="🖌"
          selectedTool={selectedTool}
          isVertical={isVerticalMode}
          onClick={handleButtonClick}
        />
        <ToolButton
          name="line"
          title="Линия"
          symbol="┃"
          symbolClassName="tool-icon line"
          selectedTool={selectedTool}
          isVertical={isVerticalMode}
          onClick={handleButtonClick}
        />
        <ToolButton
          name="circle"
          title="Круг"
          symbol="⚪"
          selectedTool={selectedTool}
          isVertical={isVerticalMode}
          onClick={handleButtonClick}
        />
        <ToolButton
          name="rectangle"
          title="Прямоугольник"
          symbol="⬜"
          selectedTool={selectedTool}
          isVertical={isVerticalMode}
          onClick={handleButtonClick}
        />
        <ToolButton
          name="eraser"
          title="Ластик"
          symbol="◽"
          selectedTool={selectedTool}
          isVertical={isVerticalMode}
          onClick={handleButtonClick}
        />
        <div className={cn("splitter", { vertical: isVerticalMode })} />
        <div className="input-container vertical">
          {isVerticalMode && <label title="">Толщина линии</label>}
          <input
            className="can-be-clicked"
            title={isVerticalMode ? "" : "Толщина линии"}
            type="range"
            min="1"
            max="50"
            value={values.lineWidth ? values.lineWidth : 5}
            onChange={(e) => setValue("lineWidth", e.target.value)}
            onDoubleClick={(e) => e.stopPropagation()}
          ></input>
        </div>
        <div className="input-container">
          {isVerticalMode && <label title="">Цвет линии</label>}
          <input
            className="can-be-clicked"
            title={isVerticalMode ? "" : "Цвет линии"}
            type="color"
            value={values.strokeColor ? values.strokeColor : "black"}
            onChange={(e) => setValue("strokeColor", e.target.value)}
            onDoubleClick={(e) => e.stopPropagation()}
          ></input>
        </div>
        <div className="input-container">
          {isVerticalMode ? (
            <label
              onClick={() => setValue("useFillColor")}
              onDoubleClick={(e) => e.stopPropagation()}
              className={cn("can-be-clicked", {
                strikethrough: !values.useFillColor
              })}
              title=""
            >
              Цвет заливки
            </label>
          ) : (
            <input
              type="checkbox"
              title="Использовать заливку"
              checked={values.useFillColor}
              onChange={() => setValue("useFillColor")}
              onDoubleClick={(e) => e.stopPropagation()}
            ></input>
          )}
          <input
            className="can-be-clicked"
            title={isVerticalMode ? "" : "Цвет заливки"}
            type="color"
            value={values.fillColor ? values.fillColor : "white"}
            onChange={(e) => setValue("fillColor", e.target.value)}
            onDoubleClick={(e) => e.stopPropagation()}
          ></input>
        </div>
        <div className={cn("splitter", { vertical: isVerticalMode })} />
        <button
          className="button clear-button"
          title={isVerticalMode ? "" : "Очистить"}
          onClick={clearCanvas}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <span role="img" aria-label="clear">
            ❌
          </span>{" "}
          {isVerticalMode && <label>Очистить</label>}
        </button>
        <button
          className="button"
          title={isVerticalMode ? "" : "Сохранить"}
          onClick={saveAsFile}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <span role="img" aria-label="save">
            💾
          </span>{" "}
          {isVerticalMode && <label>Сохранить</label>}
        </button>
      </div>
      <div
        className="palette"
        style={{ backgroundColor: hoveringColor }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {colors.map((color, index) => {
          return (
            <Color
              key={index}
              color={color}
              onClick={handleColorClick}
              onChangeHoverColor={handleChangeHoverColor}
            />
          );
        })}
      </div>
    </>
  );
};
