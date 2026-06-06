import * as THREE from 'three';
import { finishedLoading } from './main.js';
import { setupLoading, clickable } from './loader.js';
import { calcResponsiveBreakpoints, currentScene, applyResponsiveLayout, moonPhase, tweenGroup, transitionToMoonPhaseScene, transitionToClockScene, transitionToApodScene, scaleModels } from './animate-3d.js';
import { getAgeDays } from './moonphase.js';

// ===== Scene, camera, renderer =====
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(2, window.innerWidth / window.innerHeight, 0.1, 1000);
export const pivot = new THREE.Object3D();
scene.add(pivot);
pivot.add(camera);
camera.position.set(calcResponsiveBreakpoints()["cameraPositionStart"][0], calcResponsiveBreakpoints()["cameraPositionStart"][1], calcResponsiveBreakpoints()["cameraPositionStart"][2]);
pivot.rotation.set(0, 3, 0);

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderContainer = document.getElementById('render-container');
renderContainer.appendChild(renderer.domElement);

// ===== Objects and Lights =====

// objects
export const moon = new THREE.Object3D();
export const hubble = new THREE.Object3D();

// pivot
export const moonPivot = new THREE.Object3D();
scene.add(moonPivot);

moonPivot.add(moon);
moon.add(hubble);

// lights
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

setupLoading(scene, moon, hubble, finishedLoading);

// position hubble relative to moon
hubble.position.set(7, 1.6, -49.06);

// ===== Resize handling =====
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
	const w = renderContainer.clientWidth || window.innerWidth;
	const h = renderContainer.clientHeight || window.innerHeight;

	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize(w, h);

	applyResponsiveLayout(currentScene);
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
		moonPhase(getAgeDays(), moonLight);
	});
}

export function apodScene() {
	transitionToApodScene(() => {
		document.querySelector(".apod-container").classList.toggle("hidden");
	});
}

// ===== Raycasting & input =====
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const domElem = renderer.domElement;

function updatePointerFromEvent(event) {
	const rect = domElem.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	pointer.x = (x / rect.width) * 2 - 1;
	pointer.y = - (y / rect.height) * 2 + 1;
}

// eventhandlers added to objects
domElem.addEventListener('pointermove', (e) => updatePointerFromEvent(e));
domElem.addEventListener('click', (e) => {
	updatePointerFromEvent(e);

	camera.updateMatrixWorld();

	raycaster.setFromCamera(pointer, camera);

	const intersects = raycaster.intersectObjects(clickable, true);

	if (intersects.length === 0) return;

	const hit = intersects[0].object;

	let root = hit;
	while (root && root !== scene) {
	if (root.name === 'moon' || root.name === 'hubble') break;
	root = root.parent;
	}

	if (root?.name === 'moon') { 
		moonClicked();
	} else if (root?.name === 'hubble') { 
		hubbleClicked(); 
	} else {
		let ancestor = hit;
		while (ancestor) {
			if (ancestor === moon) {
				moonClicked();
				break; 
			}
			if (ancestor === hubble) {
				hubbleClicked(); 
				break; 
			}
			ancestor = ancestor.parent;
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

// hover animation

let hoveredRoot = null;

function findModelRoot(obj) {
	let root = obj;
	while (root && root !== scene) {
		if (root.name === 'moon' || root.name === 'hubble') return root;
		root = root.parent;
	}
	return null;
}


domElem.addEventListener('pointermove', (e) => {
	updatePointerFromEvent(e);
	camera.updateMatrixWorld();
	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster.intersectObjects(clickable, true);

	if (intersects.length === 0) {
		if (hoveredRoot) {
			const orig = hoveredRoot._origScale ?? hoveredRoot.scale.x;
			scaleModels(hoveredRoot, orig);
			delete hoveredRoot._origScale;
			hoveredRoot = null;
			domElem.style.cursor = '';
		}
		return;
	}

	const hit = intersects[0].object;
	const root = findModelRoot(hit);

	if (root && (root.name === 'moon' || root.name === 'hubble')) {
		if (hoveredRoot !== root) {
			if (hoveredRoot) {
				const prevOrig = hoveredRoot._origScale ?? hoveredRoot.scale.x;
				scaleModels(hoveredRoot, prevOrig);
				delete hoveredRoot._origScale;
			}
			hoveredRoot = root;
			hoveredRoot._origScale = hoveredRoot._origScale ?? hoveredRoot.scale.x;
			scaleModels(hoveredRoot, hoveredRoot._origScale * 1.05);
			domElem.style.cursor = 'pointer';
		}
	} else {
		if (hoveredRoot) {
			const orig = hoveredRoot._origScale ?? hoveredRoot.scale.x;
			scaleModels(hoveredRoot, orig);
			delete hoveredRoot._origScale;
			hoveredRoot = null;
			domElem.style.cursor = '';
		}
	}
});
