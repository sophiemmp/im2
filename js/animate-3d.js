import { renderer, scene, camera, pivot, moon, hubble, moonPivot, moonLight, hubbleLight, ambientMoonLight } from "./3d-scene.js";
import { Tween, Easing, Group } from '@tweenjs/tween.js';

export let currentScene = 'clock';

export function calcResponsiveBreakpoints() {
	const w = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	const h = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

	// ---- helpers ----

	const lerp = (a, b, t) => a + (b - a) * t;

	const lerpArr = (a, b, t) =>
		a.map((v, i) => lerp(v, b[i], t));

	// 1D breakpoint solver
	const solve1D = (value, breakpoints) => {
		if (!breakpoints?.length) return null;

		if (value <= breakpoints[0][0]) return breakpoints[0][1].slice();
		const last = breakpoints[breakpoints.length - 1];
		if (value >= last[0]) return last[1].slice();

		for (let i = 0; i < breakpoints.length - 1; i++) {
			const [v0, r0] = breakpoints[i];
			const [v1, r1] = breakpoints[i + 1];

			if (value >= v0 && value <= v1) {
				const t = (value - v0) / (v1 - v0);
				return lerpArr(r0, r1, t);
			}
		}

		return breakpoints[0][1].slice();
	};

	// 2D breakpoint solver
	const solve2D = (width, height, grid) => {
		const widthKeys = Object.keys(grid)
			.map(Number)
			.sort((a, b) => a - b);

		if (!widthKeys.length) return null;

		// clamp width range
		const wMin = widthKeys[0];
		const wMax = widthKeys[widthKeys.length - 1];

		const wClamped = Math.min(Math.max(width, wMin), wMax);

		// find width interval
		let w0 = widthKeys[0];
		let w1 = widthKeys[widthKeys.length - 1];

		for (let i = 0; i < widthKeys.length - 1; i++) {
			if (wClamped >= widthKeys[i] && wClamped <= widthKeys[i + 1]) {
				w0 = widthKeys[i];
				w1 = widthKeys[i + 1];
				break;
			}
		}

		const tW = w0 === w1 ? 0 : (wClamped - w0) / (w1 - w0);

		// solve height for both width slices
		const h0 = solve1D(height, grid[w0]);
		const h1 = solve1D(height, grid[w1]);

		if (!h0 || !h1) return null;

		// interpolate between width slices
		return lerpArr(h0, h1, tW);
	};

	// ---- YOUR BREAKPOINTS ----

	const bp = {
		moonScaleMoonPhase: {
			320: [
				[0, [1]],
			],
			768: [
				[0, [1]],
			]
		},
		cameraPositionStart: {
			320: [
				[0, [0, 1.4, 60]],
			],
			768: [
				[0, [0, 1.3, 40]],
			]
		},
	
		cameraPosition: {
			320: [
				[0, [0, 1.8, 70]],
			],
			768: [
				[0, [0, 1.6, 50]],
			]
		},
	
		cameraPositionMoonPhase: {
			900: [
				[906, [0, 1.5, 200]],
				[1280, [0, 1.5, 200]],
			],
			901: [
				[400, [4.5, 0, 150]],
				[906, [1.2, 0, 150]],
				[907, [0, 1.5, 170]],
				[1280, [0, 1.5, 170]],
			],
			1400: [
				[400, [3.5, 0, 150]],
				[906, [2.25, 0, 165]],
				[907, [0, 1.5, 165]],
				[1280, [0, 1.5, 165]],
			],
			1401: [
				[906, [2.25, 0, 165]],
				[907, [1.75, 0, 165]],
				[1280, [1.75, 0, 165]],
			],
			3000: [
				[906, [3.5, 0, 100]],
				[1280, [3.5, 0, 150]],
			]
		},
	
		hubblePositionClock: {
			320: [
				[0, [1.75, 1.58, -10]],
			],
			768: [
				[0, [2, 1.6, -10]],
			]
		},
	
		hubblePositionApod: {
			600: [
				[906, [6, 1.55, -42.1]],
			],
			601: [
				[906, [6, 1.65, -41.5]],
				[1280, [5, 1.68, -34.5]],
			],
			900: [
				[906, [6, 1.6, -41.45]],
				[1280, [5, 1.6, -34.5]],
			],
			2000: [
				[906, [6, 1.6, -41.0]],
				[1280, [5.6, 1.6, -38.15]],
			],
			3000: [
				[906, [6, 1.6, -39.5]],
				[1280, [5.6, 1.6, -37.5]],
			]
		},
	
		hubbleScale: {
			320: [
				[0, [0.05]],
			],
			768: [
				[0, [0.04]],
			]
		}
	};
	

	// ---- compute result ----

	const result = {};

	for (const key of Object.keys(bp)) {
		result[key] = solve2D(w, h, bp[key]);
	}

	return result;
}

