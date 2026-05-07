import { renderer, scene, camera, moonLight } from "./3d-scene.js";

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
	const duration = 3000;
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