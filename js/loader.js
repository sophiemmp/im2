import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { calcResponsiveBreakpoints } from './animate-3d.js';
import { getAgeDays, preloadMoonData } from './moonphase.js';
import { preloadApodData } from './apod.js';

// export the objects
export const clickable = [];

// loading manager and functions
const manager = new THREE.LoadingManager();
const minLoadTime = 2000;
const loader = new GLTFLoader(manager);

const loadingStatus = {
	three: false,
	apod: false,
	moon: false
};


function reportProgress(component, finished = true) {
	loadingStatus[component] = finished;
	const pending = Object.entries(loadingStatus)
		.filter(([_, done]) => !done)
		.map(([name]) => name);
	
	if (finished) {
		// Add .loaded class to the corresponding li
		const elementId = `loading-${component}`;
		const element = document.getElementById(elementId);
		if (element) {
			element.classList.add('loaded');
		}
	}
}

// loading elements
async function preloadApodWithTracking() {
	try {
		await preloadApodData();
		reportProgress('apod', true);
	} catch (err) {
		console.error("APOD preload failed:", err);
		reportProgress('apod', true);
	}
}

async function preloadMoonWithTracking() {
	try {
		await preloadMoonData();
		reportProgress('moon', true);
	} catch (err) {
		console.error("Moon preload failed:", err);
		reportProgress('moon', true);
	}
}

function minDelay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

// helper to load and add model
async function loadModel(url, parent, name, setupCallback) {
	try {
		const gltf = await loader.loadAsync(url);
		const model = gltf.scene;
		model.name = name;
		if (setupCallback) setupCallback(model);
		parent.add(model);
		clickable.push(model);
	} catch (err) {
		console.error(`Failed to load ${url}:`, err);
		throw err;
	}
}

// main loading function
export function setupLoading(scene, moon, hubble, onFinished) {
	
	const loadingTimeoutId = setTimeout(() => {
		const pending = Object.entries(loadingStatus)
			.filter(([_, done]) => !done)
			.map(([name]) => name);
		
		if (pending.length > 0) {
			console.warn(`It seams to take a bit longer: ${pending.join(', ')}`);
		}
	}, 10000);

	manager.onLoad = async () => {
		reportProgress('three', true);
		
		await Promise.all([
			new Promise(r => requestAnimationFrame(r)),
			minDelay(minLoadTime),
			preloadApodWithTracking("XXX"),
			preloadMoonWithTracking()
		]);
		
		clearTimeout(loadingTimeoutId);
		console.log('All loading complete');
		onFinished();
	};

	manager.onError = (url) => {
		console.error('Error loading', url);
		reportProgress('three', true);
		clearTimeout(loadingTimeoutId);
		requestAnimationFrame(() => onFinished());
	};

	// Mark Three.js as pending at start
	reportProgress('three', false);
	reportProgress('apod', false);
	reportProgress('moon', false);

	// Load the models
	Promise.all([
		loadModel('assets/moon.glb', moon, 'moon', (model) => {
			model.position.set(0, 0, 0);
			model.scale.setScalar(1);
			model.rotation.set(3.090, 0.030, 2.800);
		}),
		loadModel('assets/hubble.glb', hubble, 'hubble', (model) => {
			model.rotation.set(-2, 3.7500, -1);
			model.scale.setScalar(calcResponsiveBreakpoints()["hubbleScale"][0]);
			model.position.set(0, 0, 0);
			hubble.position.set(7, 1.6, -49.06);
		})
	]).catch((err) => {
		console.error('One or more models failed to load:', err);
	});
}
