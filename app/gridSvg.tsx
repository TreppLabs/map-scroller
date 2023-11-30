
import React from "react";

function GridSVG() {
  const svgWidth = 310;
  const svgHeight = 310;
  const gridWidth = 100;
  const gridHeight = 100;
  const centralWidth = gridWidth / 3;
  const centralHeight = gridHeight / 3;
  const squareSize = 2.8;
  const spacing = 3;
  const borderRounding = 0.4;
  const padding = 5;

  // Function to generate the grid of squares with random colors and borders
  const renderGrid = () => {
    const gridElements = [];
    for (let x = 0; x < centralWidth; x++) {
      for (let y = 0; y < centralHeight; y++) {
        const color = getRandomColor();
        const xPos = x * spacing + padding;
        const yPos = y * spacing + padding;
        gridElements.push(
          <rect
            key={x * centralHeight + y}
            x={xPos.toString()}
            y={yPos.toString()}
            width={squareSize}
            height={squareSize}
            fill={color}
            stroke="gray"
            strokeWidth="0.1"
            rx={borderRounding}
            ry={borderRounding}
          />
        );
      }
    }
    return gridElements;
  };

  // Function to generate random colors
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div>
      <svg
        id="grid"
        width={svgWidth / 3}
        height={svgHeight / 3}
        viewBox={`0 0 ${centralWidth * spacing + 2 * padding} ${centralHeight * spacing + 2 * padding}`}>
        {renderGrid()}
      </svg>
    </div>
  );
}

export default GridSVG;
