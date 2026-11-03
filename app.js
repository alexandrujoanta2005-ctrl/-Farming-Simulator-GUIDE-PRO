
// FIX: dezactiveaza cache-ul vechi PWA pentru ca Live Server si telefonul sa incarce mereu fisierele actuale.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (err) {
      console.warn("Curatarea cache-ului PWA nu a reusit:", err);
    }
  });
}


// Farming Simulator GUIDE PRO - app.js

const games = [25, 22, 19, 17, 15, 13, 11, 2009];
const gameBox = document.querySelector("#games");

function renderGames() {
  gameBox.innerHTML = "";

  games.forEach((g, i) => {
    const d = document.createElement("button");
    d.className = "game " + (i === 0 ? "active" : "");

    d.innerHTML = `
      <strong>Farming<br>Simulator
        <span style="color:#a4f31c">${g}</span>
      </strong>
      <div class="tractor">🚜</div>
      <small>${i === 0 ? "✓" : ""}</small>
    `;

    d.onclick = () => go("fs" + g);
    gameBox.append(d);
  });
}

const pages = {
  all: [
    "allTitle",
    "choose",
    games.map(g => `
      <article>
        <b>Farming Simulator ${g}</b>
        <p>${tr("editionInfo")}</p>
      </article>
    `).join("")
  ],

  fs25: [
    "fs25",
    "currentGuide",
    [
      "smallTractors",
      "mediumTractors",
      "largeTractors",
      "combines",
      "loaders",
      "trailers",
      "crops",
      "animals",
      "beginner"
    ].map(x => `
      <article onclick="go('machines')">
        <b>${tr(x)} →</b>
        <p>${tr("catalogInfo")}</p>
      </article>
    `).join("")
  ],

  machines: [
    "catalog",
    "catalogDesc",
    [
      "smallTractors",
      "mediumTractors",
      "largeTractors",
      "combines",
      "loaders",
      "trailers",
      "seeders",
      "cultivators"
    ].map(x => `
      <article>
        <b>🚜 ${tr(x)}</b>
        <p>${tr("machineInfo")}</p>
      </article>
    `).join("")
  ],

  crops: [
    "cropsTitle",
    "cropsDesc",
    [
      "wheat",
      "barley",
      "oats",
      "canola",
      "sunflower",
      "corn",
      "soy",
      "grapes"
    ].map(x => `
      <article>
        <b>🌿 ${tr(x)}</b>
        <p>${tr("cropInfo")}</p>
      </article>
    `).join("")
  ],

  animals: [
    "animalsTitle",
    "animalsDesc",
    [
      "cows",
      "sheep",
      "pigs",
      "chickens",
      "horses",
      "bees"
    ].map(x => `
      <article>
        <b>🐄 ${tr(x)}</b>
        <p>${tr("animalInfo")}</p>
      </article>
    `).join("")
  ],

  guides: [
    "guidesTitle",
    "guidesDesc",
    [
      "beginner",
      "money",
      "economy",
      "productions",
      "tip"
    ].map(x => `
      <article>
        <b>📘 ${tr(x)}</b>
        <p>${tr("guideInfo")}</p>
      </article>
    `).join("")
  ],

  info: [
    "infoTitle",
    "unofficial",
    `
      <article>
        <b>Farming Simulator GUIDE PRO</b>
        <p>${tr("independent")}</p>
      </article>
    `
  ]
};

let previousPage = "home";

function go(id) {
  if (id === "settings") {
    openSettings();
    return;
  }

  document.querySelectorAll("[data-go]").forEach(b => {
    b.classList.toggle("active", b.dataset.go === id);
  });

  const home = document.querySelector("#home");
  const page = document.querySelector("#page");

  if (id === "home") {
    home.hidden = false;
    page.hidden = true;
    window.scrollTo(0, 0);
    return;
  }

  previousPage = id;

  const p = pages[id] || pages.fs25;

  home.hidden = true;
  page.hidden = false;

  page.innerHTML = `
    <h1>${tr(p[0])}</h1>
    <p style="color:#a9bbaa">${tr(p[1])}</p>
    <div class="itemlist">${p[2]}</div>
    <button class="cta" onclick="go('home')" style="margin-top:20px">
      ${tr("back")}
    </button>
  `;

  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-go]").forEach(b => {
  b.addEventListener("click", () => go(b.dataset.go));
});

// ================= SETTINGS =================

const prefKey = "fs-guide-pro-settings";

const defaults = {
  language: "ro",
  theme: "dark",
  contrast: false,
  animations: true,
  vibration: false,
  largeText: false,
  favoriteGame: "25",
  platform: "PC"
};

function getPrefs() {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem(prefKey) || "{}")
    };
  } catch {
    return { ...defaults };
  }
}

