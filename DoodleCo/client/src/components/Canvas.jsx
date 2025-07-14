import React from 'react'
import { useRef, useEffect, useState } from 'react'


const Canvas = () => {
    const canvasRef = useRef(null);
    const curMousePos = useRef({ x: 0, y: 0 })
    const isDrag = useRef(false);
    const animating = useRef(null);
    const lastpos = useRef({ x: 0, y: 0 })
    const lineWidth = useRef(3);

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

        // moved animate function outside of event listener
        const animate = () => {
            if (!isDrag.current) return; // Don't animate if not dragging

            const { x, y } = curMousePos.current;

            c.lineWidth = lineWidth.current;
            c.lineJoin = 'round';
            c.lineCap = 'round';
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
            isDrag.current = true
            const rect = canvas.getBoundingClientRect();
            let x = e.x - rect.left;
            let y = e.y - rect.top;
            lastpos.current.x = x
            lastpos.current.y = y
            animating.current = requestAnimationFrame(animate)
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
        <div className='flex flex-col justify-center items-center'>
            <canvas className='border-2 border-red-500' ref={canvasRef}></canvas>
            <div>Line Size
                <span><button onClick={(e)=>{
                    lineWidth.current = 1
                }}>1</button></span>
                <span><button onClick={(e)=>{
                    lineWidth.current = 3
                }}>3</button></span>
                <span><button onClick={(e)=>{
                    lineWidth.current = 5
                }}>5</button></span>
                <span><button onClick={(e)=>{
                    lineWidth.current = 7
                }}>7</button></span>
                <span><button onClick={(e)=>{
                    lineWidth.current = 10
                }}>10</button></span>
            </div>
        </div>
        </>
    )
}

export default Canvas