export function applyResponsiveLayout(currentScene) {
	const r = calcResponsiveBreakpoints();
	

	switch(currentScene) {

		case "clock":
			camera.position.set(r.cameraPosition[0], r.cameraPosition[1], r.cameraPosition[2]);
			hubble.position.set(r.hubblePositionClock[0], r.hubblePositionClock[1], r.hubblePositionClock[2]);
			break;

		case "moonphase":
			camera.position.set(r.cameraPositionMoonPhase[0], r.cameraPositionMoonPhase[1], r.cameraPositionMoonPhase[2]);
			break;

		case "apod":
			camera.position.set(r.cameraPosition[0], r.cameraPosition[1], r.cameraPosition[2]);
			hubble.position.set(r.hubblePositionApod[0], r.hubblePositionApod[1], r.hubblePositionApod[2]);
			break;
	}

	// hubble scale
	hubble.traverse((child) => {
		if (child.name === 'hubble') {
			child.scale.setScalar(r.hubbleScale[0]);
		}
	});
}

export const tweenGroup = new Group();

function customEase(t, curvature = 2) {
    return t < 0.5
        ? Math.pow(t * 2, 1 / curvature) / 2 // Fast start
        : 1 - Math.pow(-(t * 2 - 2), 1 / curvature) / 2; // Fast end
}

export function getCurrentValue(startValue, endValue, timePosition, curvature = 5) {
    // Normalize time position to a value between 0 and 1
    let t = Math.min(Math.max(timePosition, 0), 1); // Ensure t is within [0, 1]
    const easedT = customEase(t, curvature); // Apply easing function

    // Interpolate value based on easedT
    return startValue + (endValue - startValue) * easedT; 
}

export function moonPhase(ageDays) {
	const maxDays = 29.5;
	const days = maxDays / 2;
	let startValue = 10;
	let endValue = -10;	
	
	ageDays = (ageDays + maxDays/2) % maxDays

	if (ageDays < days) {
		moonLight.position.x = -1;
	} else {
		moonLight.position.x = 1;
		ageDays = ageDays - days;
		startValue = -10;
		endValue = 10;
	}

	let maxTimePosition = getTimePosition(ageDays, days);

	animateMoonPhase(startValue, endValue, maxTimePosition);
}

function getTimePosition(ageDays, days) {
	const daysSince = ageDays / days;
	
	return daysSince;
}

function animateMoonPhase(startValue, endValue, maxTimePosition) {
	const duration = 1500;
    let startTime = null; // Reset start time

    function animate(timestamp) {
        if (!startTime) startTime = timestamp; // Set start time on first call
        let elapsed = timestamp - startTime; // Calculate how much time has passed
        let timePosition = Math.min(elapsed / duration, 1); // Normalize time to 0-1
        
        // Get the current value based on the time position and easing function
        const zLPos = getCurrentValue(startValue, endValue, timePosition);
		
        moonLight.position.z = zLPos; // Update moon light position
        renderer.render(scene, camera); // Render the scene

        if (timePosition < maxTimePosition) {
            requestAnimationFrame(animate); 
        }
    }

    requestAnimationFrame(animate); // Start the animation loop
}

