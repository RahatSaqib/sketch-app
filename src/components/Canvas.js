import { useRef, useState, useEffect } from 'react';

const Canvas = ({
    width,
    height,
    selectedTool,
    fillColor,
    brushWidth,
    selectedColor,
    clearCanvas,
    saveCanvas,
    setSaveCanvas,
    undoArray,
    redoArray,
    setRedoArray,
    setUndoArray,
    coordinates,
    setCoordinates
}) => {

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const [ctx, setCtx] = useState(null);
    const [bounds, setBounds] = useState(null);
    let existingLines = []
    // let coordinates = []
    // global variables with default value
    let prevMouseX, prevMouseY, snapshot, startX, startY, mouseX, mouseY
    const startDraw = (e) => {
        isDrawingRef.current = true;
        prevMouseX = e.nativeEvent.offsetX; // passing current mouseX position as prevMouseX value
        prevMouseY = e.nativeEvent.offsetY; // passing current mouseY position as prevMouseY value
        ctx.beginPath(); // creating new path to draw
        ctx.lineWidth = brushWidth; // passing brushSize as line width
        ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
        ctx.fillStyle = selectedColor; // passing selectedColor as fill style
        // copying canvas data & passing as snapshot value.. this avoids dragging the image
        startX = e.nativeEvent.clientX - bounds.left;
        startY = e.nativeEvent.clientY - bounds.top;
        if (coordinates.length < 10) {
            coordinates.push({ x: startX, y: startY })
            setCoordinates(coordinates)
        }
        snapshot = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    const drawing = (e) => {
        if (!isDrawingRef.current) return; // if isDrawing is false return from here

        ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas

        if (selectedTool === "brush" || selectedTool === "eraser") {
            // if selected tool is eraser then set strokeStyle to white 
            // to paint white color on to the existing canvas content else set the stroke color to selected color
            ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); // creating line according to the mouse pointer
            ctx.stroke(); // drawing/filling line with color
        } else if (selectedTool === "rectangle") {
            drawRect(e);
        } else if (selectedTool === "straight-line") {
            mouseX = e.nativeEvent.clientX - bounds.left;
            mouseY = e.nativeEvent.clientY - bounds.top;
            drawStraightLine(e);
        } else if (selectedTool === "polygon") {
            drawPolygon(e);
        } else if (selectedTool === "circle") {
            drawCircle(e);
        } else {
            drawTriangle(e);
        }
    }
    const drawRect = (e) => {
        // if fillColor isn't checked draw a rect with border else draw rect with background
        if (!fillColor) {
            // creating circle according to the mouse pointer
            return ctx.strokeRect(e.nativeEvent.offsetX, e.nativeEvent.offsetY, prevMouseX - e.nativeEvent.offsetX, prevMouseY - e.nativeEvent.offsetY);
        }
        ctx.fillRect(e.nativeEvent.offsetX, e.nativeEvent.offsetY, prevMouseX - e.nativeEvent.offsetX, prevMouseY - e.nativeEvent.offsetY);
    }

    const drawStraightLine = (e) => {
        // if fillColor isn't checked draw a rect with border else draw rect with background
        for (var i = 0; i < existingLines.length; ++i) {
            var line = existingLines[i];
            ctx.moveTo(line.startX, line.startY);
            ctx.lineTo(line.endX, line.endY);
        }

        ctx.stroke();
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = brushWidth;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
    }

    const drawCircle = (e) => {
        ctx.beginPath(); // creating new path to draw circle
        // getting radius for circle according to the mouse pointer
        let radius = Math.sqrt(Math.pow((prevMouseX - e.nativeEvent.offsetX), 2) + Math.pow((prevMouseY - e.nativeEvent.offsetY), 2));
        ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); // creating circle according to the mouse pointer
        fillColor ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill circle else draw border circle
    }

    const drawTriangle = (e) => {
        ctx.beginPath(); // creating new path to draw circle
        ctx.moveTo(prevMouseX, prevMouseY); // moving triangle to the mouse pointer
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); // creating first line according to the mouse pointer
        ctx.lineTo(prevMouseX * 2 - e.nativeEvent.offsetX, e.nativeEvent.offsetY); // creating bottom line of triangle
        ctx.closePath(); // closing path of a triangle so the third line draw automatically
        fillColor ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill triangle else draw border
    }

    function drawPolygon(e) {
        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(coordinates[0].x, coordinates[0].y);
        for (let index = 1; index < coordinates.length; index++) {
            ctx.lineTo(coordinates[index].x, coordinates[index].y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    function undoDraw() {
        let undoIndex = undoArray.length - 1
        if (undoIndex <= 0) {
            clearCanvasFunc()
        }
        else {
            undoIndex -= 1
            let lastImageData = undoArray.pop()
            setRedoArray([...redoArray, lastImageData])
            ctx.putImageData(undoArray[undoIndex], 0, 0)
            setUndoArray(undoArray)
        }
    }

    function redoDraw() {
        if (redoArray.length) {
            let undoIndex = undoArray.length - 1
            undoIndex += 1
            let lastImageData = redoArray.pop()
            setUndoArray([...undoArray, lastImageData])
            ctx.putImageData(lastImageData, 0, 0)
            setRedoArray(redoArray)
        }
    }

    const clearCanvasFunc = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        context.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
        setCanvasBackground(canvas, context);
        setUndoArray([])
        setRedoArray([])
    }

    const stopDraw = () => {
        if (isDrawingRef.current) {

            ctx.stroke()
            ctx.closePath()
            isDrawingRef.current = false
            existingLines.push({
                startX: startX,
                startY: startY,
                endX: mouseX,
                endY: mouseY
            });
            // setExistingLines(existingLines)
            undoArray.push(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height))
            setUndoArray(undoArray)
        }

    }
    const setCanvasBackground = (canvas, context) => {
        // setting whole canvas background to white, so the downloaded img background will be white
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d")
        setCtx(canvas.getContext("2d"))
        // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        let bounds = canvas.getBoundingClientRect();
        setBounds(bounds)
        setCanvasBackground(canvas, context);

    }, []);

    useEffect(() => {
        clearCanvasFunc()
    }, [clearCanvas])

    useEffect(() => {
        if (saveCanvas == 'save') {

            const canvas = canvasRef.current;
            const link = document.createElement("a"); // creating <a> element
            link.download = `${Date.now()}.jpg`; // passing current date as link download value
            link.href = canvas.toDataURL(); // passing canvasData as link href value
            link.click(); // clicking link to download image
            setSaveCanvas('no')
        }
    }, [saveCanvas])


    return (
        <div style={{
            width: width,
            height: "800px"
        }}>
            <button className='undo-canvas' onClick={undoDraw}>Undo</button>
            <button className='undo-canvas' onClick={redoDraw}>Redo</button>
            <canvas
                width={width}
                height={height}
                onMouseDown={startDraw}
                onMouseUp={stopDraw}
                onMouseOut={stopDraw}
                onMouseMove={drawing}
                style={canvasStyle}
                ref={canvasRef}
            />
        </div>

    );

}

export default Canvas;

const canvasStyle = {
    border: "1px solid black"
}