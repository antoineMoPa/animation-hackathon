import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Tween, update } from '@tweenjs/tween.js';
import { ResponsiveBump } from '@nivo/bump';
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
                    opacity: 0.1,
                },
                {
                    x: -100,
                    y: 100,
                    width: 400,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                },
                {
                    x: -100,
                    y: 150,
                    width: 300,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                }
            ]
        }
    };
};

const drawRectangle = (
    { ctx, x, y, width, height, style = "rgba(200,200,200,1)", opacity }:
        {
            x: number,
            y: number,
            width: number,
            height: number,
            ctx: CanvasRenderingContext2D,
            style: string,
            opacity: number,
        }
) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
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
    let firstTween = null;
    let previousTween = null;
    let tweens: Tween[] = [];

    for (let i in state.text.lines) {
        const tween = new Tween(state.text.lines[i]);
        tween.to({ x: 10, opacity: 1 }, 300);

        if (!firstTween) {
            firstTween = tween;
        } else {
            previousTween.chain(tween);
        }

        previousTween = tween;
        tweens.push(tween);
    }

    return tweens;
};


const bumpChart = (data) => {
    return (
        <div className="chart-container">
            <ResponsiveBump
                data={data}
                colors={{ scheme: 'spectral' }}
                lineWidth={3}
                activeLineWidth={6}
                inactiveLineWidth={3}
                inactiveOpacity={0.15}
                pointSize={10}
                activePointSize={16}
                inactivePointSize={0}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={3}
                activePointBorderWidth={3}
                pointBorderColor={{ from: 'serie.color' }}
                axisTop={null}
                axisBottom={null}
                axisLeft={null}
                margin={{ top: 40, right: 100, bottom: 40, left: 60 }}
                axisRight={null}
            />
        </div >
    );
}

function App() {
    const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
    const contextRef: MutableRefObject<CanvasRenderingContext2D | null> = useRef(null);
    const tweensRef: MutableRefObject<Tween|null> = useRef(null);
    const [data, setData]: any = useState([]);

    const [time, _setTime] = useState(0.5);
    const [state, _setState] = useState(getInitialState());

    useEffect(() => {
        tweensRef.current = animate(state);
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
        if (!tweensRef.current) {
            return;
        }
        tweensRef.current[0].start();
    }, [tweensRef.current]);

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

    useEffect(() => {
        let series = [];
        for (let i = 0; i < state.text.lines.length; i++) {
            let tween = tweensRef.current[i];

            let tweenData = [];

            for (let time = 0; time < 3; time += 0.1) {
                tween.update(time);
                tweenData.push({
                    "x": time,
                    "y": tween._object.x + i * 100,
                });
            }

            series.push({
                "id": `Tween ${i}`,
                "data": tweenData
            })
        }

        setData(series);
    }, [state, tweensRef.current])



    return (
        <>
        <p className="">
            Welcome to hackanton city.
        </p>
        <canvas ref={canvasRef} className="app-canvas" /><br />
        <button onClick={onStart}>Play</button>
            {bumpChart(data)}
        </>
        )
}

export default App;
