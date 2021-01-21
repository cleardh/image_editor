// const GAUSSIAN = LenaJS['gaussian'];
// const SHARPEN = LenaJS['sharpen'];
// const GRAYSCALE = LenaJS['grayscale'];

const fileOpener = document.getElementById('fileOpener');
const mainCanvas = document.getElementById('mainCanvas');

const filterContainer = document.getElementById('filter-container');
const valueContainer = document.getElementById('value-container');
const btnGaussian = document.getElementById('btnGaussian');
const btnSharpen = document.getElementById('btnSharpen');
const btnGrayscale = document.getElementById('btnGrayscale');

const newImage = document.createElement('img');

const defaultValues = {};

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
        resetImage();
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

function applyGrayscale(pixels, adj0, adj1, adj2) {
    let d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        let avg = adj0 * r + adj1 * g + adj2 * b;
        // let avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        d[i] = d[i + 1] = d[i + 2] = avg;
    }
    return pixels;
};

function updatePixels(effect, adj) {
    const p = new Promise((resolve) => {
        let pixels = mainCanvas.getContext("2d").getImageData(0, 0, 300, 450);
        switch (effect) {
            case 'glass':
                pixels = applySepia(pixels, adj.val0 * .5);
                pixels = applyContrast(pixels, adj.val1 * .5);
                break;
            case 'flair':
                pixels = applyBrightness(pixels, adj.val0 * .3);
                pixels = applyContrast(pixels, adj.val1 * .3);
                pixels = applySaturation(pixels, adj.val2 * .3);
                break;
            case 'dusk':
                pixels = applyContrast(pixels, adj.val0 * 1);
                pixels = applySaturation(pixels, adj.val1 * 1);
                break;
            case 'spotlight':
                // To be implemented (using glfx)
                break;
            case 'chrome':
                pixels = applyGrayscale(pixels, adj.val0 * 1, adj.val1 * 1, adj.val2 * 1);
                pixels = applyContrast(pixels, adj.val3 * 1);
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
        resetImage();

        filterContainer.style.display = 'none';
        valueContainer.style.display = '';
        switch (filter) {
            case 'glass':
                 // pixels = applySepia(pixels, 0.04 * .5);
                // pixels = applyContrast(pixels, -0.15 * .5);
                defaultValues.glass = {
                    sepia: 0.04,
                    contrast: -0.15
                }
                valueContainer.innerHTML = `
                    <table style="margin-top: 15px;">
                        <tr>
                            <td>Sepia</td>
                            <td>
                                <input id="sepia-value" class="newValues" oninput="handleValueChange('glass');" onchange="handleValueChange('glass');" type="range" min="0" max="0.5" step="0.05" value=${defaultValues.glass.sepia} style="margin-left: 5px;" />
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'sepia');" id="sepiaValue">${defaultValues.glass.sepia}</span></td>
                        </tr>
                        <tr>
                            <td>Contrast</td>
                            <td>
                                <input id="contrast-value" class="newValues" oninput="handleValueChange('glass');" onchange="handleValueChange('glass');" type="range" min="-0.2" max="0" step="0.005" value=${defaultValues.glass.contrast} style="margin-left: 5px;" />        
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'contrast');" id="contrastValue">${defaultValues.glass.contrast}</span></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <button style="width: 100%; margin-top: 10px;" onclick="backToOriginal('glass');">Reset</button>
                            </td>
                        </tr>
                    </table>
                `;
                handleValueChange('glass');
                break;
            case 'flair':
                // pixels = applyBrightness(pixels, 0.1 * .3);
                // pixels = applyContrast(pixels, 0.1 * .3);
                // pixels = applySaturation(pixels, 0.15 * .3);
                defaultValues.flair = {
                    brightness: 0.1,
                    contrast: 0.1,
                    saturation: 0.15
                }
                valueContainer.innerHTML = `
                    <table style="margin-top: 15px;">
                        <tr>
                            <td>Brightness</td>
                            <td>
                                <input id="brightness-value" class="newValues" oninput="handleValueChange('flair');" onchange="handleValueChange('flair');" type="range" min="0" max="1" step="0.05" value=${defaultValues.flair.brightness} style="margin-left: 5px;" />
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'brightness');" id="brightnessValue">${defaultValues.flair.brightness}</span></td>
                        </tr>
                        <tr>
                            <td>Contrast</td>
                            <td>
                                <input id="contrast-value" class="newValues" oninput="handleValueChange('flair');" onchange="handleValueChange('flair');" type="range" min="0" max="1" step="0.05" value=${defaultValues.flair.contrast} style="margin-left: 5px;" />        
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'contrast');" id="contrastValue">${defaultValues.flair.contrast}</span></td>
                        </tr>
                        <tr>
                            <td>Saturation</td>
                            <td>
                                <input id="saturation-value" class="newValues" oninput="handleValueChange('flair');" onchange="handleValueChange('flair');" type="range" min="0" max="1" step="0.05" value=${defaultValues.flair.saturation} style="margin-left: 5px;" />        
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'saturation');" id="saturationValue">${defaultValues.flair.saturation}</span></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <button style="width: 100%; margin-top: 10px;" onclick="backToOriginal('flair');">Reset</button>
                            </td>
                        </tr>
                    </table>
                `;
                handleValueChange('flair');
                break;
            case 'dusk':
                // pixels = applyContrast(pixels, -0.15);
                // pixels = applySaturation(pixels, 0.1);
                defaultValues.dusk = {
                    contrast: -0.15,
                    saturation: 0.1
                }
                valueContainer.innerHTML = `
                    <table style="margin-top: 15px;">
                        <tr>
                            <td>Contrast</td>
                            <td>
                                <input id="contrast-value" class="newValues" oninput="handleValueChange('dusk');" onchange="handleValueChange('dusk');" type="range" min="-0.2" max="-0.1" step="0.005" value=${defaultValues.dusk.contrast} style="margin-left: 5px;" />        
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'contrast');" id="contrastValue">${defaultValues.dusk.contrast}</span></td>
                        </tr>
                        <tr>
                            <td>Saturation</td>
                            <td>
                                <input id="saturation-value" class="newValues" oninput="handleValueChange('dusk');" onchange="handleValueChange('dusk');" type="range" min="0" max="1" step="0.05" value=${defaultValues.dusk.saturation} style="margin-left: 5px;" />        
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'saturation');" id="saturationValue">${defaultValues.dusk.saturation}</span></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <button style="width: 100%; margin-top: 10px;" onclick="backToOriginal('dusk');">Reset</button>
                            </td>
                        </tr>
                    </table>
                `;
                handleValueChange('dusk');
                break;
            case 'spotlight':
                filterContainer.style.display = '';
                valueContainer.style.display = 'none';
                const canvas = fx.canvas();
                const texture = canvas.texture(newImage);
                canvas.draw(texture).vignette(0.1, 0.5).denoise(140).update();
                const ctx = mainCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, 0, 300, 450);
                break;
            case 'chrome':
                // pixels = applyGrayscale(pixels, 1);
                // pixels = applyContrast(pixels, 0.05);
                // let avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                defaultValues.chrome = {
                    red: 0.2885,
                    green: 0.7152,
                    blue: 0.1131,
                    contrast: 0
                }
                valueContainer.innerHTML = `
                    <table style="margin-top: 5px;">
                        <tr>
                            <td>Red</td>
                            <td>
                                <input id="red-value" class="newValues" oninput="handleValueChange('chrome');" onchange="handleValueChange('chrome');" type="range" min="0" max="1" step="0.0001" value=${defaultValues.chrome.red} style="margin-left: 5px;" />
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'red');" id="redValue">${defaultValues.chrome.red}</span></td>
                        </tr>
                        <tr>
                            <td>Green</td>
                            <td>
                                <input id="green-value" class="newValues" oninput="handleValueChange('chrome');" onchange="handleValueChange('chrome');" type="range" min="0" max="1" step="0.0001" value=${defaultValues.chrome.green} style="margin-left: 5px;" />
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'green');" id="greenValue">${defaultValues.chrome.green}</span></td>
                        </tr>
                        <tr>
                            <td>Blue</td>
                            <td>
                                <input id="blue-value" class="newValues" oninput="handleValueChange('chrome');" onchange="handleValueChange('chrome');" type="range" min="0" max="1" step="0.0001" value=${defaultValues.chrome.blue} style="margin-left: 5px;" />
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'blue');" id="blueValue">${defaultValues.chrome.blue}</span></td>
                        </tr>
                        <tr>
                            <td>Contrast</td>
                            <td>
                                <input id="contrast-value" class="newValues" oninput="handleValueChange('chrome');" onchange="handleValueChange('chrome');" type="range" min="0" max="0.5" step="0.005" value=${defaultValues.chrome.contrast} style="margin-left: 5px;" />
                            </td>
                            <td><span contentEditable="true" onkeydown="handleSpanInput(event, 'contrast');" id="contrastValue">${defaultValues.chrome.contrast}</span></td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <button style="width: 100%;" onclick="backToOriginal('chrome');">Reset</button>
                            </td>
                        </tr>
                    </table>
                `;
                handleValueChange('chrome');
                break;
            default:
                break;
        }
    }
}

