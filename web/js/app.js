// Works out which screen to show from the address (the part after #), and draws it.
const app = document.getElementById("app");

function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  let html;
  if (parts.length === 0) {
    html = Screens.home();
  } else if (parts[0] === "text" && parts.length === 2) {
    html = Screens.text(parts[1]);
  } else if (parts[0] === "text" && parts.length === 3) {
    html = Screens.comingSoon(`#/text/${parts[1]}`, "Back to the text");
  } else if (parts[0] === "techniques" && parts.length === 1) {
    html = Screens.techniques();
  } else if (parts[0] === "techniques") {
    html = Screens.comingSoon("#/techniques", "Back to Techniques");
  } else {
    html = Screens.notFound();
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

// Learn the set / Free practice switch.
app.addEventListener("click", (event) => {
  const button = event.target.closest(".mode-btn");
  if (!button) return;
  Store.setMode(button.dataset.mode);
  route();
});

window.addEventListener("hashchange", route);

Data.load().then(route).catch((err) => {
  app.innerHTML = `<main class="wrap"><div class="card"><h2>Sorry, something went wrong</h2><p>${esc(err.message)}</p></div></main>`;
});
