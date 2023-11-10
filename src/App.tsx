import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Tween, update } from '@tweenjs/tween.js';
import * as TWEEN from '@tweenjs/tween.js';
import './App.css';

let getInitialState = () => {
    return {
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
                    x: -100,
                    y: 50,
                    width: 400,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                },
                {
                    x: -100,
                    y: 100,
                    width: 400,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                },
                {
                    x: -100,
                    y: 150,
                    width: 300,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                }
            ]
        }
    };
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
    { ctx, state, time }:
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
    ctx,
    state
}: {
    time: number,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    state: any
}): void => {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderState({ ctx, state });
}

const animate = (state: any): Tween => {
    const tween: Tween = new Tween(state.text.lines[0]);
    tween.to({ x: 10 }, 1000);

    return tween;
};

function App() {
    const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
    const contextRef: MutableRefObject<CanvasRenderingContext2D | null> = useRef(null);
    const tweenRef: MutableRefObject<Tween|null> = useRef(null);
    const [time, _setTime] = useState(0.5);
    const [state, _setState] = useState(getInitialState());

    useEffect(() => {
        tweenRef.current = animate(state);
    }, [state]);

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

        contextRef.current = ctx;
    }, [canvasRef.current]);

    const onStart = useCallback(() => {
        if (!tweenRef.current) {
            return;
        }
        tweenRef.current.start();
    }, [tweenRef.current]);

    // Setup requestAnimationFrame
    useEffect(() => {
        let stop = false;

        const canvas = canvasRef.current;
        const ctx = contextRef.current;

        const raf = () => {
            update();

            if (canvas && ctx) {
                drawCanvas({ time, canvas, ctx, state });
            }

            if (!stop) {
                window.requestAnimationFrame(raf);
            }
        }

        window.requestAnimationFrame(raf);

        // Cleanup effect
        return () => {
            stop = true;
        };
    }, [state]);

    return (
        <>
            <p className="">
                Welcome to hackanton city.
            </p>
            <canvas ref={canvasRef} className="app-canvas" />
            <button onClick={onStart}>Play</button>
        </>
    )
}

export default App;
