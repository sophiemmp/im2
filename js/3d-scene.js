import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { moonPhase, tweenGroup, transitionToMoonPhaseScene, transitionToClockScene } from './animate-3d.js';

// basic constances
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera( 2, window.innerWidth / window.innerHeight, 0.1, 1000 );
export const pivot = new THREE.Object3D();
scene.add(pivot);
pivot.add(camera);
camera.position.set( 0, 1.3, 40 );
pivot.rotation.set(0, 3, 0)

export const renderer = new THREE.WebGLRenderer();

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
export const moonPivot = new THREE.Object3D();
moonPivot.position.copy(moon.position);
scene.add(moonPivot);


// load hubble model
loader.load('assets/hubble.glb', (gltf) => {
	const model = gltf.scene;
	model.name = 'hubbleModel';
	model.rotation.set(-2, 3.7500, -1);
	model.scale.setScalar(0.0005);
	model.position.set(0, 0, 0)
	hubble.add(model);
});

moonPivot.add(moon);
moon.add(hubble);
hubble.position.set(7, 1.6, -49.06)


// add light
export const moonLight = new THREE.DirectionalLight(0xffffff, 0)
moonLight.target = moon;
scene.add(moonLight);

export const hubbleLight = new THREE.DirectionalLight(0xffffff, 5)
hubbleLight.target = hubble;
hubbleLight.position.set(100, -20, 0);
scene.add(hubbleLight);

export const ambientMoonLight = new THREE.AmbientLight(0xffffff, 5)
scene.add(ambientMoonLight);

// camera position


// eventListener to resize scene to window size
window.addEventListener( 'resize', onWindowResize, false );

// render animation function (has to be at the bottom)
function animate(time) {
	tweenGroup.update(time);
	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// resize scene on window resize
function onWindowResize() {

    camera.aspect = renderContainer.clientWidth / renderContainer.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(renderContainer.clientWidth, renderContainer.clientHeight);
}

export function clockScene() {
	/* 
	camera.position.set( 0, 1.6, 50 );
	pivot.rotation.set(0, 3, 0)
	hubbleLight.intensity = 5;
	ambientMoonLight.intensity = 5;
	moonLight.intensity = 0;
	moonLight.position.set(-1, 0, 10)
	*/
	
	transitionToClockScene(() => {
		  
	});
}

export function moonPhaseScene() {
	/*
	camera.position.set(0, 0, 100 );
	pivot.rotation.set(0, 0, 0)
	hubbleLight.intensity = 0;
	ambientMoonLight.intensity = 0.1;
	moonLight.intensity = 5;
	moonLight.position.set(-1, 0, 10)
	moonPhase(18.6, moonLight);
	*/
	transitionToMoonPhaseScene(() => {
	  	moonPhase(18.6, moonLight);
	});
}

