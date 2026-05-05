let widgetIntervalId = null;

export function startClockInterval() {
	if (widgetIntervalId !== null) return;
	updateTimeBox();
	widgetIntervalId = setInterval(updateTimeBox, 1000);
}
  
export function stopClockInterval() {
	if (widgetIntervalId === null) return;
	clearInterval(widgetIntervalId);
	widgetIntervalId = null;
}
  
export function handleVisibilityForClock() {
	if (document.visibilityState === "visible") startClockInterval();
	else stopClockInterval();
}
  


// Zeit, Datum, Zeitzone
export function updateTimeBox() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;

    document.getElementById("year").textContent = year;
    document.getElementById("month").textContent = month;
    document.getElementById("day").textContent = day;

    document.getElementById("timezone").textContent = "Bern";
}
