import React from 'react'
import { useRef, useEffect } from 'react'


const Canvas = () => {
    const canvasRef = useRef(null);
    const curMousePos = useRef({x:0,y:0}) 


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
                curMousePos.current.x = e.x - rect.left
                curMousePos.current.y = e.y - rect.top
            })
        canvas.addEventListener('mousedown', (e) => {
            if (e.buttons === 1) {
                function animate() {
                    const {x,y} = curMousePos.current
                    requestAnimationFrame(animate)
                    c.beginPath()
                    c.moveTo(x,y)
                    // c.moveTo(mouseX,mouseY)
                    c.lineTo(100, 100)
                    c.stroke()
                }
                animate();
            }
        })
    }, [])

    return (
        <>
            <canvas ref={canvasRef}></canvas>
        </>
    )
}

export default Canvas

