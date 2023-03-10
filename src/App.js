import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    const recolorCanvasRef = useRef(null);

    const [imageData, setImageData] = useState(null);
    const [imageSrc, setImageSrc] = useState(
        // process.env.PUBLIC_URL + "/images/son_of_man.jpeg"
        // process.env.PUBLIC_URL + "/images/color_explosion.jpeg"
        process.env.PUBLIC_URL + "/images/fire_on_the_coast.jpeg"
        // process.env.PUBLIC_URL + "/images/lamppost_foggy.jpeg"
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
        // fetch WASM file to run
        const response = await fetch(
            process.env.PUBLIC_URL + "/wasm/main.wasm"
        );
        const bytes = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(bytes);
        const { main_func, memory } = instance.exports;

        console.log("Image data is ", imageData);
        const { width, height } = imageData;

        // share an array between C and JS
        let sharedArray;
        let enoughMemory = false;
        while (!enoughMemory) {
            try {
                sharedArray = new Uint8ClampedArray(
                    memory.buffer,
                    0,
                    4 * width * height * 2
                );
                enoughMemory = true;
            } catch (err) {
                if (err instanceof RangeError) {
                    memory.grow(10);
                } else {
                    throw err;
                }
            }
        }
        console.log("Memory:", memory);

        sharedArray.set(imageData.data);
        // use the Uint8ClampedArray class to set the value of shared array's second half
        const newArray = new Uint8ClampedArray(
            memory.buffer,
            4 * width * height,
            4 * width * height
        );
        newArray.set(imageData.data);
        console.log("Shared array is", sharedArray.slice(width * height * 4));

        main_func(sharedArray, width, height);
        console.log(
            "Now, shared array is",
            sharedArray.slice(width * height * 4)
        );

        recolorImage(
            recolorCanvasRef.current,
            sharedArray.slice(width * height * 4),
            width,
            height
        );
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
