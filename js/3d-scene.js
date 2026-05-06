import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// basic constances
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 2, window.innerWidth / window.innerHeight, 0.1, 1000 );
const pivot = new THREE.Object3D();
camera.position.set( 0, 0, 0 );
scene.add(pivot);
pivot.add(camera);

const renderer = new THREE.WebGLRenderer();

// container where scene is rendered
const renderContainer = document.getElementById('render-container');

renderer.setSize( window.innerWidth, window.innerHeight );

// add scene to DOM
renderContainer.appendChild(renderer.domElement);


// === load 3d model ===
const loader = new GLTFLoader();

export const moon = new THREE.Object3D(); 
export const hubble = new THREE.Object3D();
scene.add(moon, hubble);

// load moon model
loader.load('assets/moon.glb', (gltf) => {
	const model = gltf.scene;
	model.name = 'moonModel';
	model.position.set(0, 0, 0);
	model.scale.setScalar(1);
	model.rotation.set(3.090, 0.030, 2.800);
	moon.add(model);
});

// moon pivot for positioning hubble
const moonPivot = new THREE.Object3D();
moonPivot.position.copy(moon.position);
scene.add(moonPivot);


// load hubble model
loader.load('assets/hubble.glb', (gltf) => {
	const model = gltf.scene;
	model.name = 'hubbleModel';
	model.rotation.set(-2, 3.7500, -1);
	model.scale.setScalar(0.001);
	model.position.set(0, 0, 0)
	hubble.add(model);
});

moonPivot.add(moon);
moon.add(hubble);
hubble.position.set(7, 1.6, -49)


// add light
const moonLight = new THREE.DirectionalLight(0xffffff, 5)
moonLight.target = moon;
//scene.add(moonLight);

const hubbleLight = new THREE.DirectionalLight(0xffffff, 5)
hubbleLight.target = hubble;
// hubbleLight.position.set(2, -5, 2);
//scene.add(hubbleLight);

scene.add(new THREE.AmbientLight(0xffffff, 5));

// camera position


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

export function clockScene() {
	camera.position.set( 0, 1.6, 50 );
	pivot.rotation.set(0, 3, 0)
}

export function moonPhaseScene() {
	camera.position.set(0, 0, 100 );
}
