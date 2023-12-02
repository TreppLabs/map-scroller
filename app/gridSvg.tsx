"use client"; 
import React,  { useState } from "react";
import internal from "stream";

function GridSVG() {
  const gridCols = 100;
  const gridRows = 100;
  const svgWidth = 300;
  const svgHeight = 300;
  const squareSize = 12;
  const squareSpacing = 3;
  const borderRounding = 1;

  // Function to generate the grid of squares with random colors and borders
  const renderGrid = () => {
    const gridElements = [];
    for (let x = 0; x < gridCols; x++) {
      for (let y = 0; y < gridRows; y++) {
        const color = getNewXYColor(x,y);
        const xPos = x * (squareSize + squareSpacing);
        const yPos = y * (squareSize + squareSpacing);
        gridElements.push(
          <rect
            key={x * gridCols + y}
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

  // Function to generate "mixed deterministic" not-really-random colors
  function getXYColor(x:number, y:number) {
    // spread the (gridRows*gridCols) boxes across the (256^3)-color spectrum
    const letters = "0123456789ABCDEF";
    // convert box to a number
    const boxNum = x*gridCols + y;
    const numColors = 256*256*256;
    // convert boxNum to a color number, "random" across the 24-bit color spectrum
    const biggishPrime = 1495553872933; // from https://bigprimes.org/
    const bigColorNum = boxNum * biggishPrime;
    const colorNumber = bigColorNum % numColors;
    let value = colorNumber & 0xFFFFFF;
    // Convert the integer to a hex string and pad with zeros if necessary
    const hexString: string = '#' + value.toString(16).padStart(6, '0');
    return hexString;
  }

  // hashString and randomIntWithinRange are from ChatGPT and look kinda goofy, probably better to take soemthing from:
  //     https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
  function hashString(str) {
    let hash = 0;
  
    if (str.length === 0) return hash;
  
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
  
    return hash;
  }
  
  function randomIntWithinRange(seed:number, min:number, max:number) {
    const hashedSeed = hashString(String(seed));
    const normalizedSeed = (hashedSeed % 1000) / 1000; // Normalize to [0, 1)
    const range = max - min + 1;
  
    return Math.floor(normalizedSeed * range) + min;
  }  

  // Function to generate "mixed deterministic" not-really-random colors
  // replace the above with something that uses a reasonable hash function
  function getNewXYColor(x:number, y:number) {
    const firstTwelveBits = randomIntWithinRange(x, 0, 4095);
    const secondTwelveBits = randomIntWithinRange(y, 0, 4095);
    const colorNumber = (firstTwelveBits << 12) + secondTwelveBits;
    let value = colorNumber & 0xFFFFFF;
    // Convert the integer to a hex string and pad with zeros if necessary
    const hexString: string = '#' + value.toString(16).padStart(6, '0');
    console.log(`x=${x}, y=${y}, firstTwelveBits=${firstTwelveBits}, secondTwelveBits=${secondTwelveBits}, colorNumber=${colorNumber}, hexString=${hexString}`)
    return hexString;
  }


  const [viewBoxX, setViewBoxX] = useState(0);
  const [viewBoxY, setViewBoxY] = useState(0);
  const [viewBoxWidth, setViewBoxWidth] = useState(100);
  const [viewBoxHeight, setViewBoxHeight] = useState(100);
  
  const [offLeftBoundary, setOffLeftBoundary] = useState(false);
  const [offRightBoundary, setOffRightBoundary] = useState(false);
  const [offTopBoundary, setOffTopBoundary] = useState(false);
  const [offBottomBoundary, setOffBottomBoundary] = useState(false);
  
  const testBoundaries = () => {
    console.log(`testing: offLeftBoundary=${offLeftBoundary}, offRightBoundary=${offRightBoundary}, offTopBoundary=${offTopBoundary}, offBottomBoundary=${offBottomBoundary}`)
    setOffLeftBoundary(viewBoxX < 0 ? true : false)
    setOffRightBoundary(viewBoxX + viewBoxWidth >= (gridCols * (squareSize+squareSpacing)) ? true : false)
    setOffTopBoundary(viewBoxY < 0 ? true : false)
    setOffBottomBoundary(viewBoxY + viewBoxHeight >= (gridRows * (squareSize+squareSpacing)) ? true : false)
    console.log(`done testing: offLeftBoundary=${offLeftBoundary}, offRightBoundary=${offRightBoundary}, offTopBoundary=${offTopBoundary}, offBottomBoundary=${offBottomBoundary}`)
  }

  const handleUpButtonClick = () => {setViewBoxY(prevY => prevY - (0.1 * viewBoxHeight));testBoundaries();}
  const handleDownButtonClick = () => {setViewBoxY(prevY => prevY + (0.1 * viewBoxHeight));testBoundaries();}
  const handleLeftButtonClick = () => {setViewBoxX(prevX => prevX - (0.1 * viewBoxWidth));testBoundaries();}
  const handleRightButtonClick = () => {setViewBoxX(prevX => prevX + (0.1 * viewBoxWidth));testBoundaries();}
  const handleZoomInButtonClick = () => {
    setViewBoxWidth(prevWidth => prevWidth * 0.8)
    setViewBoxHeight(prevHeight => prevHeight * 0.8)
    testBoundaries();
  }
  const handleZoomOutButtonClick = () => {
    setViewBoxWidth(prevWidth => prevWidth * 1.25);
    setViewBoxHeight(prevHeight => prevHeight * 1.25)
    testBoundaries();   
  }


  return (
    <div>
      <svg
        id="grid"
        width={svgWidth}
        height={svgHeight}
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}>
        {renderGrid()}
      </svg>
      <div className="flex justify-between">
        <button
          onClick={handleLeftButtonClick}
          disabled={offLeftBoundary}
          className={`border border-white rounded p-2 mt-2 text-white ${
            offLeftBoundary ? 'bg-gray-300 cursor-not-allowed' : ''
          }`}
        >
          left
        </button>
        <button
          onClick={handleRightButtonClick}
          disabled={offRightBoundary}
          className={`border border-white rounded p-2 mt-2 text-white ${
            offRightBoundary ? 'bg-gray-300 cursor-not-allowed' : '' 
          }`}
        >
          right
        </button>
        <button
          onClick={handleUpButtonClick}
          disabled={offTopBoundary}
          className={`border border-white rounded p-2 mt-2 text-white ${
            offTopBoundary ? 'bg-gray-300 cursor-not-allowed' : '' 
          }`}
        >
          up
        </button>
        <button
          onClick={handleDownButtonClick}
          disabled={offBottomBoundary}
          className={`border border-white rounded p-2 mt-2 text-white ${
            offBottomBoundary ? 'bg-gray-300 cursor-not-allowed' : '' 
          }`}
          >
            down
          </button>
        <button
          onClick={handleZoomOutButtonClick}
          disabled={offRightBoundary&&offLeftBoundary&&offTopBoundary&&offBottomBoundary}
          className={`border border-white rounded p-2 mt-2 text-white ${
            offRightBoundary&&offLeftBoundary&&offTopBoundary&&offBottomBoundary ? 'bg-gray-300 cursor-not-allowed' : '' 
          }`}
        >
          out
        </button>
        <button
          onClick={handleZoomInButtonClick}
          className={`border border-white rounded p-2 mt-2 text-white`}
        >
          in
        </button>
      </div>
    </div>
    
  );
}

export default GridSVG;
