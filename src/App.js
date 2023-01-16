import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    const imgRef = useRef(null);
    const recolorCanvasRef = useRef(null);

    const [imageData, setImageData] = useState(null);
    const [imageSrc, setImageSrc] = useState(
        process.env.PUBLIC_URL + "/images/son_of_man.jpeg"
    );

    // useEffect(() => {
    //     console.log("Ref:", imgRef.current);
    //     const img = imgRef.current;
    //     if (img) {

    //         if (img.complete) {
    //             grabImageData();
    //         } else img.onload = grabImageData;
    //     }
    // }, [imgRef.current, recolorCanvasRef.current]);

    // const recolorImage = () => {
    //     const recolorC = recolorCanvasRef.current;
    //     const img = imgRef.current;

    //     const width = (recolorC.width = img.naturalWidth || img.width);
    //     const height = (recolorC.height = img.naturalHeight || img.height);
    //     for (let y = 0; y < height; y++) {
    //         for (let x = 0; x < width; x++) {
    //             const p = pixels[y * width + x];
    //             recolorCtx.fillStyle = COLORS[p.group];
    //             recolorCtx.fillRect(x, y, 1, 1);
    //         }
    //     }
    // };

    const grabImageData = (e) => {
        console.log("running with e:", e);
        const img = imgRef.current;
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

    const processImage = () => {
        console.log("Image data is ", imageData);
        // const pixels = [];
        // for (let i = 0; i < img_c.width * img_c.height * 4; i += 4) {
        //     const r = imgdata.data[i];
        //     const g = imgdata.data[i + 1];
        //     const b = imgdata.data[i + 2];
        //     pixels.push(new Pixel(r, g, b));
        // }
    };

    return (
        <div>
            <img src={imageSrc} ref={imgRef} onLoad={grabImageData} />
            <canvas width="640" height="480" ref={recolorCanvasRef}></canvas>
            <button onClick={processImage}>Process</button>
        </div>
    );
}

export default App;
