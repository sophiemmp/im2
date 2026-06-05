import { handleVisibilityForClock, stopClockInterval } from "./clock.js";
import { loadApodData } from "./apod.js";
import { insertMoonData } from "./moonphase.js";
import { clockScene, moonPhaseScene, apodScene } from "./3d-scene.js";

export function loadWidget(widget) {
	document.removeEventListener("visibilitychange", handleVisibilityForClock);
	stopClockInterval();
  
	switch (widget) {
	  case "clock":
	  case null:
		widget = "clock";
		moveHeaderToCorner(false)
		loadWidgetContent(widget).then(function() {
		  handleVisibilityForClock();
		  document.addEventListener("visibilitychange", handleVisibilityForClock);
		  clockScene();
		});
		break;

		case "moonphase":
			moonPhaseScene();
			moveHeaderToCorner(true)
			loadWidgetContent(widget).then(function() {
				insertMoonData();
			});
			break;
			
			case "apod":
			moveHeaderToCorner(true)
			loadWidgetContent(widget).then(function() {
				loadApodData();
				apodScene();
			});
			break;
			
		case "impressum":
			moveHeaderToCorner(false)
			loadWidgetContent(widget);
			break;
			
		default:
			widget = "404";
			moveHeaderToCorner(false)
			loadWidgetContent(widget);
			break;
	}
}


async function loadWidgetContent(widget) {
	const widgetTarget = document.getElementById("widget-container");
	const widgetFile = "widgets/" + widget + ".html";

	const res = await fetch(widgetFile, { cache: 'no-store' });
	if (!res.ok) throw new Error(`Failed to load ${widget}: ${res.status}`);
  
	const widgetContentElement = await res.text();
  
	widgetTarget.innerHTML = widgetContentElement;
}

function moveHeaderToCorner(state) {
	const header = document.querySelector("header");
	const mobileArrows = document.querySelectorAll(".mobile-arrow");
	if (state) {		
		header.classList.add("corner-placement")
		mobileArrows.forEach(arrow => {
			arrow.classList.add("hide")
		});
	} else {
		header.classList.remove("corner-placement")
		mobileArrows.forEach(arrow => {
			arrow.classList.remove("hide")
		});
	}
}