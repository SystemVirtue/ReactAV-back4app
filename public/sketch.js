let song, fft, particles = [], img, mic;
let video1, video2;
let micSensitivitySlider;
let minSensitivity = 0, maxSensitivity = 1;
let uiTimeout;
let audioInputSelect, video1Select, video2Select, video1BlendDropdown, video2BlendDropdown, playPauseButton;

function preload() {
    img = loadImage("DJ-ER_BG.png");
    mic = new p5.AudioIn();
    song = loadSound("Demo_Track.mp3");
    video1 = createVideo(['Sample_Video1.mp4'], videoLoadCallback);
    video2 = createVideo(['Sample_Video2.mp4'], videoLoadCallback);
    video1.hide();
    video2.hide();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    imageMode(CENTER);
    rectMode(CENTER);
    fft = new p5.FFT(0.8, 512);
    img.filter(BLUR, 1);

    mic.start();
    setupUI();
    uiTimeout = millis();

    video1.loop();
    video2.loop();
}

function setupUI() {
    removeElements();

    audioInputSelect = createSelect();
    audioInputSelect.position(10, 10);
    audioInputSelect.option('Microphone');
    audioInputSelect.option('Sample Audio');
    audioInputSelect.option('Upload File');
    audioInputSelect.changed(handleAudioInput);

    micSensitivitySlider = createSlider(minSensitivity, maxSensitivity, 0.5, 0.01);
    micSensitivitySlider.position(audioInputSelect.x + audioInputSelect.width + 100, 10);
    micSensitivitySlider.input(updateSensitivity);

    video1Select = createSelect();
    video1Select.position(10, audioInputSelect.y + audioInputSelect.height + 20);
    video1Select.option('Random');
    video1Select.option('Sample Video 1');
    video1Select.option('Upload File');
    video1Select.changed(() => handleVideoInput(1));

    video1BlendDropdown = createSelect();
    video1BlendDropdown.position(video1Select.x + video1Select.width + 100, video1Select.y);
    addBlendOptions(video1BlendDropdown);
    video1BlendDropdown.changed(() => changeBlendMode(1, video1BlendDropdown.value()));

    video2Select = createSelect();
    video2Select.position(10, video1Select.y + video1Select.height + 20);
    video2Select.option('Random');
    video2Select.option('Sample Video 2');
    video2Select.option('Upload File');
    video2Select.changed(() => handleVideoInput(2));

    video2BlendDropdown = createSelect();
    video2BlendDropdown.position(video2Select.x + video2Select.width + 100, video2Select.y);
    addBlendOptions(video2BlendDropdown);
    video2BlendDropdown.changed(() => changeBlendMode(2, video2BlendDropdown.value()));

    playPauseButton = createButton('Play/Pause');
    playPauseButton.position(10, video2Select.y + video2Select.height + 20);
    playPauseButton.mousePressed(togglePlayPause);
}

function draw() {
    background(255);
    handleUIVisibility();
    let micSensitivity = micSensitivitySlider.value();

    let p = new Particle();
    particles.push(p);

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].show();
        if (particles[i].edges()) {
            particles.splice(i, 1);
        }
    }

    drawAudioVisualizer();
    drawVideos();
}

function drawAudioVisualizer() {
    translate(width / 2, height / 2);
    fft.analyze();
    let amp = fft.getEnergy(20, 200);
    push();
    if (amp > 250) {
        rotate(random(-1, 1));
    }
    image(img, 0, 0, width + 100, height + 100);
    pop();

    let vignetteIntensity = map(amp, 0, 255, 30, 100);
    drawVignette(vignetteIntensity);

    var alpha = map(amp, 0, 255, 0, 180);
    fill(20, alpha);
    noStroke();
    rect(0, 0, width, height);

    stroke(0, alpha);
    strokeWeight(4);
    noFill();

    var wave = fft.waveform();
    for (var t = -1; t <= 1; t += 2) {
        beginShape();
        for (var i = 0; i <= 180; i += 1) {
            var index = floor(map(i, 0, 180, 0, wave.length - 1));
            var r = map(wave[index], -1, 1, 45, 224);
            var x = r * sin(i) * t;
            var y = r * cos(i);
            vertex(x, y);
        }
        endShape();
    }
}

function drawVideos() {
    if (video1 && video1.width > 0) {
        let blendMode1 = video1BlendDropdown.value();
        changeBlendMode(blendMode1);
        image(video1, 0, 0, width, height);
    }

    if (video2 && video2.width > 0) {
        let blendMode2 = video2BlendDropdown.value();
        changeBlendMode(blendMode2);
        image(video2, 0, 0, width, height);
    }
}

function changeBlendMode(mode) {
    let p5BlendMode;
    switch (mode) {
        case 'ADD':
            p5BlendMode = ADD;
            break;
        // ... handle other cases similarly ...
        default:
            p5BlendMode = BLEND;
    }
    blendMode(p5BlendMode);
}

function handleUIVisibility() {
    if (millis() - uiTimeout > 5000) {
        hideUI();
    }
}

function hideUI() {
    micSensitivitySlider.hide();
}

function showUI() {
    micSensitivitySlider.show();
}

function togglePlayPause() {
    if (song.isPlaying()) {
        song.pause();
        playPauseButton.html('Play');
    } else {
        song.loop();
        playPauseButton.html('Pause');
    }
}

function addBlendOptions(dropdown) {
    const blendModes = ['BLEND', 'ADD', 'DARKEST', 'LIGHTEST', 'DIFFERENCE', 'EXCLUSION', 'MULTIPLY', 'SCREEN', 'REPLACE', 'OVERLAY', 'HARD_LIGHT', 'SOFT_LIGHT', 'DODGE', 'BURN'];
    blendModes.forEach(mode => dropdown.option(mode));
}

function updateSensitivity(value) {
    mic.amp(value);
}

function drawVignette(intensity) {
    let gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, width);
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity / 100})`);
    drawingContext.fillStyle = gradient;
    drawingContext.fillRect(-width / 2, -height / 2, width, height);
}

function videoLoadCallback() {
    console.log("Video loaded");
}

function handleAudioInput() {
    let choice = audioInputSelect.value();
    switch (choice) {
        case 'Microphone':
            mic.start();
            break;
        case 'Sample Audio':
            song = loadSound("Demo_Track.mp3");
            song.play();
            break;
        case 'Upload File':
            userAudioFile = createFileInput(file => {
                userAudioFile = loadSound(file.data);
            });
            break;
    }
}

function handleVideoInput(videoNumber) {
    let choice = videoNumber === 1 ? video1Select.value() : video2Select.value();
    switch (choice) {
        case 'Sample':
            if (videoNumber === 1) {
                video1 = createVideo(['Sample_Video1.mp4'], videoLoadCallback);
                video1.loop();
                video1.hide();
            } else {
                video2 = createVideo(['Sample_Video2.mp4'], videoLoadCallback);
                video2.loop();
                video2.hide();
            }
            break;
        case 'Upload File':
            // Upload file logic...
            break;
    }
}

class Particle {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.vx = random(-1, 1);
        this.vy = random(-1, 1);
        this.alpha = 255;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 5;
    }

    show() {
        noStroke();
        fill(255, this.alpha);
        ellipse(this.x, this.y, 16);
    }

    edges() {
        return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
    }
}
