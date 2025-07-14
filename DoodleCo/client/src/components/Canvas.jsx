import React from 'react'
import { useRef, useEffect, useState } from 'react'


const Canvas = () => {
    const canvasRef = useRef(null);
    const curMousePos = useRef({ x: 0, y: 0 })
    const isDrag = useRef(false);
    const animating = useRef(null);
    const lastpos = useRef({ x: 0, y: 0 })
    const lineWidth = useRef(3);
    const color = useRef('black');
    const curTool = useRef('brush');


    const handleColorChage = (e) => {
        color.current = e.target.id
        console.log(e)
        console.log('color changed')
    }

    // after calling request animation frame we need to cancel the canimation to stop it from drawing.
    useEffect(() => {

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth / 2;
        canvas.height = window.innerHeight / 2;
        const c = canvas.getContext('2d');
        // c.fillStyle = 'blue'
        // c.fillRect(100, 100, 5, 5);
        // c.fill()
        // c.fillRect(110, 110, 10, 10);
        // c.fill()
        // c.fillRect(120, 120, 15, 15);
        // c.fill()
        // c.fillRect(130, 130, 20, 20);
        // c.fill()

        const draw = (e)=>{
            isDrag.current = true
            const rect = canvas.getBoundingClientRect();
            let x = e.x - rect.left;
            let y = e.y - rect.top;
            lastpos.current.x = x
            lastpos.current.y = y
            animating.current = requestAnimationFrame(animate)
        }

        // moved animate function outside of event listener
        const animate = () => {
            if (!isDrag.current) return; // Don't animate if not dragging

            const { x, y } = curMousePos.current;

            c.lineWidth = lineWidth.current;
            c.lineJoin = 'round';
            c.lineCap = 'round';
            c.strokeStyle = color.current;
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

        canvas.addEventListener('mousemove',
            (e) => {

                const rect = canvasRef.current.getBoundingClientRect();
                curMousePos.current.x = e.x - rect.left;
                curMousePos.current.y = e.y - rect.top;
                // if (isDrag.current) {
                //     function animate() {
                //         const {x,y} = curMousePos.current

                //         c.beginPath()
                //         c.moveTo(lastpos.x,lastpos.y)
                //         // c.moveTo(mouseX,mouseY)
                //         c.lineTo(x,y)
                //         lastpos.x = x 
                //         lastpos.y = y
                //         c.stroke()
                //     }
                //     animating.current = requestAnimationFrame(animate)

                // }
            })
        canvas.addEventListener('mousedown', (e) => {
            // isDrag.current = true
            // const rect = canvas.getBoundingClientRect();
            // let x = e.x - rect.left;
            // let y = e.y - rect.top;
            // lastpos.current.x = x
            // lastpos.current.y = y
            // animating.current = requestAnimationFrame(animate)
            if (curTool.current === 'brush'){
                draw(e);
            }
        })
        canvas.addEventListener('mouseup', () => {
            lastpos.current.x = 0
            lastpos.current.y = 0
            isDrag.current = false
            cancelAnimationFrame(animating.current)
        })
        canvas.addEventListener('mouseleave', () => {
            lastpos.current.x = 0
            lastpos.current.y = 0
            isDrag.current = false
            cancelAnimationFrame(animating.current)
        })
    }, [isDrag])

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
                    <div id='colorSelect' className='border border-gray-500'>
                        <div className='flex'>
                            <button id='#fff' onClick={handleColorChage} className='bg-white h-5 w-5'></button>
                            <button id='#364153' onClick={handleColorChage} className='bg-gray-700 h-5 w-5'></button>
                            <button id='#000' onClick={handleColorChage} className='bg-black h-5 w-5'></button>
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

