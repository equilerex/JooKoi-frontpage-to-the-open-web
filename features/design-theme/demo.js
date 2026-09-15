// Prototype-only behaviour for the design-theme pages. Not app code.

// aria-pressed buttons: radio inside .segment or [data-radio], plain toggle elsewhere.
document.addEventListener("click", (event) => {
  const button = event.target.closest("button[aria-pressed]");
  if (!button) return;
  const group = button.closest(".segment, [data-radio]");
  if (group) {
    for (const other of group.querySelectorAll("button[aria-pressed]")) {
      other.setAttribute("aria-pressed", String(other === button));
    }
  } else {
    const on = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!on));
  }
});

// Filter and category drawers stay open beside content on wide screens.
const wide = window.matchMedia("(min-width: 1024px)");
const syncDrawers = () => {
  for (const drawer of document.querySelectorAll("details.drawer")) {
    drawer.open = wide.matches;
  }
};
wide.addEventListener("change", syncDrawers);
syncDrawers();
