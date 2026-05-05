import { loadWidget } from "./widgets.js";

// get Widget from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const widget = urlParams.get('w')

// load Widget

loadWidget(widget);