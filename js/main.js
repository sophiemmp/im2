import { loadWidget } from "./widgets.js";

// get Widget from url
const urlParams = new URLSearchParams(window.location.search);
const widget = urlParams.get('w')

// load Widget

loadWidget(widget);


// click areas
const logo = document.getElementById("logo");
const impressum = document.getElementById("impressum");

logo.addEventListener("click", function() {
	urlParams.set('w', "clock");
	history.pushState(null, null, "?"+urlParams.toString())
	loadWidget("clock");
});
impressum.addEventListener("click", function() {
	urlParams.set('w', "impressum");
	history.pushState(null, null, "?"+urlParams.toString())
	loadWidget("impressum");
});

document.addEventListener('widget:navigate', (e) => {
	const key = e.detail;
	urlParams.set('w', key);
	history.pushState(null, null, "?"+urlParams.toString());
	loadWidget(key);
});  

// footer
const footer = document.querySelector("footer");

document.addEventListener("mousemove", (e) => {
  const distanceFromBottom = window.innerHeight - e.clientY;

  if (distanceFromBottom <= 100) {
    footer.classList.add("show");
  } else {
    footer.classList.remove("show");
  }
});