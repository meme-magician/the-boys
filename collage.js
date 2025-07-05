let imageFilenames = [];

async function detectNumberedImages() {
    // Try to fetch the directory listing (works if served with directory listing enabled)
    try {
        const response = await fetch('images/');
        const text = await response.text();
        // Parse for numbered jpgs (e.g., 1.jpg, 2.jpg, ...)
        const matches = Array.from(text.matchAll(/([0-9]+)\.jpg/gi));
        const uniqueNumbers = Array.from(new Set(matches.map(m => parseInt(m[1], 10)))).sort((a, b) => a - b);
        imageFilenames = uniqueNumbers.map(num => `images/${num}.jpg`);
    } catch (e) {
        // Fallback: default to 1-11 if fetch fails
        imageFilenames = [];
        for (let i = 1; i <= 11; i++) {
            imageFilenames.push(`images/${i}.jpg`);
        }
    }
}

const COLS = 8;
const ROWS = 6;
const VISIBLE_COUNT = COLS * ROWS; // 48
const FADE_INTERVAL = 2000; // 2 seconds
const FADE_DURATION = 800; // 0.8 seconds

const container = document.querySelector('.collage-container');
let visibleIndexes = [];
let gridImages = [];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function setupCollage() {
    // Fill the grid so every image appears at least once before repeats
    visibleIndexes = [];
    let base = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
        base.push(i % imageFilenames.length);
    }
    visibleIndexes = shuffle(base);
    renderImages();
}

function renderImages() {
    container.innerHTML = '';
    gridImages = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
        const idx = visibleIndexes[i];
        const img = document.createElement('img');
        img.src = imageFilenames[idx];
        img.className = 'collage-image visible';
        img.dataset.grid = i;
        img.dataset.index = idx;
        container.appendChild(img);
        gridImages.push(img);
    }
}

function swapRowImages() {
    // For each row, replace one random image with a random image from all available images
    // Stagger the replacements from top to bottom
    for (let row = 0; row < ROWS; row++) {
        setTimeout(() => {
            const rowStart = row * COLS;
            
            // Pick one random position in this row to replace
            let posToReplace = rowStart + Math.floor(Math.random() * COLS);
            
            // Pick a random image from all available images
            let newImageIndex = Math.floor(Math.random() * imageFilenames.length);
            
            const imgToReplace = gridImages[posToReplace];
            
            // Fade out the image
            imgToReplace.classList.remove('visible');
            
            setTimeout(() => {
                // Replace the src and data-index
                imgToReplace.src = imageFilenames[newImageIndex];
                imgToReplace.dataset.index = newImageIndex;
                
                // Update the visibleIndexes array
                visibleIndexes[posToReplace] = newImageIndex;
                
                // Fade it back in
                imgToReplace.classList.add('visible');
            }, FADE_DURATION / 2);
        }, row * 200); // 200ms delay between each row
    }
}

async function startCollage() {
    await detectNumberedImages();
    setupCollage();
    setInterval(swapRowImages, FADE_INTERVAL);
}

startCollage(); 