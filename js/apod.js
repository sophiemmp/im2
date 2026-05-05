document.addEventListener("DOMContentLoaded", () => {
    const descWrapper = document.getElementById("desc-wrapper");
    const toggle = document.getElementById("toggle");

    if (!descWrapper || !toggle) return;

    function toggleDescription(event) {
        event.stopPropagation();
        descWrapper.classList.toggle("open");
        toggle.classList.toggle("open");

        console.log("clicked");
    }

    descWrapper.addEventListener("click", toggleDescription);
    toggle.addEventListener("click", toggleDescription);
});