export function transitionToClockScene(onComplete) {

	currentScene = 'clock';

	const lightState = {
		hubble: hubbleLight.intensity,
		ambient: ambientMoonLight.intensity,
		moon: moonLight.intensity
	};

	new Tween(camera.position, tweenGroup)
		.to({ x: calcResponsiveBreakpoints()["cameraPosition"][0], y: calcResponsiveBreakpoints()["cameraPosition"][1], z: calcResponsiveBreakpoints()["cameraPosition"][2] }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(pivot.rotation, tweenGroup)
		.to({ x: 0, y: 3, z: 0 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

    new Tween(hubble.position, tweenGroup)
        .to({ x: calcResponsiveBreakpoints()["hubblePositionClock"][0], y: calcResponsiveBreakpoints()["hubblePositionClock"][1], z: calcResponsiveBreakpoints()["hubblePositionClock"][2] }, 2200)
        .easing(Easing.Cubic.InOut)
        .start();

	new Tween(hubble.rotation, tweenGroup)
        .to({ x: 0, y: 0, z: 0 }, 2200)
        .easing(Easing.Cubic.InOut)
        .start();

	new Tween(lightState, tweenGroup)
		.to({ hubble: 5, ambient: 5, moon: 0 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.onUpdate(() => {
			hubbleLight.intensity = lightState.hubble;
			ambientMoonLight.intensity = lightState.ambient;
			moonLight.intensity = lightState.moon;
		})
		.onComplete(() => {
			if (onComplete) onComplete();
		})
		.start();

	new Tween(moonLight.position, tweenGroup)
		.to({ x: -1, y: 0, z: 10 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();
}


export function transitionToMoonPhaseScene(onComplete) {

	currentScene = 'moonphase';

	const lightState = {
		hubble: hubbleLight.intensity,
		ambient: ambientMoonLight.intensity,
		moon: moonLight.intensity
	};

	new Tween(lightState, tweenGroup)
		.to({ hubble: 0, ambient: 0.1, moon: 5 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.onUpdate(() => {
			hubbleLight.intensity = lightState.hubble;
			ambientMoonLight.intensity = lightState.ambient;
			moonLight.intensity = lightState.moon;
		})
		.onComplete(() => {
			if (onComplete) onComplete();
		})
		.start();

    new Tween(pivot.rotation, tweenGroup)
        .to({ x: 0, y: 0, z: 0 }, 2200)
        .easing(Easing.Cubic.InOut)
        .start();

    new Tween(hubble.position, tweenGroup)
        .to({ x: 7, y: 1.6, z: -49.06 }, 2200)
        .easing(Easing.Cubic.Out)
        .start();

	new Tween(hubble.rotation, tweenGroup)
        .to({ x: 0, y: 0, z: 0 }, 2200)
        .easing(Easing.Cubic.InOut)
        .start();

	new Tween(camera.position, tweenGroup)
		.to({ x: calcResponsiveBreakpoints()["cameraPositionMoonPhase"][0], y: calcResponsiveBreakpoints()["cameraPositionMoonPhase"][1], z: calcResponsiveBreakpoints()["cameraPositionMoonPhase"][2]}, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(moonLight.position, tweenGroup)
		.to({ x: -1, y: 0, z: 10 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();
}


export function transitionToApodScene(onComplete) {

	currentScene = 'apod';

	const lightState = {
		hubble: hubbleLight.intensity,
		ambient: ambientMoonLight.intensity,
		moon: moonLight.intensity
	};

	new Tween(camera.position, tweenGroup)
		.to({ x: calcResponsiveBreakpoints()["cameraPosition"][0], y: calcResponsiveBreakpoints()["cameraPosition"][1], z: calcResponsiveBreakpoints()["cameraPosition"][2] }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(pivot.rotation, tweenGroup)
		.to({ x: 0, y: 3, z: 0 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(hubble.position, tweenGroup)
        .to({ x: calcResponsiveBreakpoints()["hubblePositionApod"][0], y: calcResponsiveBreakpoints()["hubblePositionApod"][1], z: calcResponsiveBreakpoints()["hubblePositionApod"][2] }, 2200)
        .easing(Easing.Cubic.InOut)
		.onComplete(() => {
			if (onComplete) onComplete();
		})
        .start();
	
	new Tween(hubble.rotation, tweenGroup)
        .to({ x: 0, y: -0.93, z: 0.310 }, 2200)
        .easing(Easing.Cubic.InOut)
        .start();

	new Tween(lightState, tweenGroup)
		.to({ hubble: 0, ambient: 0, moon: 0 }, 2700)
		.easing(Easing.Quadratic.InOut)
		.onUpdate(() => {
			hubbleLight.intensity = lightState.hubble;
			ambientMoonLight.intensity = lightState.ambient;
			moonLight.intensity = lightState.moon;
		})
		.start();

	new Tween(moonLight.position, tweenGroup)
		.to({ x: -1, y: 0, z: 10 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();
}

const TWEEN_DURATION = 300;  // ms

export function modelScale(root, targetScale, tweenGroup) {
	if (!root) return;
	const start = { s: root.scale.x };
	const end = { s: targetScale };

	if (root._scaleTween) {
		root._scaleTween.stop();
	}

	// use the same constructor form you already use elsewhere
	root._scaleTween = new Tween(start, tweenGroup)
		.to(end, TWEEN_DURATION)
		.easing(Easing.Quadratic.Out)
		.onUpdate((v) => {
			root.scale.setScalar(v.s);
		})
		.onComplete(() => {
			root._scaleTween = null;
		})
		.start();
}

export function scaleModels(model, targetScale, onComplete) {
	if (!model) return;
	if (model._scaleTween) model._scaleTween.stop();

	model._scaleTween = new Tween(model.scale, tweenGroup)
		.to({ x: targetScale, y: targetScale, z: targetScale }, 300)
		.easing(Easing.Cubic.InOut)
		.onComplete(() => {
			model._scaleTween = null;
			if (typeof onComplete === 'function') onComplete();
		})
		.start();
}

