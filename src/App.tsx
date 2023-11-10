import { useEffect, useRef, useState } from 'react';
import * as TWEEN from '@tweenjs/tween.js';
import './App.css';

let state = {
    background: {
        x: 10,
        y: 10,
        width: 800 - 20,
        height: 400 - 20,
        style: "rgba(220,220,220,1)",
    },
    text: {
        offset: { x: 100, y: 30 },
        lines: [
            {
                x: 0,
                y: 50,
                width: 400,
                height: 40,
                style: "rgba(100,100,100,1)",
            },
            {
                x: 0,
                y: 100,
                width: 400,
                height: 40,
                style: "rgba(100,100,100,1)",
            },
            {
                x: 0,
                y: 150,
                width: 300,
                height: 40,
                style: "rgba(100,100,100,1)",
            }
        ]
    }
};

const drawRectangle = (
    { ctx, x, y, width, height, style = "rgba(200,200,200,1)" }:
        {
            x: number,
            y: number,
            width: number,
            height: number,
            ctx: CanvasRenderingContext2D,
            style: string,
        }
) => {
    ctx.fillStyle = style;
    ctx.fillRect(x, y, width, height);
};

const renderState = (
    { ctx, state }:
        {
            ctx: CanvasRenderingContext2D,
            state: any,
        }
) => {
    drawRectangle({ ctx, ...state.background });
    ctx.translate(state.text.offset.x, state.text.offset.y);
    state.text.lines.map((line: any) => drawRectangle({ ctx, ...line }));
};


const drawCanvas = ({
    time,
    canvas,
    ctx
}: {
    time: number,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
}): void => {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderState({ ctx, state });
}

function App() {
    const canvasRef = useRef(null);
    const [time, _setTime] = useState(0.5);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        let canvas: HTMLCanvasElement = canvasRef.current;
        canvas.width = 800;
        canvas.height = 400;

        let ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }
        drawCanvas({ time, canvas, ctx });
    }, [canvasRef]);

    return (
        <>
            <p className="">
                Welcome to hackanton city.
            </p>
            <canvas ref={canvasRef} className="app-canvas"/>
        </>
    )
}

export default App;
