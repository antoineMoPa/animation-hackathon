import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { ResponsiveBump } from '@nivo/bump';
import anime from 'animejs/lib/anime.es.js';
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
        assets: [{
            offset: { x: 60, y: 30 },
            lines: [
                {
                    x: -100,
                    y: 50,
                    width: 300,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                },
                {
                    x: -100,
                    y: 100,
                    width: 300,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                },
                {
                    x: -100,
                    y: 150,
                    width: 200,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                }
            ]
        }, {
            offset: { x: 420, y: 30 },
            lines: [
                {
                    x: 100,
                    y: 50,
                    width: 300,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                },
                {
                    x: 100,
                    y: 100,
                    width: 300,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                },
                {
                    x: 100,
                    y: 150,
                    width: 200,
                    height: 40,
                    style: "rgba(100,100,100,1)",
                    opacity: 0.1,
                }
                ]
            }
        ]
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
    for (let i in state.assets) {
        ctx.save();
        ctx.translate(state.assets[i].offset.x, state.assets[i].offset.y);
        state.assets[i].lines.map((line: any) => drawRectangle({ ctx, ...line }));
        ctx.restore();
    }
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

const animate = (state: any) => {
    let timeline = anime.timeline({
        autoplay: true,
    });

    // -------------------------------------- Animate Asset A

    let assetAIntros = [];

    for (let j = 0; j < state.assets[0].lines.length; j++) {
        assetAIntros.push({
            targets: state.assets[0].lines[j],
            x: 10,
            opacity: '1.0',
            easing: 'easeInOutQuart',
            duration: 1000 / 3
        });
    }

    assetAIntros.map(a => timeline.add(a));

    // Hold for 2 seconds
    // (I don't know how to add a delay without pretending to animate something)
    timeline
        .add({
            targets: state.assets[0].lines[0],
            x: 10,
            opacity: '1.0',
            easing: 'easeInOutQuart',
            duration: 2000
        });

    assetAIntros.reverse().map(a => timeline.add({ direction: 'reverse', ...a, x: -100, opacity: 0 }))

    timeline
        .add({
            targets: state.assets[0].lines[0],
            duration: 1000
        });

    // -------------------------------------- Animate Asset B

    let assetBIntros = [];

    for (let j = 0; j < state.assets[1].lines.length; j++) {
        assetBIntros.push({
            targets: state.assets[1].lines[j],
            x: 0,
            opacity: 1.0,
            easing: 'easeInOutQuart',
            duration: 1000 / 3,
        });
    }

    assetBIntros.reverse().map((a, index) => timeline.add(a, '+=0'));

    // Hold for 2 seconds
    // (I don't know how to add a delay without pretending to animate something)
    timeline
        .add({
            targets: state.assets[1].lines[0],
            x: 0,
            opacity: '1.0',
            easing: 'easeInOutQuart',
            duration: 2000,
        });

    assetBIntros.map(a => timeline.add({ ...a, direction: 'reverse', x: 100, opacity: 0 }))

    return timeline;
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
    const timelineRef: MutableRefObject<anime.Timeline | null> = useRef(null);
    const [data, setData]: any = useState([]);

    const [time, _setTime] = useState(0.5);
    const [state, _setState] = useState(getInitialState());

    useEffect(() => {
        if (timelineRef.current) {
            timelineRef.current.pause();
        }
        timelineRef.current = animate(state);
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
        timelineRef.current.pause();
        timelineRef.current.seek(0);
        timelineRef.current.play();
    }, [timelineRef.current]);

    // Setup requestAnimationFrame
    useEffect(() => {
        let stop = false;

        const canvas = canvasRef.current;
        const ctx = contextRef.current;

        const raf = () => {
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
        <canvas ref={canvasRef} className="app-canvas" /><br />
        <button onClick={onStart}>Play</button>
        {bumpChart(data)}
        </>
        )
}

export default App;
