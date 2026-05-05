document.addEventListener("DOMContentLoaded", () => {
    const img = document.getElementById("apod-image");
    const title = document.getElementById("apod-title");
    const desc = document.getElementById("apod-description");
    const credit = document.getElementById("apod-credit");

    const API_KEY = "KrDhKFygYUX010HIXVZy9gpOXs3XN1EyFSWWWPai";

    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("NASA API request failed");
            }
            return res.json();
        })
        .then(data => {
            console.log(data);

            title.textContent = data.title;
            desc.textContent = data.explanation;

            credit.textContent = data.copyright
                ? `© ${data.copyright}`
                : "© NASA";

            if (data.media_type === "image") {
                img.src = data.url;
                img.alt = data.title;
            } else {
                img.src = "fallback.jpg";
                img.alt = "Today’s APOD is a video";
            }
        })
        .catch(error => {
            console.error("APOD error:", error);
        });
});