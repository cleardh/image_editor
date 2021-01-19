// const GAUSSIAN = LenaJS['gaussian'];
// const SHARPEN = LenaJS['sharpen'];
// const GRAYSCALE = LenaJS['grayscale'];

const fileOpener = document.getElementById('fileOpener');
const mainCanvas = document.getElementById('mainCanvas');

const btnGaussian = document.getElementById('btnGaussian');
const btnSharpen = document.getElementById('btnSharpen');
const btnGrayscale = document.getElementById('btnGrayscale');

const newImage = document.createElement('img');

window.onload = () => {
    document.querySelector('body').style.width = `${window.innerWidth}px`;
    document.querySelector('body').style.height = `${window.innerHeight}px`;
}

fileOpener.onchange = (e) => {
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
        ctx.drawImage(newImage, 0, 0, 300, 450);
    });
}

function applyFilter(filter) {
    if (fileOpener.value) {
        let totalCount;
        const spanCount = document.getElementById(`${filter}-count`);
        if (spanCount.innerHTML) {
            totalCount = parseInt(spanCount.innerHTML) + 1;
        } else {
            totalCount = 1;
        }
        spanCount.innerHTML = totalCount;

        let total = 0;
        document.querySelectorAll('.count').forEach(count => {
            if (count.innerHTML) {
                total += parseInt(count.innerHTML)   
            }
        });
        if (total > 0) {
            LenaJS.redrawCanvas(mainCanvas, LenaJS[filter]);
        } else {
            LenaJS.filterImage(mainCanvas, LenaJS[filter], newImage);
        }
    }
    
}
