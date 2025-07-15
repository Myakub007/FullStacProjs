import React from 'react'
import { useRef, useEffect, useState } from 'react'


const Canvas = () => {
    const canvasRef = useRef(null);
    const curMousePos = useRef({ x: 0, y: 0 })
    const isDrag = useRef(false);
    const animating = useRef(null);
    const lastpos = useRef({ x: 0, y: 0 })
    const lineWidth = useRef(3);
    const color = useRef('#000000');
    // const [varColor,setVarColor] = useState('#000'); not working
    const curTool = useRef('brush');


    const maxStates = 20;
    //storing states
    const canvasStates = useRef([]);

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
        lastpos.current.x = 0
        lastpos.current.y = 0
        isDrag.current = false
        cancelAnimationFrame(animating.current)
        saveCanvasState();
    }
    const handleMouseLeave = () => {
        lastpos.current.x = 0
        lastpos.current.y = 0
        if (isDrag.current) {
            saveCanvasState();
        }
        isDrag.current = false
        cancelAnimationFrame(animating.current)
    }

    const handleMouseDown = (e) => {
        if (curTool.current === 'brush') {
            draw(e);
        }
        else if (curTool.current === 'bucket') {
            flood_fill(e.x, e.y)
        }
    }
    const draw = (e) => {
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        isDrag.current = true
        const rect = canvas.getBoundingClientRect();
        let x = e.x - rect.left;
        let y = e.y - rect.top;
        lastpos.current.x = x
        lastpos.current.y = y
        animating.current = requestAnimationFrame(animate)
    }
    const flood_fill = (startX, startY) => {
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        //correcting mouse position
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(startX - rect.left);
        const y = Math.floor(startY - rect.top);

        // canvas pixel data
        const imageData = c.getImageData(0, 0, canvas.width, canvas.height)
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
        c.putImageData(imageData, 0, 0);
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
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        if (!isDrag.current) return; // Don't animate if not dragging

        const { x, y } = curMousePos.current;

        c.lineWidth = lineWidth.current;
        c.lineJoin = 'round';
        c.lineCap = 'round';
        c.strokeStyle = color.current;
        // c.strokeStyle = varColor;
        c.beginPath();
        c.moveTo(lastpos.current.x, lastpos.current.y);
        c.lineTo(x, y);
        c.stroke();

        // Update last position
        lastpos.current.x = x;
        lastpos.current.y = y;

        // Continue animation
        animating.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        curMousePos.current.x = e.x - rect.left;
        curMousePos.current.y = e.y - rect.top;
    }
    // after calling request animation frame we need to cancel the canimation to stop it from drawing.
    useEffect(() => {

        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        canvas.width = window.innerWidth / 2;
        canvas.height = window.innerHeight / 2;
        c.fillStyle = '#FFFFFF';
        c.fillRect(0, 0, canvas.width, canvas.height);
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
            removeEventListener('mousedown', handleMouseDown)
            removeEventListener('mouseup', handleMouseUp)
            removeEventListener('mouseleave', handleMouseLeave)
            removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return (
        <>
            <div className='flex flex-col items-center gap-1 w-1/2 m-auto'>
                <canvas className='border-2 border-red-500' ref={canvasRef}></canvas>
                <div className='flex gap-2 justify-between items-center w-full'>
                    <div id='line-width'>
                        <span className='flex gap-2 bg-gray-200 p-2 border border-gray-600'>
                            <button onClick={(e) => {
                                lineWidth.current = 1
                            }}>
                                <div className='h-1 w-1 bg-black'></div>
                            </button>
                            <button onClick={(e) => {
                                lineWidth.current = 3
                            }}>
                                <div className='h-1.5 w-1.5 bg-black'></div>
                            </button>
                            <button onClick={(e) => {
                                lineWidth.current = 5
                            }}>
                                <div className='h-2 w-2 bg-black'></div>
                            </button>
                            <button onClick={(e) => {
                                lineWidth.current = 7
                            }}>
                                <div className='h-2.5 w-2.5 bg-black'></div>

                            </button>
                            <button onClick={(e) => {
                                lineWidth.current = 10
                            }}>
                                <div className='h-3 w-3 bg-black'></div>
                            </button>
                        </span>
                    </div>
                    <div id='ToolSelect' className='flex p-3 bg-gray-200 rounded gap-3'>
                        <div className='flex items-center justify-center'>
                            <button onClick={() => { curTool.current = 'brush'; color.current = "#000000" }}><img src="/images/paint-brush-black.png" alt="ibrush" /></button>
                        </div>
                        <div className='flex items-center justify-center'>
                            <button onClick={() => { curTool.current = 'bucket'; }}><img src="/images/paint-bucket-black.png" alt="ibucket" /></button>
                        </div>
                    </div>
                    <div>
                        <button onClick={undo}><img src="/images/undo-black.png" alt="undo" /></button>
                    </div>
                    <div id='colorSelect' className='border border-gray-500'>
                        <div className='flex'>
                            <button id='#ffffff' onClick={handleColorChage} className='bg-white h-5 w-5'></button>
                            <button id='#364153' onClick={handleColorChage} className='bg-gray-700 h-5 w-5'></button>
                            <button id='#000000' onClick={handleColorChage} className='bg-black h-5 w-5'></button>
                            <button id='#e7000b' onClick={handleColorChage} className='bg-red-600 h-5 w-5'></button>
                            <button id='#9ae600' onClick={handleColorChage} className='bg-lime-400 h-5 w-5'></button>
                            <button id='#05df72' onClick={handleColorChage} className='bg-green-400 h-5 w-5'></button>
                            <button id='#00a63e' onClick={handleColorChage} className='bg-green-600 h-5 w-5'></button>
                            <button id='#46edd5' onClick={handleColorChage} className='bg-teal-300 h-5 w-5'></button>
                        </div>
                        <div className='flex'>
                            <button id='#51a2ff' onClick={handleColorChage} className='bg-blue-400 h-5 w-5'></button>
                            <button id='#0092b8' onClick={handleColorChage} className='bg-cyan-600 h-5 w-5'></button>
                            <button id='#155dfc' onClick={handleColorChage} className='bg-blue-600 h-5 w-5'></button>
                            <button id='#fdc700' onClick={handleColorChage} className='bg-yellow-400 h-5 w-5'></button>
                            <button id='#e17100' onClick={handleColorChage} className='bg-amber-600 h-5 w-5'></button>
                            <button id='#973c00' onClick={handleColorChage} className='bg-amber-800 h-5 w-5'></button>
                            <button id='#fb64b6' onClick={handleColorChage} className='bg-pink-400 h-5 w-5'></button>
                            <button id='#ad46ff' onClick={handleColorChage} className='bg-purple-500 h-5 w-5'></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Canvas

