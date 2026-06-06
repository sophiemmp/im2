const apodStorage = "apod_data";
const apodApiKey = "mqqOfVtBFRR290kB0AqtfLhwym648ASgQ1UlczKL";

async function loadApodData() {
	const res = await fetch(
		`https://api.nasa.gov/planetary/apod?api_key=${apodApiKey}`
	);
	if (!res.ok) throw new Error("NASA API request failed");
	return res.json();
}

export async function preloadApodData() {
	const cached = sessionStorage.getItem(apodStorage);
	if (cached) {
		console.log("APOD data already preloaded");
		return JSON.parse(cached);
	}

	const data = await loadApodData();
	sessionStorage.setItem(apodStorage, JSON.stringify(data));
	console.log("APOD data preloaded and cached");

	if (data.media_type === "image") {
		const img = new Image();
		img.src = data.url;
	}

	return data;
}


export async function getApodData() {
	const cached = sessionStorage.getItem(apodStorage);
	if (cached) {
		return JSON.parse(cached);
	}

	const data = await loadApodData();
	sessionStorage.setItem(apodStorage, JSON.stringify(data));
	return data;
}

function renderApod(data) {
	const circle = document.querySelector(".circle");
	const title = document.getElementById("apod-title");
	const desc = document.getElementById("apod-description");
	const credit = document.getElementById("apod-credit");

	if (!circle || !title || !desc || !credit) return;

	title.textContent = data.title || "";
	desc.textContent = data.explanation || "";
	credit.textContent = data.copyright ? `© ${data.copyright}` : "© NASA";

	circle.innerHTML = "";

	if (data.media_type === "image") {
		const img = document.createElement("img");
		img.id = "apod-image";
		img.src = data.url;
		img.alt = data.title || "NASA APOD";
		circle.appendChild(img);
		enableFullscreenOnClick(img);
	} else if (data.media_type === "video") {
		const videoUrl = data.url || "";

		const previewVideo = document.createElement("video");
		previewVideo.id = "apod-image";
		previewVideo.className = "apod-preview-video";
		previewVideo.src = videoUrl;
		previewVideo.muted = true;
		previewVideo.playsInline = true;
		previewVideo.preload = "metadata";
		previewVideo.controls = false;

		const playBtn = document.createElement("button");
		playBtn.className = "play-btn";
		playBtn.id = "play-btn";
		playBtn.innerHTML = "▶";
		playBtn.setAttribute("aria-label", "Play video");

		circle.appendChild(previewVideo);
		circle.appendChild(playBtn);
		enableFullscreenOnClick(previewVideo);

		previewVideo.addEventListener("loadedmetadata", () => {
			if (previewVideo.duration && Number.isFinite(previewVideo.duration)) {
				previewVideo.currentTime = Math.random() * previewVideo.duration;
			}
		});

		playBtn.addEventListener("click", () => {
			circle.innerHTML = "";
			const video = document.createElement("video");
			video.id = "apod-video";
			video.src = videoUrl;
			video.controls = false;
			video.autoplay = true;
			video.playsInline = true;
			circle.appendChild(video);
			enableFullscreenOnClick(video);
		});
	} else {
		const img = document.createElement("img");
		img.id = "apod-image";
		img.src = "https://placehold.co/800x800/000000/ffffff?text=APOD";
		img.alt = "APOD unavailable";
		circle.appendChild(img);
		enableFullscreenOnClick(img);
	}

	addDescriptionToggleFunction();
}

export async function displayApod() {
	try {
		const data = await getApodData(apodApiKey);
		renderApod(data);
	} catch (err) {
		console.error("Failed to display APOD:", err);
	}
}


function enableFullscreenOnClick(element) {
	element.addEventListener("click", async () => {
		try {
			// enter fullscreen
			if (!document.fullscreenElement) {
				await element.requestFullscreen();

				if (element.tagName === "VIDEO") {
					element.controls = true;
				}
			}

			// exit fullscreen
			else {
				await document.exitFullscreen();

				if (element.tagName === "VIDEO") {
					element.controls = false;
				}
			}
		} catch (err) {
			console.error("Fullscreen failed:", err);
		}
	});

	// keeping controlls in sync
	document.addEventListener("fullscreenchange", () => {
		if (element.tagName === "VIDEO") {
			element.controls = document.fullscreenElement === element;
		}
	});
}

function addDescriptionToggleFunction() {
	const descWrapper = document.getElementById("desc-wrapper");
	const toggle = document.getElementById("toggle");

	if (!descWrapper || !toggle) return;

	toggle.addEventListener("click", (event) => {
		event.stopPropagation();

		descWrapper.classList.toggle("open");
		toggle.classList.toggle("open");
	});
}