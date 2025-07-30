import React from 'react'
import { useRef, useEffect, useState } from 'react'
import ToolBar from './ToolBar'


const Canvas = ({ socket }) => {
    const canvasRef = useRef(null);
    const curMousePos = useRef({ x: 0, y: 0 })
    const isDrag = useRef(false);
    const animating = useRef(null);
    const lastpos = useRef({ x: 0, y: 0 })
    const lineWidth = useRef(3);
    const color = useRef('#000000');
    // const [varColor,setVarColor] = useState('#000'); not working
    const curTool = useRef('brush');
    const isPlayer = useRef(null);
    
    
    const maxStates = 20;
    //storing states
    const canvasStates = useRef([]);
    const [isCanvasDisabled, setIsCanvasDisabled] = useState(false);
    const [isDrawingActive, setIsDrawingActive] = useState(false);
    const [remotePaths, setRemotePaths] = useState([]);
    const [words, setWords] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    
    const handleSelection = (e)=>{
        socket.emit('wordSelected',{
            word: e.target.name,
            currentPlayer: socket.id
        })
    }
    useEffect(() => {
        socket.on('init-canvas', (initialState) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            loadCanvasState(ctx, initialState);
            saveCanvasState();
        })
        socket.on('remote-drawing', (drawingData) => {
            if (drawingData.socketId !== socket.id) {
                setRemotePaths(prev => [...prev, drawingData]);
            }
        });

        socket.on('remote-fill', (fillData) => {
            if (fillData.socketId !== socket.id) {
                executeRemoteFill(fillData);
            }
        })
        return () => {
            socket.off('init-canvas');
            socket.off('remote-drawing');
            socket.off('remote-fill');
        }
    }, [socket])


    useEffect(() => {
        if (remotePaths.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Process all pending remote paths
        remotePaths.forEach(pathData => {
            drawRemotePath(ctx, {
                path: pathData.path,
                color: pathData.color,
                lineWidth: pathData.lineWidth
            });
        });

        // Clear processed paths
        setRemotePaths([]);
        saveCanvasState();
    }, [remotePaths]);

    const drawRemotePath = (ctx, { path, color, lineWidth }) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        path.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y)
            } else {
                ctx.lineTo(point.x, point.y)
            }
        });

        ctx.stroke();
    }

    const executeRemoteFill = (fillData) => {

        const tempColor = color.current;
        color.current = fillData.color;

        flood_fill(fillData.x, fillData.y);

        color.current = tempColor;
        saveCanvasState();
    }


    useEffect(() => {

        const clearCanvas = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            canvasStates.current = [];
            saveCanvasState();
        };
        const handleTurnUpdate = (data) => {
            // if (data.currentPlayerSocketId) {
            //     console.log("Current player socket ID:", data.currentPlayerSocketId);
            // }
            // if (socket.id) {
            //     console.log("Socket ID:", socket.id);
            // }
            if (data.currentPlayerSocketId === socket.id) {
                // console.log("match")
                isPlayer.current = true;
                setIsCanvasDisabled(data.isBreak);
                setIsDrawingActive(!data.isBreak);
                socket.emit('clear-canvas');
            }
            else {
                isPlayer.current = false;
                setIsCanvasDisabled(data.isBreak);
                setIsDrawingActive(!data.isBreak);
            }
            // console.log("Turn updated", data);
            if (data.isBreak && isDrawingActive) {
                handleMouseUp();
                isPlayer.current = false;
            }
        }


        socket.on('turnUpdate', handleTurnUpdate)
        socket.on('currentPlayer', (data) => {
            if (data.currentPlayerSocketId === socket.id) {
                isPlayer.current = true;
                setIsCanvasDisabled(data.isBreak);
                setIsDrawingActive(!data.isBreak);
                console.log("You are the current player");
            }else{
                isPlayer.current = false;
            }
        });
        socket.on('selectWord', (data) => {
            if(isPlayer.current){
                const options = data.words;
                setWords(options);
                setIsSelecting(true);
                setIsCanvasDisabled(true);
            }
        })

        socket.on('selectRandomWord', () => {
            if(isPlayer.current){

                setWords([]);
                setIsSelecting(false);
                setIsCanvasDisabled(false);
            }
        })
        socket.on('canvas-cleared', clearCanvas);

        return () => {
            socket.off('turnUpdate', handleTurnUpdate)
            socket.off('currentPlayer');
            socket.off('canvas-cleared');
        }
    }, [socket])

    const saveCanvasState = () => {
        const canvas = canvasRef.current
        const ctx = canvasRef.current.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (canvasStates.current.length > maxStates) {
            canvasStates.current.shift(); // remove oldest
        }
        canvasStates.current.push(imageData);
        // console.log(canvasStates.current);
    };


    const undo = () => {
        if (canvasStates.current.length > 1) {
            canvasStates.current.pop();
            const previousState = canvasStates.current[canvasStates.current.length - 1]

            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d');

            ctx.putImageData(previousState, 0, 0);
            // console.log("✅ Restored from ImageData");
        }
    }

    const handleColorChage = (e) => {
        color.current = e.target.id
        // setVarColor(e.target.id)
    }
    const handleMouseUp = () => {
        setIsDrawingActive(false)
        lastpos.current.x = 0
        lastpos.current.y = 0
        isDrag.current = false
        cancelAnimationFrame(animating.current)
        saveCanvasState();
    }
    const handleMouseLeave = () => {
        setIsDrawingActive(false);
        lastpos.current.x = 0
        lastpos.current.y = 0
        if (isDrag.current) {
            saveCanvasState();
        }
        isDrag.current = false
        cancelAnimationFrame(animating.current)
    }

    const handleMouseDown = (e) => {
        if (isCanvasDisabled) return;
        setIsDrawingActive(true);
        if (isPlayer.current) {
            console.log("Current player, drawing enabled")
            if (curTool.current === 'brush') {
                draw(e);
            }
            else if (curTool.current === 'bucket') {
                const canvas = canvasRef.current
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor(e.x - rect.left);
                const y = Math.floor(e.y - rect.top);
                flood_fill(x, y)
            }
        } // if not current player, do nothing
    }
    const draw = (e) => {
        if (!isPlayer.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        isDrag.current = true
        const rect = canvas.getBoundingClientRect();
        let x = e.x - rect.left;
        let y = e.y - rect.top;

        if (lastpos.current.x === 0 && lastpos.current.y === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineWidth = lineWidth.current;
            ctx.strokeStyle = color.current;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            socket.emit('drawing-start', {
                x, y,
                color: color.current,
                lineWidth: lineWidth.current,
                socketId: socket.id
            })
        }

        lastpos.current.x = x
        lastpos.current.y = y
        animating.current = requestAnimationFrame(animate)
    }
    const flood_fill = (startX, startY) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        //correcting mouse position
        const x = startX
        const y = startY

        // canvas pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data;

        //convert color from hex to RGBA
        const fillColor = hexToRgba(color.current);

        //get target color 
        const targetPos = (y * canvas.width + x) * 4;
        const targetColor = {
            r: data[targetPos],
            g: data[targetPos + 1],
            b: data[targetPos + 2],
            a: data[targetPos + 3]
        };

        // if target color matches fill color do nothing
        if (colorsMatch(targetColor, fillColor)) return;

        //BFS implementation
        const queue = [{ x: x, y: y }];
        const width = canvas.width
        const height = canvas.height

        while (queue.length) {
            const { x, y } = queue.shift();
            const pos = (y * width + x) * 4;

            //if pixel within bounds and matches target color
            if (
                x < 0 || x >= width ||
                y < 0 || y >= height ||
                !colorsMatch(
                    {
                        r: data[pos],
                        g: data[pos + 1],
                        b: data[pos + 2],
                        a: data[pos + 3],
                    },
                    targetColor
                )
            ) {
                continue;
            }

            //set pixel color
            data[pos] = fillColor.r;
            data[pos + 1] = fillColor.g;
            data[pos + 2] = fillColor.b;
            data[pos + 3] = fillColor.a !== undefined ? fillColor.a : 255;

            // add neighbouring pixels to queue
            queue.push({ x: x + 1, y })
            queue.push({ x: x - 1, y })
            queue.push({ x, y: y + 1 })
            queue.push({ x, y: y - 1 })
        }
        ctx.putImageData(imageData, 0, 0);

        if (isPlayer.current) {
            socket.emit('fill', {
                x: startX,
                y: startY,

                color: color.current,
                socketId: socket.id
            })
        }

        saveCanvasState();
    }

    const hexToRgba = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    const colorsMatch = (color1, color2) => {
        return (
            // absolute check
            // color1.r === color2.r &&
            // color1.g === color2.g &&
            // color1.b === color2.b &&
            // (color1.a === undefined || color2.a === undefined || color1.a === color2.a)

            //tolerance
            Math.abs(color1.r - color2.r) < 5 &&
            Math.abs(color1.g - color2.g) < 5 &&
            Math.abs(color1.b - color2.b) < 5 &&
            // const alphaMatch = Math.abs((color1.a || 255) - (color2.a || 255)) <= alphaTolerance;
            Math.abs((color1.a || 255) - (color2.a || 255)) <= 5
        )
    }

    // moved animate function outside of event listener
    const animate = () => {
        if (!isDrag.current) return; // Don't animate if not dragging

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = curMousePos.current;

        ctx.lineWidth = lineWidth.current;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = color.current;
        // ctx.strokeStyle = varColor;
        ctx.beginPath();
        ctx.moveTo(lastpos.current.x, lastpos.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        socket.emit('drawing-move', {
            from: lastpos.current,
            to: { x, y },
            color: color.current,
            lineWidth: lineWidth.current,
            socketId: socket.id
        })

        // Update last position
        lastpos.current.x = x;
        lastpos.current.y = y;

        // Continue animation
        animating.current = requestAnimationFrame(animate);
    };

    const loadCanvasState = (ctx, imageData) => {
        if (imageData) {
            ctx.putImageData(imageData, 0, 0);
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    const handleMouseMove = (e) => {
        if (isCanvasDisabled) return;
        const rect = canvasRef.current.getBoundingClientRect();
        curMousePos.current.x = e.x - rect.left;
        curMousePos.current.y = e.y - rect.top;
    }
    // after calling request animation frame we need to cancel the canimation to stop it from drawing.
    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth / 2.5;
        canvas.height = window.innerHeight / 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        canvasStates.current = [];
        saveCanvasState();

        canvas.addEventListener('mousemove',
            (e) => {

                handleMouseMove(e)
            })

        canvas.addEventListener('mousedown', (e) => {
            handleMouseDown(e)
        })

        canvas.addEventListener('mouseup',
            handleMouseUp
        )


        canvas.addEventListener('mouseleave',
            handleMouseLeave
        )
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown)
            canvas.removeEventListener('mouseup', handleMouseUp)
            canvas.removeEventListener('mouseleave', handleMouseLeave)
            canvas.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <>
            <div className='flex flex-col items-center justify-center gap-1 w-1/2 m-auto relative'>
                <canvas className='border-2 border-red-500' ref={canvasRef} style={{ opacity: isCanvasDisabled ? 0.5 : 1 }}></canvas>
                {isCanvasDisabled && !isSelecting && (
                    <div className='absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center'>
                        <span className='text-white text-4xl font-bold'>BREAK</span>
                    </div>
                )}
                {isCanvasDisabled && isSelecting && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='absolute bg-black opacity-25 text-white'></div>
                        {words.length !== 0? (
                            <div className='flex gap-3 m-auto'>{
                            words.map((word,i)=>{
                                return <button type='button' key={i} onClick={(e)=>{handleSelection(e)}} name={word} className='px-2 py-1 border-2 border-white white text-white'>{word}</button>})}
                            </div>
                        ):(<div>Waiting...</div>)}
                        </div>
                    )
                }
                {
                    isPlayer.current && (
                        <ToolBar handleColorChage={handleColorChage} undo={undo} lineWidth={lineWidth} curTool={curTool} color={color} />
                    )
                }
            </div>
        </>
    )
}

export default Canvas

