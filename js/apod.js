export async function loadApodData() {
	const circle = document.querySelector(".circle");
	const title = document.getElementById("apod-title");
	const desc = document.getElementById("apod-description");
	const credit = document.getElementById("apod-credit");

	const API_KEY = "mqqOfVtBFRR290kB0AqtfLhwym648ASgQ1UlczKL";

	if (!circle || !title || !desc || !credit) return;

	try {
		const res = await fetch(
			`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
		);

		if (!res.ok) throw new Error("NASA API request failed");

		const data = await res.json();
		console.log(data);

		title.textContent = data.title || "";
		desc.textContent = data.explanation || "";
		credit.textContent = data.copyright ? `© ${data.copyright}` : "© NASA";

		circle.innerHTML = "";

		// image
		if (data.media_type === "image") {
			const img = document.createElement("img");

			img.id = "apod-image";
			img.src = data.url;
			img.alt = data.title || "NASA APOD";

			circle.appendChild(img);

			enableFullscreenOnClick(img);
		}

		// video
		else if (data.media_type === "video") {
			const videoUrl = data.url || "";

			// preview video
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

			// random frame
			previewVideo.addEventListener("loadedmetadata", () => {
				if (previewVideo.duration && Number.isFinite(previewVideo.duration)) {
					previewVideo.currentTime =
						Math.random() * previewVideo.duration;
				}
			});

			// play video
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
		}

		// fallback
		else {
			const img = document.createElement("img");

			img.id = "apod-image";
			img.src =
				"https://placehold.co/800x800/000000/ffffff?text=APOD";

			img.alt = "APOD unavailable";

			circle.appendChild(img);

			enableFullscreenOnClick(img);
		}

		addDescriptionToggleFunction();
	} catch (err) {
		console.error("APOD error:", err);
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