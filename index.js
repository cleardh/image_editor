const GAUSSIAN = LenaJS['gaussian'];
const SHARPEN = LenaJS['sharpen'];
const GRAYSCALE = LenaJS['grayscale'];

window.onload = () => {
    document.querySelector('body').style.width = `${window.innerWidth}px`;
    document.querySelector('body').style.height = `${window.innerHeight}px`;
}

fileOpener.onchange = (e) => {
    const fileOpener = document.getElementById('fileOpener');
    const mainCanvas = document.getElementById('mainCanvas');
    const newImage = document.createElement('img');
    newImage.style.width = '300px';
    newImage.style.height = '450px';
    const photo = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        newImage.src = reader.result;
    }
    reader.readAsDataURL(photo);
    
    newImage.addEventListener('load', () => {
        const ctx = mainCanvas.getContext("2d");
        mainCanvas.style.width = '300px';
        mainCanvas.style.height = '450px';
        LenaJS.filterImage(mainCanvas, RED, newImage);
    });
}