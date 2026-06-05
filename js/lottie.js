const loadingAnimation = document.getElementById("loading-animation");
lottie.loadAnimation({
	container: loadingAnimation,
	renderer: 'svg',
	loop: true,
	autoplay: true,
	path: 'assets/moon-loading.json'
});