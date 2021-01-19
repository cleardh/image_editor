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
    document.querySelectorAll('.count').forEach(count => {
        count.innerHTML = '';
    });
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
        ctx.drawImage(newImage, 0, 0, 300, 450);
    });
}

function applyFilter(filter) {
    if (fileOpener.value) {
        document.querySelectorAll('button').forEach(el => {
            if (el.classList.value === 'original') {
                el.disabled = true;
            }
        });
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
        // console.log(mainCanvas.getContext('2d').getImageData(0, 0, 300, 450));
    }    
}

function applySepia(pixels, adj) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        d[i] = (r * (1 - (0.607 * adj))) + (g * .769 * adj) + (b * .189 * adj);
        d[i + 1] = (r * .349 * adj) + (g * (1 - (0.314 * adj))) + (b * .168 * adj);
        d[i + 2] = (r * .272 * adj) + (g * .534 * adj) + (b * (1 - (0.869 * adj)));
    }
    return pixels;
}

function applyContrast(pixels, adj) {
    adj *= 255;
    let d = pixels.data;
    let factor = (259 * (adj + 255)) / (255 * (259 - adj));
    for (let i = 0; i < d.length; i += 4) {
        d[i] = factor * (d[i] - 128) + 128;
        d[i + 1] = factor * (d[i + 1] - 128) + 128;
        d[i + 2] = factor * (d[i + 2] - 128) + 128;
    }
    return pixels;
}

function applyBrightness(pixels, adj) {
    let d = pixels.data;
    adj = (adj > 1) ? 1 : adj;
    adj = (adj < -1) ? -1 : adj;
    adj = ~~(255 * adj);
    for (let i = 0; i < d.length; i += 4) {
        d[i] += adj;
        d[i + 1] += adj;
        d[i + 2] += adj;
    }
    return pixels;
};

function applySaturation(pixels, adj) {
    let d = pixels.data;
    adj = (adj < -1) ? -1 : adj;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        let gray = 0.2989 * r + 0.5870 * g + 0.1140 * b; //weights from CCIR 601 spec
        d[i] = -gray * adj + d[i] * (1 + adj);
        d[i + 1] = -gray * adj + d[i + 1] * (1 + adj);
        d[i + 2] = -gray * adj + d[i + 2] * (1 + adj);
    }
    return pixels;
};

function applyGrayscale(pixels) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        let avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        d[i] = d[i + 1] = d[i + 2] = avg;
    }
    return pixels;
};

function updatePixels(effect) {
    const p = new Promise((resolve) => {
        let pixels = mainCanvas.getContext("2d").getImageData(0, 0, 300, 450);
        switch (effect) {
            case 'flair':
                pixels = applySepia(pixels, 0.04 * .5);
                pixels = applyContrast(pixels, -0.15 * .5);
                break;
            case 'prime':
                pixels = applyBrightness(pixels, 0.1 * .3);
                pixels = applyContrast(pixels, 0.1 * .3);
                pixels = applySaturation(pixels, 0.15 * .3);
                break;
            case 'glass':
                pixels = applyContrast(pixels, -0.15);
                pixels = applySaturation(pixels, 0.1);
                break;
            case 'raw':
                // To be implemented
                break;
            case 'mono':
                pixels = applyGrayscale(pixels, 1);
                pixels = applyContrast(pixels, 0.05);
                break;
            default:
                break;
        }
        resolve(pixels);
    });
    p.then((newPixels) => {
        mainCanvas.getContext("2d").putImageData(newPixels, 0, 0);
    });
}


function applyOriginalFilter(filter) {
    if (fileOpener.value) {
        document.querySelectorAll('button').forEach(el => {
            if (el.classList.value !== 'original' && el.id !== 'resetFilters') {
                el.disabled = true;
            } else {
                if (el.id === filter) {
                    el.style.background = '#224d5d';
                    el.style.color = '#f1f2f2';
                    el.style.borderColor = '#224d5d';
                } else {
                    el.style.background = '';
                    el.style.color = '';
                    el.style.borderColor = '';
                }
            }
        });
        const ctx = mainCanvas.getContext("2d");
        ctx.drawImage(newImage, 0, 0, 300, 450);
        updatePixels(filter);
    }
}

function resetFilters() {
    document.querySelectorAll('.count').forEach(count => {
        count.innerHTML = '';
    });
    document.querySelectorAll('button').forEach(el => {
        if (el.id !== 'raw') {
            el.disabled = false;
            el.style.background = '';
            el.style.color = '';
            el.style.borderColor = '';
        }
    });
    if (fileOpener.value) {
        const ctx = mainCanvas.getContext("2d");
        ctx.drawImage(newImage, 0, 0, 300, 450);
    }
}
