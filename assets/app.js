const year = document.querySelector("#year");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const navigation = document.querySelector("#site-navigation");

function createLockIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "menu-lock");
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("aria-hidden", "true");

  const body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  body.setAttribute("x", "3");
  body.setAttribute("y", "7");
  body.setAttribute("width", "10");
  body.setAttribute("height", "7");
  body.setAttribute("rx", "2");

  const shackle = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shackle.setAttribute("d", "M5.5 7V5a2.5 2.5 0 0 1 5 0v2");

  icon.append(body, shackle);
  return icon;
}

function createMenuItem(item) {
  if (
    !item
    || typeof item.name !== "string"
    || !item.name.trim()
    || typeof item.url !== "string"
  ) {
    return null;
  }

  let destination;
  try {
    destination = new URL(item.url);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(destination.protocol)) {
    return null;
  }

  const link = document.createElement("a");
  link.className = "menu-item";
  link.href = destination.href;

  const name = document.createElement("span");
  name.className = "menu-name";
  name.textContent = item.name.trim();
  link.append(name);

  const metaText = typeof item.meta === "string" && item.meta.trim()
    ? item.meta.trim()
    : "";

  if (metaText) {
    const meta = document.createElement("span");
    meta.className = "menu-meta";
    meta.textContent = metaText;
    link.append(meta);
  }

  if (item.requiresAccess === true) {
    link.setAttribute("aria-label", `${item.name.trim()}，受保护`);
    link.append(createLockIcon());
  } else {
    const arrow = document.createElement("span");
    arrow.className = "menu-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    link.append(arrow);
  }

  if (item.newTab === true) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  return link;
}

function closeMenuGroup(group) {
  const trigger = group.querySelector(".menu-trigger");
  const panel = group.querySelector(".menu-panel");
  trigger.setAttribute("aria-expanded", "false");
  panel.hidden = true;
}

function closeAllMenuGroups(except = null) {
  navigation.querySelectorAll(".menu-group").forEach((group) => {
    if (group !== except) {
      closeMenuGroup(group);
    }
  });
}

function openMenuGroup(group) {
  closeAllMenuGroups(group);
  const trigger = group.querySelector(".menu-trigger");
  const panel = group.querySelector(".menu-panel");
  trigger.setAttribute("aria-expanded", "true");
  panel.hidden = false;
}

function createMenuGroup(category, index) {
  if (!category || typeof category.name !== "string" || !Array.isArray(category.items)) {
    return null;
  }

  const items = category.items.map(createMenuItem).filter(Boolean);
  if (!category.name.trim() || items.length === 0) {
    return null;
  }

  const group = document.createElement("div");
  group.className = "menu-group";

  const trigger = document.createElement("button");
  trigger.className = "menu-trigger";
  trigger.type = "button";
  trigger.id = `menu-trigger-${index}`;
  trigger.textContent = category.name.trim();
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", `menu-panel-${index}`);

  const panel = document.createElement("div");
  panel.className = "menu-panel";
  panel.id = `menu-panel-${index}`;
  panel.hidden = true;
  panel.setAttribute("role", "group");
  panel.setAttribute("aria-labelledby", trigger.id);
  panel.append(...items);

  group.append(trigger, panel);

  group.addEventListener("pointerenter", () => {
    if (window.matchMedia("(hover: hover)").matches) {
      openMenuGroup(group);
    }
  });

  group.addEventListener("pointerleave", () => {
    if (!group.contains(document.activeElement)) {
      closeMenuGroup(group);
    }
  });

  group.addEventListener("focusin", () => openMenuGroup(group));
  group.addEventListener("focusout", (event) => {
    if (!group.contains(event.relatedTarget) && !group.matches(":hover")) {
      closeMenuGroup(group);
    }
  });

  trigger.addEventListener("click", () => openMenuGroup(group));
  return group;
}

function renderMenu(config) {
  if (!navigation || !Array.isArray(config?.categories)) {
    return;
  }

  const groups = config.categories
    .map(createMenuGroup)
    .filter(Boolean);

  navigation.replaceChildren(...groups);
}

if (navigation) {
  document.addEventListener("pointerdown", (event) => {
    if (!navigation.contains(event.target)) {
      closeAllMenuGroups();
    }
  });

  navigation.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const group = event.target.closest(".menu-group");
      if (group) {
        const trigger = group.querySelector(".menu-trigger");
        trigger.focus();
        closeAllMenuGroups();
      }
    }
  });

  fetch("/assets/menu.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Menu config request failed: ${response.status}`);
      }
      return response.json();
    })
    .then(renderMenu)
    .catch((error) => {
      console.warn("The menu is unavailable because its configuration could not be loaded.", error);
    });
}
