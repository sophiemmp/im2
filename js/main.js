import { loadWidget } from "./widgets.js";

// get Widget from url
const urlParams = new URLSearchParams(window.location.search);
const widget = urlParams.get('w')

// load Widget

loadWidget(widget);


// click areas
const logo = document.getElementById("logo");
const moon = document.getElementById("moon");
const telescope = document.getElementById("telescope");
const impressum = document.getElementById("impressum");

logo.addEventListener("click", function() {
	urlParams.set('w', "clock");
	history.pushState(null, null, "?"+urlParams.toString())
	loadWidget("clock");
});
moon.addEventListener("click", function() {
	urlParams.set('w', "moonphase");
	history.pushState(null, null, "?"+urlParams.toString())
	loadWidget("moonphase");
});
telescope.addEventListener("click", function() {
	urlParams.set('w', "apod");
	history.pushState(null, null, "?"+urlParams.toString())
	loadWidget("apod");
});
impressum.addEventListener("click", function() {
	urlParams.set('w', "impressum");
	history.pushState(null, null, "?"+urlParams.toString())
	loadWidget("impressum");
});

//apod
document.addEventListener("DOMContentLoaded", () => {
    const descWrapper = document.getElementById("desc-wrapper");
    const toggle = document.getElementById("toggle");

    if (!descWrapper || !toggle) return;

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();

        descWrapper.classList.toggle("open");
        toggle.classList.toggle("open");
    });
});