function applyPrefs(p = getPrefs()) {
  document.documentElement.lang = p.language;

  document.body.classList.toggle(
    "light-mode",
    p.theme === "light"
  );

  document.body.classList.toggle(
    "high-contrast",
    !!p.contrast
  );

  document.body.classList.toggle(
    "no-animations",
    !p.animations
  );

  document.body.classList.toggle(
    "large-text",
    !!p.largeText
  );
}

function savePrefs(p) {
  localStorage.setItem(prefKey, JSON.stringify(p));
  applyPrefs(p);
  if (window.fsCloudSavePrefs) {
    window.fsCloudSavePrefs(p).then(({error}) => {
      if (error) console.warn('Setările nu s-au sincronizat în cloud:', error.message);
      else console.info('Setări sincronizate în cloud.');
    }).catch(console.error);
  }
}

function openSettings() {
  const page = document.querySelector("#page");
  const home = document.querySelector("#home");

  home.hidden = true;
  page.hidden = false;

  document.querySelectorAll("[data-go]").forEach(b => {
    b.classList.toggle("active", b.dataset.go === "settings");
  });

  const p = getPrefs();

  page.innerHTML = `
    <div class="settings-page">

      <header class="settings-head">
        <button class="settings-back" id="settingsBack">
          ← ÎNAPOI
        </button>

        <div>
          <small>GUIDE PRO</small>
          <h2>⚙ Setări</h2>
        </div>
      </header>

      <div class="profile-card">
        <div class="profile-avatar" id="profileAvatar">👤</div>

        <div class="profile-info">
          <b id="profileName">Contul meu</b>
          <small id="profileEmail">
            Conectează-te pentru sincronizare
          </small>
          <small>
            Profil local • Google Sign-In în configurare
          </small>
        </div>

        <button id="connectGoogle">Conectare</button>
      </div>

      <section class="settings-group">
        <h3>🎨 Personalizare</h3>

        <div class="setting-row">
          <div>
            <strong>🌐 Limba</strong>
            <small>Limba interfeței</small>
          </div>

          <select id="prefLanguage">
            <option value="ro">🇷🇴 Română</option>
            <option value="en">🇬🇧 English</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="it">🇮🇹 Italiano</option>
            <option value="es">🇪🇸 Español</option>
            <option value="pl">🇵🇱 Polski</option>
          </select>
        </div>

        <div class="setting-row">
          <div>
            <strong>🎨 Temă</strong>
            <small>Aspect luminos sau întunecat</small>
          </div>

          <select id="prefTheme">
            <option value="dark">Întunecată</option>
            <option value="light">Luminoasă</option>
          </select>
        </div>

        ${[
          ["prefContrast", "♿ Contrast ridicat", "Accesibilitate"],
          ["prefAnimations", "✨ Animații", "Efecte vizuale"],
          ["prefVibration", "📳 Vibrații", "Feedback tactil"],
          ["prefLargeText", "🔎 Text mărit", "Lizibilitate"]
        ].map(([id, label, desc]) => `
          <div class="setting-row">
            <div>
              <strong>${label}</strong>
              <small>${desc}</small>
            </div>
            <input id="${id}" type="checkbox">
          </div>
        `).join("")}
      </section>

      <section class="settings-group">
        <h3>🔔 Notificări și instalare</h3>

        <div class="setting-row">
          <div>
            <strong>Notificări</strong>
            <small>Permite notificările browserului</small>
          </div>
          <button id="enableNotifications">Activează</button>
        </div>

        <div class="setting-row">
          <div>
            <strong>📲 Instalare aplicație</strong>
            <small>Instrucțiuni pentru dispozitiv</small>
          </div>
          <button id="installHelp">Instrucțiuni</button>
        </div>
      </section>

      <section class="settings-group">
        <h3>🚜 Preferințe joc</h3>

        <div class="setting-row">
          <div>
            <strong>Joc favorit</strong>
            <small>Alege ediția preferată</small>
          </div>

          <select id="favoriteGame">
            ${games.map(g => `
              <option value="${g}">FS ${g}</option>
            `).join("")}
          </select>
        </div>

        <div class="setting-row">
          <div>
            <strong>Platformă</strong>
            <small>Platforma de joc</small>
          </div>

          <select id="platform">
            <option>PC</option>
            <option>PlayStation</option>
            <option>Xbox</option>
            <option>Mac</option>
          </select>
        </div>
      </section>

      <section class="settings-group">
        <h3>💾 Date și aplicație</h3>

        <div class="setting-row">
          <div>
            <strong>Backup setări</strong>
            <small>Exportă preferințele într-un fișier</small>
          </div>
          <button id="exportPrefs">Export</button>
        </div>

        <div class="setting-row">
          <div>
            <strong>Resetare</strong>
            <small>Revino la setările implicite</small>
          </div>
          <button id="resetPrefs">Reset</button>
        </div>

        <div class="setting-row">
          <div>
            <strong>Despre aplicație</strong>
            <small>Farming Simulator GUIDE PRO</small>
          </div>
          <button id="aboutApp">Despre</button>
        </div>
      </section>

      <div class="settings-savebar">
        <button class="settings-save" id="saveSettings">
          💾 SALVEAZĂ SETĂRILE
        </button>
      </div>

    </div>
  `;

  const ids = [
    "prefLanguage",
    "prefTheme",
    "prefContrast",
    "prefAnimations",
    "prefVibration",
    "prefLargeText",
    "favoriteGame",
    "platform"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    if (el.type === "checkbox") {
      const key = id.replace("pref", "").toLowerCase();
      el.checked = !!p[key];
    } else {
      el.value = p[id] ?? (id === "favoriteGame" ? "25" : "PC");
    }
  });

  document.getElementById("settingsBack").onclick = () => {
    go(previousPage === "settings" ? "home" : previousPage);
  };

  document.getElementById("connectGoogle").onclick = () => {
    alert("Conectarea Google necesită configurarea Firebase Authentication.");
  };

  document.getElementById("saveSettings").onclick = () => {
    const next = {
      ...getPrefs(),
      language: document.getElementById("prefLanguage").value,
      theme: document.getElementById("prefTheme").value,
      contrast: document.getElementById("prefContrast").checked,
      animations: document.getElementById("prefAnimations").checked,
      vibration: document.getElementById("prefVibration").checked,
      largeText: document.getElementById("prefLargeText").checked,
      favoriteGame: document.getElementById("favoriteGame").value,
      platform: document.getElementById("platform").value
    };

    savePrefs(next);
    renderApp();
    openSettings();
    alert("Setările au fost salvate!");
  };

  document.getElementById("enableNotifications").onclick = async () => {
    if (!("Notification" in window)) {
      alert("Browserul nu suportă notificări.");
      return;
    }

    alert("Permisiune: " + await Notification.requestPermission());
  };

  document.getElementById("installHelp").onclick = () => {
    alert(
      /iPhone|iPad/i.test(navigator.userAgent)
        ? "Safari: Partajare → Add to Home Screen."
        : "Din meniul browserului alege Install/Add to Home Screen."
    );
  };

  document.getElementById("resetPrefs").onclick = () => {
    if (confirm("Resetezi toate setările?")) {
      localStorage.removeItem(prefKey);
      applyPrefs();
      openSettings();
    }
  };

  document.getElementById("exportPrefs").onclick = () => {
    const blob = new Blob(
      [JSON.stringify(getPrefs(), null, 2)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fs-guide-pro-settings.json";
    a.click();

    URL.revokeObjectURL(a.href);
  };

  document.getElementById("aboutApp").onclick = () => {
    alert("Farming Simulator GUIDE PRO\nGhid neoficial.");
  };
}

// ================= EVENTS =================

document.querySelectorAll("[data-action=notifications]").forEach(b => {
  b.addEventListener("click", openSettings);
});

document.addEventListener("click", e => {
  if (
    getPrefs().vibration &&
    navigator.vibrate &&
    e.target.closest("button")
  ) {
    navigator.vibrate(25);
  }
});

// ================= TRANSLATIONS =================

function renderApp() {
  document.querySelectorAll("[data-go]").forEach(btn => {
    const id = btn.dataset.go;
    const key = id === "all" ? "all" : id;
    const span = btn.querySelector("span");

    if (span) {
      span.nextSibling.textContent = tr(key);
    } else if (btn.closest(".quick")) {
      const icons = {
        home: "⌂ ",
        all: "▱ ",
        fs25: "🎮 ",
        machines: "🚜 ",
        crops: "🌿 ",
        animals: "🐄 ",
        info: "ⓘ "
      };

      btn.textContent = (icons[id] || "") + tr(key);
    }
  });

  const hero = document.querySelector(".hero-copy");

  if (hero) {
    hero.querySelector(".pill").textContent = "NEW";
    hero.querySelector("p").textContent = tr("description");
    hero.querySelector(".cta").textContent = tr("enter");
  }

  const heads = document.querySelectorAll(".section-head h2");
  const keys = ["all", "categories", "popular", "news"];

  heads.forEach((h, i) => {
    if (keys[i]) h.textContent = tr(keys[i]);
  });

  document.querySelectorAll(".section-head button").forEach(b => {
    b.textContent = tr("viewAll");
  });

  renderGames();
}

applyPrefs();
renderGames();
renderApp();

