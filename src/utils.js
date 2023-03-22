export function calculateLength(startX, startY, endX, endY) {
  const dx = endX - startX;
  const dy = endY - startY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateWidthAndHeight(startX, startY, endX, endY) {
  const dx = endX - startX;
  const dy = endY - startY;
  return { width: dx, height: dy };
}

export function prepareCanvas(canvas, params) {
  const { lineWidth, fillColor, strokeColor } = params;
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  const context = canvas.getContext("2d");
  context.scale(2, 2);
  context.lineCap = "round";
  clear(canvas, fillColor);
  context.strokeStyle = strokeColor;
  context.lineWidth = lineWidth;

  return context;
}

export function clear(canvas, fillColor) {
  const context = canvas.getContext("2d");
  if (fillColor) {
    context.beginPath();
    context.fillStyle = "rgb(255, 255, 255)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.closePath();
    context.fillStyle = fillColor;
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}

export const hex2rgba = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

export const drawSmooth = (context, params) => {
  const { x, y, lineWidth, fillColor, strokeColor, isMainButton } = params;
  context.closePath();
  context.beginPath();
  context.lineWidth = 1;
  context.arc(x, y, lineWidth / 2, 0, 2 * Math.PI, false);
  context.strokeStyle = isMainButton ? strokeColor : fillColor;
  context.fillStyle = isMainButton ? strokeColor : fillColor;
  context.fill();
  context.stroke();
  context.strokeStyle = strokeColor;
  context.fillStyle = fillColor;
  context.lineWidth = lineWidth;
};

export function getPointsOnLine(startX, startY, endX, endY, number) {
  const dx = endX - startX;
  const dy = endY - startY;

  const points = [];
  for (let i = 0; i < number; i++) {
    const t = i / (number - 1);
    const x = startX + dx * t;
    const y = startY + dy * t;
    points.push([x, y]);
  }

  return points;
}

export function drawBrushStroke(params) {
  const {
    lineWidth,
    fillColor,
    strokeColor,
    isMainButton,
    lastCoord,
    offsetX,
    offsetY,
    context
  } = params;
  if (lineWidth > 8) {
    const length = calculateLength(
      lastCoord[0],
      lastCoord[1],
      offsetX,
      offsetY
    );
    if (length > 10) {
      const points = getPointsOnLine(
        lastCoord[0],
        lastCoord[1],
        offsetX,
        offsetY,
        length - 2
      );
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        drawSmooth(context, {
          x: point[0],
          y: point[1],
          lineWidth,
          fillColor,
          strokeColor,
          isMainButton
        });
      }
    } else {
      drawSmooth(context, {
        x: offsetX,
        y: offsetY,
        lineWidth,
        fillColor,
        strokeColor,
        isMainButton
      });
    }
  } else {
    context.strokeStyle = isMainButton ? strokeColor : fillColor;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  }
}

export function drawCursor(params) {
  const {
    lineWidth,
    fillColor,
    strokeColor,
    selectedTool,
    offsetX,
    offsetY,
    context
  } = params;

  const halfLength = Math.round(lineWidth / 2);
  context.strokeStyle = hex2rgba(strokeColor, 0.9);
  context.lineWidth = 1;
  if (selectedTool === "eraser") {
    context.setLineDash([5, 5]);
  }
  context.beginPath();
  context.arc(offsetX, offsetY, halfLength, 0, 2 * Math.PI, false);
  context.stroke();
  context.closePath();
  if (selectedTool === "eraser") {
    context.beginPath();
    context.strokeStyle = fillColor;
    context.arc(offsetX, offsetY, halfLength, 0, 2 * Math.PI, false);
    context.stroke();
  }

  context.lineWidth = lineWidth;
  context.setLineDash([]);
}

export function saveFile(data, filename) {
  const a = document.createElement("a");
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 0);
}

export function resizeCanvas(canvas, params) {
  const context = canvas.getContext("2d");

  if (
    canvas.width < window.innerWidth * 2 ||
    canvas.height < window.innerHeight * 2
  ) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const ctx = prepareCanvas(canvas, params);
    ctx.putImageData(imageData, 0, 0);
    return ctx;
  }

  return context;
}
