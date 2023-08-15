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
    setUndoArray
}) => {

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const [ctx, setCtx] = useState(null);
    const [bounds, setBounds] = useState(null);
    let existingLines = []
    // let coordinates = []
    // global variables with default value
    let prevMouseX, prevMouseY, snapshot, startX, startY, mouseX, mouseY
    let activePoint, cursor, dragging = false;
    const mouse = { x: 0, y: 0, button: 0, lx: 0, ly: 0, update: true };

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
        snapshot = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (selectedTool === "polygon") {
            mouse.x = e.pageX - bounds.left;
            mouse.y = e.pageY - bounds.top;
            // mouse.button = false
            mouse.update = true;
            mouse.button = true
            requestAnimationFrame(drawPolygon)
            // drawPolygon(e);
        }
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
        } else if (selectedTool === "circle") {
            drawCircle(e);
        } else if (selectedTool === 'triangle') {
            drawTriangle(e);
        }
        else if (selectedTool === "polygon") {
            mouse.x = e.pageX - bounds.left;
            mouse.y = e.pageY - bounds.top;
            mouse.update = true;
        }
        else if (selectedTool == 'eclipse') {

            let x2 = e.clientX - bounds.left
            let y2 = e.clientY - bounds.top

            /// draw ellipse
            drawEllipse(startX, startY, x2, y2);
        }
    }
    function drawEllipse(x1, y1, x2, y2) {

        var radiusX = (x2 - x1) * 0.5,   /// radius for x based on input
            radiusY = (y2 - y1) * 0.5,   /// radius for y based on input
            centerX = x1 + radiusX,      /// calc center
            centerY = y1 + radiusY,
            step = 0.01,                 /// resolution of ellipse
            a = step,                    /// counter
            pi2 = Math.PI * 2 - step;    /// end angle

        /// start a new path
        ctx.beginPath();

        /// set start point at angle 0
        ctx.moveTo(centerX + radiusX * Math.cos(0),
            centerY + radiusY * Math.sin(0));

        /// create the ellipse    
        for (; a < pi2; a += step) {
            ctx.lineTo(centerX + radiusX * Math.cos(a),
                centerY + radiusY * Math.sin(a));
        }

        /// close it and stroke it for demo
        ctx.closePath();
        ctx.strokeStyle = '#000';
        ctx.stroke();
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
    function poly() {
        return ({
            points: [],
            closed: false,
            addPoint(p) {
                console.log(this.points)
                this.points.push(point(p.x, p.y))
            },
            draw() {
                ctx.lineWidth = 2;
                ctx.strokeStyle = selectedColor;
                ctx.fillStyle = selectedColor;
                ctx.beginPath();
                for (const p of this.points) { ctx.lineTo(p.x, p.y) }
                this.closed && ctx.closePath();
                ctx.stroke();
                this.closed && fillColor ? ctx.fill() : ctx.stroke();

                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                for (const p of this.points) {
                    ctx.beginPath();
                    ctx.moveTo(p.x + 10, p.y);
                    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            },
            closest(pos, dist = 8) {
                var i = 0, index = -1;
                dist *= dist;
                for (const p of this.points) {
                    var x = pos.x - p.x;
                    var y = pos.y - p.y;
                    var d2 = x * x + y * y;
                    if (d2 < dist) {
                        dist = d2;
                        index = i;
                    }
                    i++;
                }
                if (index > -1) { return this.points[index] }
            }
        });
    }
    const point = (x, y) => ({ x, y });

    function drawCircle2(pos, color = "black", size = 8) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.stroke();
    }
    const polygon = poly();
    function drawPolygon() {
        const canvas = canvasRef.current;
        if (mouse.update) {
            cursor = "crosshair";
            canvas.style.cursor = cursor;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            if (!dragging) { 
                activePoint = polygon.closest(mouse)
             }
            if (activePoint === undefined && mouse.button) {
                polygon.addPoint(mouse);
                mouse.button = false;
            } else if (activePoint) {
                if (mouse.button) {
                    if (dragging) {
                        activePoint.x += mouse.x - mouse.lx;
                        activePoint.y += mouse.y - mouse.ly;
                    } else {
                        if (!polygon.closed && polygon.points.length > 2 && activePoint === polygon.points[0]) {
                            polygon.closed = true;
                        }
                        dragging = true
                    }
                } else { dragging = false }
            }
            polygon.draw();
            if (activePoint) {
                drawCircle2(activePoint);
                cursor = "move";
            }
            mouse.lx = mouse.x;
            mouse.ly = mouse.y;
            canvas.style.cursor = cursor;
            mouse.update = false;
        }
        requestAnimationFrame(drawPolygon)

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

    const stopDraw = (e) => {
        mouse.x = e.pageX - bounds.left;
        mouse.y = e.pageY - bounds.top;
        mouse.button = false
        mouse.update = true
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