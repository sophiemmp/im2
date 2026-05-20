import { renderer, scene, camera, pivot, moon, hubble, moonPivot, moonLight, hubbleLight, ambientMoonLight } from "./3d-scene.js";
import { Tween, Easing, Group } from '@tweenjs/tween.js';


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

	const lightState = {
		hubble: hubbleLight.intensity,
		ambient: ambientMoonLight.intensity,
		moon: moonLight.intensity
	};

	new Tween(camera.position, tweenGroup)
		.to({ x: 0, y: 1.6, z: 50 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(pivot.rotation, tweenGroup)
		.to({ x: 0, y: 3, z: 0 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

    new Tween(hubble.position, tweenGroup)
        .to({ x: 2, y: 1.6, z: -10 }, 2200)
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
		.to({ x: 0, y: 0, z: 100 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(moonLight.position, tweenGroup)
		.to({ x: -1, y: 0, z: 10 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();
}


export function transitionToApodScene(onComplete) {

	const lightState = {
		hubble: hubbleLight.intensity,
		ambient: ambientMoonLight.intensity,
		moon: moonLight.intensity
	};

	new Tween(camera.position, tweenGroup)
		.to({ x: 0, y: 1.6, z: 50 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(pivot.rotation, tweenGroup)
		.to({ x: 0, y: 3, z: 0 }, 1500)
		.easing(Easing.Quadratic.InOut)
		.start();

	new Tween(hubble.position, tweenGroup)
        .to({ x: 6, y: 1.6, z: -41.5 }, 2200)
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

