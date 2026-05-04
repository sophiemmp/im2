import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// basic constances
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 0, 50 );
camera.lookAt( 0, 0, 0 );

const renderer = new THREE.WebGLRenderer();

// container where scene is rendered
const renderContainer = document.getElementById('render-container');

renderer.setSize( window.innerWidth, window.innerHeight );

// add scene to DOM
renderContainer.appendChild(renderer.domElement);


// === load 3d model ===
const loader = new GLTFLoader();

const moon = new THREE.Object3D(); 
const hubble = new THREE.Object3D();
scene.add(moon, hubble);

// load first model
loader.load('assets/moon.glb', (gltf) => {
	const model = gltf.scene;
	model.name = 'moonMode';
	model.position.set(0, -1.8, -1);
	model.scale.setScalar(1.25);
	model.rotation.set(1.07, 0.15, -1.12);
	moon.add(model);
});

loader.load('assets/hubble.glb', (gltf) => {
	const model = gltf.scene;
	model.name = 'hubbleModel';
	model.position.set(-0.59, -0.14, 0.48);
	model.scale.setScalar(0.04);
	model.rotation.set(1.07, 0.15, -1.12);
	hubble.add(model);
});

scene.position.set(0, 0, -1);


// add light
const moonLight = new THREE.DirectionalLight(0xffffff, 3)
moonLight.target = moon;
scene.add(moonLight);

const hubbleLight = new THREE.DirectionalLight(0xffffff, 3)
hubbleLight.target = hubble;
hubbleLight.position.set(2, -5, 2);
scene.add(hubbleLight);

// camera position
camera.position.z = 2;

// eventListener to resize scene to window size
window.addEventListener( 'resize', onWindowResize, false );

// render animation function (has to be at the bottom)
function animate(time) {
  
	renderer.render(scene, camera);
  }
// render animated scene
renderer.setAnimationLoop( animate );


// resize scene on window resize
function onWindowResize() {

    camera.aspect = renderContainer.clientWidth / renderContainer.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
}

// Zeit, Datum, Zeitzone
function updateTimeBox() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;

    document.getElementById("year").textContent = year;
    document.getElementById("month").textContent = month;
    document.getElementById("day").textContent = day;

    document.getElementById("timezone").textContent = "Bern";
}

updateTimeBox();
setInterval(updateTimeBox, 1000);