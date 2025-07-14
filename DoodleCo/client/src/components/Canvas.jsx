import React from 'react'
import { useRef, useEffect,useState } from 'react'


const Canvas = () => {
    const canvasRef = useRef(null);
    const curMousePos = useRef({x:0,y:0}) 
    const isDrag = useRef(false);
    const animating = useRef(null);

// after calling request animation frame we need to cancel the canimation to stop it from drawing.
    useEffect(() => {

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth - 4;
        canvas.height = window.innerHeight / 2;

        const c = canvas.getContext('2d');
        c.fillStyle = 'blue'
        c.fillRect(100, 100, 100, 100);
        c.fill()

        canvas.addEventListener('mousemove',
            (e) => {
                const rect = canvasRef.current.getBoundingClientRect();
                curMousePos.current.x = e.x -rect.left;
                curMousePos.current.y = e.y - rect.top;
                if (isDrag.current) {
                    function animate() {
                        const {x,y} = curMousePos.current

                        c.beginPath()
                        c.moveTo(x,y)
                        // c.moveTo(mouseX,mouseY)
                        c.lineTo(100, 100)
                        c.stroke()
                    }
                    animating.current = requestAnimationFrame(animate)
                    
                }
            })
            canvas.addEventListener('mousedown', () => {
                isDrag.current = true
                animating.current = requestAnimationFrame(animate)
            })
            canvas.addEventListener('mouseup',()=>{
                isDrag.current = false
                cancelAnimationFrame(animating.current)
            })
            canvas.addEventListener('mouseleave',()=>{
                isDrag.current = false
                cancelAnimationFrame(animating.current)
        })
    }, [isDrag])

    return (
        <>
            <canvas ref={canvasRef}></canvas>
        </>
    )
}

export default Canvas