function handleSpanInput(e, effect) {
    const slider = document.getElementById(`${effect}-value`);
    const span = document.getElementById(`${effect}Value`);
    const key = e.keyCode || e.which;
    if (key === 13) { // Enter
        e.preventDefault();
        const changeEvent = new Event('input');
        slider.value = span.innerHTML;
        slider.dispatchEvent(changeEvent);
    } else if (key !== 8 && key !== 9 && key !== 46 && key !== 189 && key !== 190 && (key < 37 || key > 40) && (key < 48 || key > 57)) { // Backspace, Delete, Arrows, Period, Minus
        e.preventDefault();
    }
}

function handleValueChange(filter) {
    resetImage();
    const newValues = document.getElementsByClassName('newValues');
    const valObj = {};
    for (let i = 0; i < newValues.length; i++) {
        valObj[`val${i}`] = newValues[i].value;
        const effect = newValues[i].id.split('-')[0];
        setValue(effect);
        
    }
    updatePixels(filter, valObj);
}

function backToOriginal(filter) {
    resetImage();
    const newValues = document.getElementsByClassName('newValues');
    for (let i = 0; i < newValues.length; i++) {
        const effect = newValues[i].id.split('-')[0];
        newValues[i].value = defaultValues[filter][effect];
        setValue(effect);
    }
    handleValueChange(filter);
}

function setValue(effect) {
    document.getElementById(`${effect}Value`).innerHTML = document.getElementById(`${effect}-value`).value;
}

function resetFilters() {
    document.querySelectorAll('.count').forEach(count => {
        count.innerHTML = '';
    });
    document.querySelectorAll('button').forEach(el => {
        el.disabled = false;
        el.style.background = '';
        el.style.color = '';
        el.style.borderColor = '';
    });
    if (fileOpener.value) {
        resetImage();
    }
    filterContainer.style.display = '';
    valueContainer.style.display = 'none';
}

function resetImage() {
    const ctx = mainCanvas.getContext("2d");
    ctx.drawImage(newImage, 0, 0, 300, 450);
}