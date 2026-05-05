import { handleVisibilityForClock, stopClockInterval } from "./clock.js";

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
		});
		break;

		case "moonphase":
			loadWidgetContent(widget);
			break;

		case "apod":
			loadWidgetContent(widget);
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