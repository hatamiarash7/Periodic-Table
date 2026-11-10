/* Runs before first paint so a saved theme never flashes the wrong colours. */
(function () {
  try {
    var theme = localStorage.getItem("periodic-table-theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }
  } catch (_) {
    /* ignore: storage unavailable */
  }
})();
