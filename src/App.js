import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    const recolorCanvasRef = useRef(null);

    const [imageData, setImageData] = useState(null);
    const [imageSrc, setImageSrc] = useState(
        process.env.PUBLIC_URL + "/images/son_of_man.jpeg"
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
                ctx.fillRect(row, col, 1, 1);
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

    const blurPixel = (oldData, row, col) => {
        return [0, 0, 0, 255];
    };

    const processImage = () => {
        console.log("Image data is ", imageData);
        const oldData = imageData.data;
        const newData = new Uint8ClampedArray(imageData.data);
        const { width, height } = imageData;
        console.log("The new data is ", newData, "old data is ", oldData);

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const pixelIndex = (row * width + col) * 4;
                const [r, g, b, a] = blurPixel(oldData, row, col);
                newData[pixelIndex] = r;
                newData[pixelIndex + 1] = g;
                newData[pixelIndex + 2] = b;
                newData[pixelIndex + 3] = a;
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
