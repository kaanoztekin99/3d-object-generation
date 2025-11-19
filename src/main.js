console.log("ACTIVE MAIN.JS IS THIS ONE");

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log("THREE version:", THREE.REVISION);
console.log("3D Survey app starting...");

/**
 * Belirtilen container içine (div id'si) bir three.js sahnesi kurar
 * ve verilen GLB modelini yükler.
 */
function createViewer(containerId, modelUrl) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} bulunamadı.`);
    return;
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  // SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('rgb(255, 255, 255)');
  
  // CAMERA
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.set(0, 1, 3);

  // RENDERER
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // LIGHTS
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222233, 1.2);
  hemiLight.position.set(0, 1, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // Basit bir grid (istersen silebilirsin)
  const grid = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
  grid.position.y = -1;
  scene.add(grid);

  // CONTROLS
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);
  controls.zoomSpeed = 10.0;

  // MODEL LOAD
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // Modeli merkeze al ve kamera için uygun uzaklığı ayarla
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      model.position.sub(center); // modeli orijine taşı

      // Kamerayı modele göre konumlandır
      camera.near = size / 100;
      camera.far = size * 10;
      camera.updateProjectionMatrix();

      camera.position.set(size / 2, size / 3, size);
      controls.update();
    },
    (xhr) => {
      // Yükleme ilerlemesini loglayabilirsin (opsiyonel)
      // console.log(`${modelUrl}: ${(xhr.loaded / xhr.total) * 100}% yüklendi`);
    },
    (error) => {
      console.error(`Model yüklenirken hata oluştu: ${modelUrl}`, error);
    }
  );

  // RESIZE
  function onWindowResize() {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight || 400; // bazı durumlarda 0 olabiliyor

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
  }

  window.addEventListener('resize', onWindowResize);

  // ANIMATION LOOP
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Gerekirse dışarıdan erişmek için dönen obje:
  return { scene, camera, renderer, controls };
}

const viewerA = createViewer('viewerA', 'assets/models/midi3d_lib_table.glb');
const viewerB = createViewer('viewerB', 'assets/models/partCrafter_lib_table.glb');

