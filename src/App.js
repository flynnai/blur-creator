import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    const recolorCanvasRef = useRef(null);

    const [imageData, setImageData] = useState(null);
    const [imageSrc, setImageSrc] = useState(
        // process.env.PUBLIC_URL + "/images/son_of_man.jpeg"
        process.env.PUBLIC_URL + "/images/color_explosion.jpeg"
        // process.env.PUBLIC_URL + "/images/lamp_post.jpeg"
    );

    const recolorImage = (canvas, newData, width, height) => {
        console.log("Recoloring ", canvas, "with ", newData, width, height);
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const index = (row * width + col) * 4;
                const [r, g, b, a] = newData.slice(index, index + 4);
                ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
                ctx.fillRect(col, row, 1, 1);
            }
        }
    };

    const grabImageData = (e) => {
        console.log("running with e:", e);
        const img = e.target;
        // create a temp canvas to put our image on
        const dataCanvas = document.createElement("CANVAS");
        const dataCtx = dataCanvas.getContext("2d");
        dataCanvas.width = img.naturalWidth || img.width;
        dataCanvas.height = img.naturalHeight || img.height;

        dataCtx.drawImage(img, 0, 0);
        setImageData(
            dataCtx.getImageData(0, 0, dataCanvas.width, dataCanvas.height)
        );
    };

    const blurPixel = (oldData, targetRow, targetCol, width, height) => {
        const CIRCLE_RADIUS = 30;
        // const blurMult = (distance) =>
        //     Math.max(CIRCLE_RADIUS - distance, 0) / CIRCLE_RADIUS;
        // const blurMult = (distance) => 1;
        const blurMult = (distance) => Math.floor(Math.random() * 2);

        const result = [0, 0, 0, 255];

        for (let channel = 0; channel < 3; channel++) {
            let avgDiff = 0;
            let kernelSize = 0;
            for (
                let row = Math.max(targetRow - CIRCLE_RADIUS, 0);
                row < Math.min(targetRow + CIRCLE_RADIUS, height);
                row++
            ) {
                for (
                    let col = Math.max(targetCol - CIRCLE_RADIUS, 0);
                    col < Math.min(targetCol + CIRCLE_RADIUS, width);
                    col++
                ) {
                    const distance = Math.hypot(
                        targetRow - row,
                        targetCol - col
                    );
                    // make sure it's in the kernel
                    if (distance < CIRCLE_RADIUS) {
                        kernelSize++;
                        // find difference between target pixel and current pixel
                        const diff =
                            oldData[(row * width + col) * 4 + channel] -
                            oldData[
                                (targetRow * width + targetCol) * 4 + channel
                            ];
                        avgDiff += diff * blurMult(distance);
                    }
                }
            }

            avgDiff /= kernelSize;
            result[channel] =
                oldData[(targetRow * width + targetCol) * 4 + channel] +
                avgDiff;
        }
        return result;
    };

    const processImage = async () => {
        console.log("Image data is ", imageData);
        const oldData = imageData.data;
        const newData = new Uint8ClampedArray(imageData.data);
        const { width, height } = imageData;
        console.log("The new data is ", newData, "old data is ", oldData);

        const response = await fetch(
            process.env.PUBLIC_URL + "/wasm/main.wasm"
        );
        const bytes = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(bytes);
        const { main_func, memory } = instance.exports;

        console.log("Instance memory:", memory.buffer.byteLength);
        console.log("growing...:", memory.grow(40));
        // TODO calculate correct pages to grow by
        console.log("Instance memory:", memory.buffer.byteLength);

        // share an array between C and JS
        const sharedArray = new Uint8ClampedArray(
            memory.buffer,
            0,
            4 * width * height * 2
        );
        sharedArray.set(oldData);
        const newArray = new Uint8ClampedArray(
            memory.buffer,
            4 * width * height,
            4 * width * height
        );
        newArray.set(newData);
        console.log("Shared array is", sharedArray.slice(width * height * 4));

        main_func(sharedArray, width, height);
        console.log(
            "Now, shared array is",
            sharedArray.slice(width * height * 4)
        );

        // for progress
        let progressGranularity = 1; // out of 100
        const numReportAfter = Math.ceil(
            (height * width * progressGranularity) / 100
        );
        let leftToReport = 0;
        let percentDone = 0;
        recolorImage(
            recolorCanvasRef.current,
            sharedArray.slice(width * height * 4),
            width,
            height
        );
        return;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const pixelIndex = (row * width + col) * 4;
                const [r, g, b, a] = blurPixel(
                    oldData,
                    row,
                    col,
                    width,
                    height
                );
                newData[pixelIndex] = Math.floor(r);
                newData[pixelIndex + 1] = Math.floor(g);
                newData[pixelIndex + 2] = Math.floor(b);
                newData[pixelIndex + 3] = Math.floor(a);

                leftToReport--;
                if (leftToReport <= 0) {
                    leftToReport = numReportAfter;
                    console.log(
                        `We are ${percentDone++}% done. Just colored rgba:`,
                        r,
                        g,
                        b,
                        a
                    );
                }
            }
        }

        recolorImage(recolorCanvasRef.current, newData, width, height);
    };

    return (
        <div>
            <img src={imageSrc} onLoad={grabImageData} />
            <canvas width="640" height="480" ref={recolorCanvasRef}></canvas>
            <button onClick={processImage}>Process</button>
        </div>
    );
}

export default App;
