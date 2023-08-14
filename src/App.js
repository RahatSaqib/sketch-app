
import './App.css';
import Canvas from './components/Canvas';
import { useState } from 'react';
import { SketchPicker } from "react-color";


function App() {
  const [fillColor, setFillColor] = useState(false)
  const [selectedTool, setSelectedTool] = useState('brush')
  const [brushWidth, setBrushWidth] = useState(5)
  const [selectedColor, setSelectedColor] = useState('#000')
  const [clearCanvas, setClearCanvas] = useState(false)
  const [saveCanvas, setSaveCanvas] = useState('no')
  const [undoArray , setUndoArray] = useState([])
  const [redoArray , setRedoArray] = useState([])
  const [coordinates , setCoordinates] = useState([])

  function toolChangeClicked(e, tool) {
    // removing active class from the previous option and adding on current clicked option
    document.querySelector(".options .active").classList.remove("active");
    document.getElementById(tool).classList.add("active");
    setSelectedTool(tool)
  }

  function colorChangeClicked(e) {
    setSelectedColor(e.hex)
  }

  function clearCanvasClicked() {
    setClearCanvas(!clearCanvas)
  }

  function saveCanvasClicked() {
    setSaveCanvas('save')
  }

  return (
    <div className="App">
      <div className="container">
        <section className="tools-board">
          <div className="row">
            <label className="title">Shapes</label>
            <ul className="options">
              <li className="option tool" id="rectangle" onClick={(e) =>  toolChangeClicked(e, 'rectangle')} >
                <img src="icons/rectangle.svg" alt="" />
                <span>Rectangle</span>
              </li>
              <li className="option tool" id="circle" onClick={(e) => toolChangeClicked(e, 'circle')} >
                <img src="icons/circle.svg" alt="" />
                <span>Circle</span>
              </li>
              <li className="option tool" id="triangle" onClick={(e) => toolChangeClicked(e, 'triangle')} >
                <img src="icons/triangle.svg" alt="" />
                <span>Triangle</span>
              </li>
              <li className="option tool" id="straight-line" onClick={(e) => toolChangeClicked(e, 'straight-line')} >
                <img src="icons/straight.svg" alt="" />
                <span>Straight Line</span>
              </li>
              <li className="option tool" id="polygon" onClick={(e) => toolChangeClicked(e, 'polygon')} >
                <img src="icons/polygon.svg" alt="" />
                <span>Polygon</span>
              </li>
              <li className="option">
                <input type="checkbox" id="fill-color" onChange={(e) => setFillColor(e.target.checked)} />
                <label htmlFor="fill-color">Fill color</label>
              </li>
            </ul>
          </div>
          <div className="row">
            <label className="title">Options</label>
            <ul className="options">
              <li className="option active tool" id="brush" onClick={(e) => toolChangeClicked(e, 'brush')} >
                <img src="icons/brush.svg" alt="" />
                <span>Brush</span>
              </li>
              <li className="option tool" id="eraser" onClick={(e) => toolChangeClicked(e, 'eraser')} >
                <img src="icons/eraser.svg" alt="" />
                <span>Eraser</span>
              </li>
              <li className="option">
                <input type="range" id="size-slider" min="1" max="30" value={brushWidth} onChange={(e) => setBrushWidth(e.target.value)} />
              </li>
            </ul>
          </div>
          <div className="row colors">
            <label className="title">Colors</label>
            <SketchPicker
              color={selectedColor}
              onChange={colorChangeClicked}>

            </SketchPicker>

          </div>
          <div className="row buttons">
            <button className="clear-canvas" onClick={clearCanvasClicked}>Clear Canvas</button>
            <button className="save-img" onClick={saveCanvasClicked}>Save As Image</button>
          </div>
        </section>
        <section className="drawing-board">
          <Canvas
            height={100}
            width={700}
            fillColor={fillColor}
            selectedTool={selectedTool}
            brushWidth={brushWidth}
            selectedColor={selectedColor}
            clearCanvas={clearCanvas}
            saveCanvas={saveCanvas}
            setSaveCanvas={setSaveCanvas}
            undoArray={undoArray}
            setUndoArray={setUndoArray} 
            redoArray={redoArray}
            setRedoArray={setRedoArray}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
          ></Canvas>
        </section>
      </div>
    </div>
  );
}

export default App;
