import React from 'react'
const ToolBar = ({ handleColorChage, undo, lineWidth, color, curTool }) => {
    return (
        <>
            <div className='bg-white rounded px-4 py-1'>

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
                    <div className='bg-white p-2 rounded-full'>
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

export default ToolBar
