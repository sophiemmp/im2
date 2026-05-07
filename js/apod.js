export async function loadApodData() {
  const circle = document.querySelector(".circle");
  const imgEl = document.getElementById("apod-image");
  const title = document.getElementById("apod-title");
  const desc = document.getElementById("apod-description");
  const credit = document.getElementById("apod-credit");
  const API_KEY = "KrDhKFygYUX010HIXVZy9gpOXs3XN1EyFSWWWPai";

  if (!circle || !imgEl || !title || !desc || !credit) return;

  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
    if (!res.ok) throw new Error("NASA API request failed");
    const data = await res.json();
    console.log(data);

    title.textContent = data.title || "";
    desc.textContent = data.explanation || "";
    credit.textContent = data.copyright ? `© ${data.copyright}` : "© NASA";

    circle.innerHTML = "";

    if (data.media_type === "image") {
      const img = document.createElement("img");
      img.id = "apod-image";
      img.src = data.url;
      img.alt = data.title || "NASA APOD";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      circle.appendChild(img);
    } else if (data.media_type === "video") {
      let videoUrl = data.url || "";

      try {
        const u = new URL(videoUrl);
        if (u.hostname.includes("youtube.com")) {
          const v = u.searchParams.get("v");
          if (v) videoUrl = `https://www.youtube.com/embed/${v}`;
        } else if (u.hostname === "youtu.be") {
          const id = u.pathname.slice(1);
          if (id) videoUrl = `https://www.youtube.com/embed/${id}`;
        }
      } catch (e) {
      }

      if (videoUrl.includes("youtube.com/embed") || videoUrl.includes("player.vimeo.com")) {
        const iframe = document.createElement("iframe");
        iframe.id = "apod-video";
        iframe.src = videoUrl;
        iframe.frameBorder = "0";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.display = "block";
        circle.appendChild(iframe);
      } else {
        const video = document.createElement("video");
        video.id = "apod-video";
        video.src = videoUrl;
        video.controls = true;
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        circle.appendChild(video);
      }
    } else {
      const img = document.createElement("img");
      img.id = "apod-image";
      img.src = "fallback.jpg";
      img.alt = "APOD unavailable";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      circle.appendChild(img);
    }

    addDescriptionToggleFunction();
  } catch (err) {
    console.error("APOD error:", err);
  }
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
