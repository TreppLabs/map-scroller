"use client"; 
import React,  { useState } from "react";
import internal from "stream";

  // hash function from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
  // generates reasonably "random" integers from the given string
  // useful for seeding our PRNG
  function cyrb128(str:string):[number, number, number, number] {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

// also from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
// generates a PRNG function from the given seed
// could be a bit more random-y and longer period, see reference above if needed
function mulberry32(a:number):()=>number {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

  // Function to generate "mixed deterministic" not-really-random colors
  function getXYColor(x:number, y:number) {
    const rands = cyrb128(x.toString() + "_" + y.toString());
    let value = rands[0] & 0xFFFFFF;
    // Convert the integer to a hex string and pad with zeros if necessary
    const hexString: string = '#' + value.toString(16).padStart(6, '0');
    return hexString;
  }

  function getBlobbyXYColor(x:number, y:number) {
    // get nearest x and y that are multiples of 10
    const nearbyX = Math.floor(x / 10) * 10;
    const nearbyY = Math.floor(y / 10) * 10;
    const rands = cyrb128(x.toString() + "_" + y.toString());
    const nearRands = cyrb128(nearbyX.toString() + "_" + nearbyY.toString());
    // average the two random numbers
    //  const rand = (rands[0] + nearRands[0]) / 2;

    // take the cell itself
    // const r = Math.floor(rands[0] & 0xFF);
    // const g = Math.floor(rands[1] & 0xFF);
    // const b = Math.floor(rands[2] & 0xFF);

    // take the nearest cell that is multiple of 10
    // const r = Math.floor(nearRands[0] & 0xFF);
    // const g = Math.floor(nearRands[1] & 0xFF);
    // const b = Math.floor(nearRands[2] & 0xFF);

    // average cell and nearest cell that is multiple of 10 r, g, b separately
    const r = Math.floor((rands[0] & 0xFF + nearRands[0] & 0xFF) / 2);
    const g = Math.floor((rands[1] & 0xFF + nearRands[1] & 0xFF) / 2);
    const b = Math.floor((rands[2] & 0xFF + nearRands[2] & 0xFF) / 2);


    // create color string from r,g,b
    // console.log("r: " + r.toString(16).padStart(2, '0') + " g: " + g.toString(16).padStart(2, '0') + " b: " + b.toString(16).padStart(2, '0'));
    const colorString = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    // console.log("colorString: " + colorString);
    return colorString;
    // const rand = nearRands[0];
    // let value = rand & 0xFFFFFF;
    // // Convert the integer to a hex string and pad with zeros if necessary
    // const hexString: string = '#' + value.toString(16).padStart(6, '0');
    // return hexString;
  }

  // seed PRNG so we'll get the same "random" colors every time
  var seed = cyrb128("apples");
  var rand = mulberry32(seed[0]);
  var randIntegerInRange = (min:number, max:number) => Math.floor(rand() * (max - min + 1)) + min;
  // console.log("rand sample: " + rand());
  // console.log("rand sample: " + rand());
  // console.log("rand sample: " + rand());
  // NOTE: we don't actually use rand() yet, we're using our hash cyrb128() function instead


interface FlagComponentProps {
  flagSize: number;
}

const FlagComponent: React.FC<FlagComponentProps> = ({ flagSize }) => {

  const flags = Array.from({ length: 10 }, (_, rowIndex) =>
      Array.from({ length: 10 }, (_, colIndex) => {
        const randomOrientation = Math.floor(Math.random() * 4);
        if (randomOrientation === 0) {
          return (
            `<svg width=${flagSize} height=${flagSize} xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,0 ${flagSize},0 0,${flagSize}" fill="white" />
              <polygon points="${flagSize},0 ${flagSize},${flagSize} 0,${flagSize}" fill="gray" />
            </svg>`
          );
        } else if (randomOrientation === 1) {
          return (
            `<svg width=${flagSize} height=${flagSize} xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,0 ${flagSize},${flagSize} 0,${flagSize}" fill="white" />
              <polygon points="0,0 ${flagSize},0 ${flagSize},${flagSize}" fill="grey" />
            </svg>`
          );
        } else if (randomOrientation === 2) {
          return (
            `<svg width=${flagSize} height=${flagSize} xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,0 ${flagSize},0 0,${flagSize}" fill="gray" />
              <polygon points="${flagSize},0 ${flagSize},${flagSize} 0,${flagSize}" fill="white" />
            </svg>`
          );
        } else {
          return (
            `<svg width=${flagSize} height=${flagSize} xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,0 ${flagSize},${flagSize} 0,${flagSize}" fill="grey" />
              <polygon points="0,0 ${flagSize},0 ${flagSize},${flagSize}" fill="white" />
            </svg>`
          );
        }
      })
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(10, ${flagSize}px)`, gap: '2px' }}>
      {flags.map((row, rowIndex) =>
        row.map((svgString, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} dangerouslySetInnerHTML={{ __html: svgString }} />
        ))
      )}
    </div>
  );
};


interface MapCellProps {xPos: number, yPos: number, xCells: number, yCells: number}

const RegionalMap: React.FC<MapCellProps> = ({ xPos, yPos, xCells, yCells }) => {
  const color = getBlobbyXYColor(xPos, yPos);
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <rect
        key={xPos.toString() + '-' + yPos.toString()}
        width={22}
        height={22}
        fill={color}
        stroke="gray"
        strokeWidth="0.1"
        rx={2}
        ry={2}
      />
    </svg>
  );
};

const MyComponent: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const handleButtonClick = () => {
    setClickCount((prev) => prev + 1);
  };
  const handleXButtonClick = () => {
    setX((x) => x + 1);
  };
  const handleYButtonClick = () => {
    setY((y) => y + 1);
  };

  return (
    <div>
      <button onClick={handleXButtonClick} className="border border-white rounded p-2 mt-2 text-white">
        Increase X
      </button>
      <button onClick={handleYButtonClick} className="border border-white rounded p-2 mt-2 text-white">
        Increase Y
      </button>

      {/* Render the SVGComponent with the current clickCount */}
      <RegionalMap xPos ={x} yPos = {y} xCells = {10} yCells = {10}/>
    </div>
  );
};



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
        const color = getBlobbyXYColor(x,y);
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
      <MyComponent />
      <FlagComponent flagSize={30}/>
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
