import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ------------------------------
//  THREE VIEWER
// ------------------------------
function createViewer(containerId, modelUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('rgb(255,255,255)');

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.set(0, 1, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 1.2);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const loader = new GLTFLoader();
  loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    camera.position.set(size / 2, size / 3, size);
    controls.update();
  });

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight || 400;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  function loop() {
    requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  }
  loop();
}

// ------------------------------
// IMAGE VIEWER
// ------------------------------
function createImageViewer(containerId, url) {
  const c = document.getElementById(containerId);
  if (!c) return;

  const img = document.createElement("img");
  img.src = url;
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  c.appendChild(img);
}

// ------------------------------
// QUESTION CONFIG
// ------------------------------
const QUESTION_CONFIG = [
  {
    id: 'q1',
    text: 'Q1: Please rate the overall visual quality of the scene. (1 = very poor, 5 = excellent)',
    modelA: 'assets/models/midi/midi3d_lib_table.glb',
    modelB: 'assets/models/partCrafter/partCrafter_lib_table.glb',
    image: 'assets/images/lib_table.jpeg',
  },
  {
    id: 'q2',
    text: 'Q2: How realistic does the lighting and shading of the scene look?',
    modelA: 'assets/models/midi/midi3d_bottle.glb',
    modelB: 'assets/models/partCrafter/partCrafter_bottle.glb',
    image: 'assets/images/bottle.jpeg',

  },
  {
    id: 'q3',
    text: 'Q3: //TODO',
    modelA: 'assets/models/midi/midi3d_lib_chair.glb',
    modelB: 'assets/models/partCrafter/partCrafter_lib_chair.glb',
    image: 'assets/images/lib_chair.jpeg',
  },
  {
    id: 'q4',
    text: 'Q4: //TODO',
    modelA: 'assets/models/midi/midi3d_lib_desk.glb',
    modelB: 'assets/models/partCrafter/partCrafter_lib_desk.glb',
    image: 'assets/images/lib_desk.jpeg',
  },
  {
    id: 'q5',
    text: 'Q5: //TODO',
    modelA: 'assets/models/midi/midi3d_sample_room.glb',
    modelB: 'assets/models/partCrafter/partCrafter_sample_room.glb',
    image: 'assets/images/sample_room.png',
  },
  {
    id: 'q6',
    text: 'Q6: //TODO',
    modelA: 'assets/models/midi/midi3d_dino.glb',
    modelB: 'assets/models/partCrafter/partCrafter_dino.glb',
    image: 'assets/images/toy_dino.png',
  },
  {
    id: 'q7',
    text: 'Q7: //TODO',
    modelA: 'assets/models/midi/midi3d_sample_bedroom.glb',
    modelB: 'assets/models/partCrafter/partCrafter_sample_bedroom.glb',
    image: 'assets/images/sample_bedroom.png',
  },
];


// ------------------------------
// BUILD SURVEY
// ------------------------------
const root = document.getElementById("survey-root");

QUESTION_CONFIG.forEach((q) => {

  const viewerRow = document.createElement("div");
  viewerRow.className = "viewer-container";

  const idA = `${q.id}-A`;
  const idIMG = `${q.id}-IMG`;
  const idB = `${q.id}-B`;

  const divA = document.createElement("div");
  divA.className = "viewer";
  divA.id = idA;

  const divIMG = document.createElement("div");
  divIMG.className = "viewer";
  divIMG.id = idIMG;

  const divB = document.createElement("div");
  divB.className = "viewer";
  divB.id = idB;

  // Random left-right swap
  const swap = Math.random() < 0.5;
  q.swap = swap;

  if (swap) {
    viewerRow.appendChild(divB);
    viewerRow.appendChild(divIMG);
    viewerRow.appendChild(divA);
  } else {
    viewerRow.appendChild(divA);
    viewerRow.appendChild(divIMG);
    viewerRow.appendChild(divB);
  }

  root.appendChild(viewerRow);

  // Soru metni modellerin altına taşındı
  const qText = document.createElement("p");
  qText.style.textAlign = "center";
  qText.style.fontSize = "18px";
  qText.textContent = q.text;
  root.appendChild(qText);

  // Rating row (two blocks)
  const ratingRow = document.createElement("div");
  ratingRow.className = "rating-row";

  const leftBlock = document.createElement("div");
  leftBlock.className = "rating-block";

  const rightBlock = document.createElement("div");
  rightBlock.className = "rating-block";

  // Label assignment depends on swap
  const leftLabel = swap ? "Model B" : "Model A";
  const rightLabel = swap ? "Model A" : "Model B";

  leftBlock.innerHTML = `<p>${leftLabel}</p>`;
  rightBlock.innerHTML = `<p>${rightLabel}</p>`;

  // Left rating inputs
  for (let v = 1; v <= 5; v++) {
    leftBlock.innerHTML += `
      <label>
        <input type="radio" name="${q.id}_${leftLabel}" value="${v}" required>
        ${v}
      </label>`;
  }

  // Right rating inputs
  for (let v = 1; v <= 5; v++) {
    rightBlock.innerHTML += `
      <label>
        <input type="radio" name="${q.id}_${rightLabel}" value="${v}" required>
        ${v}
      </label>`;
  }

  ratingRow.appendChild(leftBlock);
  ratingRow.appendChild(rightBlock);
  root.appendChild(ratingRow);

  // Create viewers
  createViewer(idA, q.modelA);
  createImageViewer(idIMG, q.image);
  createViewer(idB, q.modelB);
});

// ------------------------------
//  CSV EXPORT (demografi + tüm ratingler)
// ------------------------------

  document.getElementById("submit-btn").addEventListener("click", async () => {

  const form = document.getElementById("survey-form");
  const formData = new FormData(form);

  const name = formData.get("participant_name");
  const gender = formData.get("gender");
  const age = formData.get("age");
  const exp = formData.get("experience_3d");

  const rows = []; // backend'e gönderilecek liste

  for (const [key, value] of formData.entries()) {
    if (["participant_name", "gender", "age", "experience_3d"].includes(key)) {
      continue;
    }

    const [qId, model] = key.split("_");
    if (!qId || !model) continue;

    rows.push([name, gender, age, exp, qId, model, value]);
  }

  // Backend'e isteği gönder
  const response = await fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows })
  });

  if (response.ok) {
    alert("Your responses have been saved. Thank you!");
  } else {
    alert("Failed to save the survey. Please try again.");
  }
  
});