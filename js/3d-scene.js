import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { moonPhase, tweenGroup, transitionToMoonPhaseScene, transitionToClockScene } from './animate-3d.js';

// ===== Scene, camera, renderer =====
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(2, window.innerWidth / window.innerHeight, 0.1, 1000);
export const pivot = new THREE.Object3D();
scene.add(pivot);
pivot.add(camera);
camera.position.set(0, 1.3, 40);
pivot.rotation.set(0, 3, 0);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// container where scene is rendered
const renderContainer = document.getElementById('render-container');
renderContainer.appendChild(renderer.domElement);

// ===== Objects and hierarchy =====
export const moon = new THREE.Object3D();
export const hubble = new THREE.Object3D();

// create a pivot for moon/hubble placement
export const moonPivot = new THREE.Object3D();
scene.add(moonPivot);

// clear, consistent hierarchy:
moonPivot.add(moon);
moon.add(hubble);

// add lights
export const moonLight = new THREE.DirectionalLight(0xffffff, 0);
moonLight.target = moon;
scene.add(moonLight);

export const hubbleLight = new THREE.DirectionalLight(0xffffff, 5);
hubbleLight.target = hubble;
hubbleLight.position.set(100, -20, 0);
scene.add(hubbleLight);

export const ambientMoonLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientMoonLight);

// ===== GLTF loading =====
const loader = new GLTFLoader();
const clickable = []; // will hold loaded model roots for raycasting

// load moon model
loader.load('assets/moon.glb', (gltf) => {
	const model = gltf.scene;
	model.name = 'moonModel';
	model.position.set(0, 0, 0);
	model.scale.setScalar(1);
	model.rotation.set(3.090, 0.030, 2.800);
	moon.add(model);

	clickable.push(model);

	// optional box helper for debugging
	// scene.add(new THREE.BoxHelper(model, 0xff0000));
}, undefined, (err) => {
  	console.error('Failed to load moon:', err);
});

// load hubble model
loader.load('assets/hubble.glb', (gltf) => {
	const model = gltf.scene;
	model.name = 'hubbleModel';
	// set a reasonable test scale/position; tweak to match your scene
	model.rotation.set(-2, 3.7500, -1);
	model.scale.setScalar(0.04);
	model.position.set(0, 0, 0);
	hubble.add(model);

	clickable.push(model);

	// optional box helper for debugging
	// scene.add(new THREE.BoxHelper(model, 0x00ff00));
}, undefined, (err) => {
  	console.error('Failed to load hubble:', err);
});

// position hubble relative to moon
hubble.position.set(7, 1.6, -49.06);

// ===== Resize handling =====
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
	const w = renderContainer.clientWidth || window.innerWidth;
	const h = renderContainer.clientHeight || window.innerHeight;
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
	renderer.setSize(w, h);
}

// ===== Animation loop =====
function animate(time) {
	tweenGroup.update(time);
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// ===== Scene control functions =====
export function clockScene() {
  	transitionToClockScene(() => {});
}

export function moonPhaseScene() {
	transitionToMoonPhaseScene(() => {
		moonPhase(11.6, moonLight);
	});
}

// ===== Raycasting & input =====
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const domElem = renderer.domElement;

// helper: compute pointer NDC relative to renderer DOM element
function updatePointerFromEvent(event) {
	const rect = domElem.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	pointer.x = (x / rect.width) * 2 - 1;
	pointer.y = - (y / rect.height) * 2 + 1;
}

// attach events to renderer.domElement so coordinates align
domElem.addEventListener('pointermove', (e) => updatePointerFromEvent(e));
domElem.addEventListener('click', (e) => {
	updatePointerFromEvent(e);

	// ensure camera world matrix is current
	camera.updateMatrixWorld();

	raycaster.setFromCamera(pointer, camera);

	// intersect the loaded model roots (checks children with true)
	const intersects = raycaster.intersectObjects(clickable, true);
	// debug:
	// console.log('intersects', intersects.length, intersects);

	if (intersects.length === 0) return;

	const hit = intersects[0].object;

	// Determine whether the hit belongs to moonModel or hubbleModel by walking parents
	let root = hit;
	while (root.parent && root.parent !== scene) root = root.parent;
	// root is now either the loaded model root (if it was added under moon/hubble) or a group

	// Check by name property (we set names on model roots)
	if (root.name === 'moonModel') {
		moonClicked();
	} else if (root.name === 'hubbleModel') {
		hubbleClicked();
	} else {
		// fallback: check if the hit is inside moon or hubble groups
		if (hit === moon || hit.parent === moon || hit.parent?.parent === moon) {
		moonClicked();
		} else if (hit === hubble || hit.parent === hubble || hit.parent?.parent === hubble) {
		hubbleClicked();
		}
	}
});

// callbacks
function moonClicked() {
	document.dispatchEvent(new CustomEvent('widget:navigate', { detail: 'moonphase' }));
}
function hubbleClicked() {
	document.dispatchEvent(new CustomEvent('widget:navigate', { detail: 'apod' }));
}