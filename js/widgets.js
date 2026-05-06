import { handleVisibilityForClock, stopClockInterval } from "./clock.js";
import { loadApodData } from "./apod.js";
import { clockScene, moonPhaseScene } from "./3d-scene.js";

export function loadWidget(widget) {
	document.removeEventListener("visibilitychange", handleVisibilityForClock);
	stopClockInterval();
  
	switch (widget) {
	  case "clock":
	  case null:
		widget = "clock";
		loadWidgetContent(widget).then(function() {
		  handleVisibilityForClock();
		  document.addEventListener("visibilitychange", handleVisibilityForClock);
		  clockScene();
		});
		break;

		case "moonphase":
			moonPhaseScene();
			loadWidgetContent(widget);
			break;

		case "apod":
			loadWidgetContent(widget).then(function() {
				loadApodData();
			});
			break;

		case "impressum":
			loadWidgetContent(widget);
			break;

		default:
			widget = "404";
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
