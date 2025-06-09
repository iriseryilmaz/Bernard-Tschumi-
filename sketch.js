let mic, fft;
let baseCube = [];
let distortionSound;
let lastTriggerTime = 0;
let triggerCooldown = 500; // ms

function preload() {
  distortionSound = loadSound("distortion.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight * 0.85, WEBGL);
  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.9, 64);
  fft.setInput(mic);

  let s = 100;
  baseCube = [
    createVector(-s, -s, -s),
    createVector(s, -s, -s),
    createVector(s, s, -s),
    createVector(-s, s, -s),
    createVector(-s, -s, s),
    createVector(s, -s, s),
    createVector(s, s, s),
    createVector(-s, s, s)
  ];
}

function draw() {
  background(10);
  orbitControl();

  let spectrum = fft.analyze();
  let level = fft.getEnergy("bass");
  let deformLevel = map(level, 0, 255, 0, 60);

  // Eğer deformasyon ciddi bir eşik geçiyorsa sesi çal
  if (level > 120 && millis() - lastTriggerTime > triggerCooldown) {
    if (!distortionSound.isPlaying()) {
      distortionSound.play();
      lastTriggerTime = millis();
    }
  }

  rotateY(frameCount * 0.01);
  rotateX(frameCount * 0.005);

  let deformed = [];
  for (let i = 0; i < baseCube.length; i++) {
    let v = baseCube[i].copy();
    let n = noise(v.x * 0.01 + frameCount * 0.01, v.y * 0.01, v.z * 0.01);
    let deform = map(n, 0, 1, -deformLevel, deformLevel);
    let direction = p5.Vector.random3D().mult(deform);
    v.add(direction);
    deformed.push(v);
  }

  let edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  stroke(255);
  strokeWeight(2);
  noFill();
  beginShape(LINES);
  for (let e of edges) {
    vertex(deformed[e[0]].x, deformed[e[0]].y, deformed[e[0]].z);
    vertex(deformed[e[1]].x, deformed[e[1]].y, deformed[e[1]].z);
  }
  endShape();
}