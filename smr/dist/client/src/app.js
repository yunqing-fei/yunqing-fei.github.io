import { DEFAULT_DATA } from "../data/projects.js";

const STATUS_ORDER = [
  "Operable",
  "Under construction",
  "FID",
  "Pre-investment",
];

const STATUS_META = {
  Operable: { color: "#6aa93d", className: "operable" },
  "Under construction": { color: "#176ee8", className: "construction" },
  FID: { color: "#ef9918", className: "fid" },
  "Pre-investment": { color: "#8e969f", className: "pre-investment" },
};

const app = document.querySelector("#app");
const LOCAL_DATA_KEY = "smr-atlas-dataset-v1";
const STATIC_PASSWORD = "BOCI";

function detectAppRoot() {
  const root = new URL(document.baseURI);
  root.hash = "";
  root.search = "";
  root.pathname = root.pathname
    .replace(/index\.html$/i, "")
    .replace(/admin\/?$/i, "");
  if (!root.pathname.endsWith("/")) root.pathname += "/";
  return root;
}

const APP_ROOT = detectAppRoot();
const appUrl = (path = "") => new URL(String(path).replace(/^\/+/, ""), APP_ROOT);
const apiUrl = (resource) => appUrl(`api/${resource}`);
const isAdminRoute = () =>
  window.location.hash.toLowerCase() === "#admin" ||
  /\/admin\/?$/i.test(window.location.pathname);

const state = {
  data: structuredClone(DEFAULT_DATA),
  filtered: [],
  selectedId: "darlington-bwrx-300",
  search: "",
  statuses: new Set(STATUS_ORDER),
  technology: "All",
  region: "All",
  vendor: "All",
  projectType: "All",
  map: null,
  markerLayer: null,
  markers: new Map(),
  adminPassword: "",
  adminDraft: null,
  adminSearch: "",
  adminDirty: false,
  storageMode: "static",
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function slug(value) {
  return (
    String(value || "project")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `project-${Date.now()}`
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not yet published";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function unique(field) {
  return [...new Set(state.data.projects.map((item) => item[field]).filter(Boolean))].sort(
    (a, b) => String(a).localeCompare(String(b)),
  );
}

function optionList(values, selected, allLabel) {
  return [
    `<option value="All">${escapeHtml(allLabel)}</option>`,
    ...values.map(
      (value) =>
        `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`,
    ),
  ].join("");
}

function readBrowserDataset() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LOCAL_DATA_KEY));
    return Array.isArray(saved?.projects) ? saved : null;
  } catch {
    return null;
  }
}

async function readPublishedDataset() {
  try {
    const response = await fetch(appUrl("data/projects.json"), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const published = await response.json();
    return Array.isArray(published?.projects) ? published : null;
  } catch {
    return null;
  }
}

async function fetchDataset() {
  try {
    const response = await fetch(apiUrl("projects"), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error("Dataset request failed");
    const next = await response.json();
    if (!Array.isArray(next.projects)) throw new Error("Dataset shape is invalid");
    state.data = next;
    state.storageMode = ["d1", "local-dev"].includes(next.storage)
      ? "api"
      : "static";
  } catch {
    state.storageMode = "static";
    state.data = structuredClone(
      readBrowserDataset() || (await readPublishedDataset()) || DEFAULT_DATA,
    );
  }
}

function projectMatches(project) {
  const haystack = [
    project.name,
    project.site,
    project.country,
    project.vendor,
    project.model,
    project.technology,
    project.partners,
  ]
    .join(" ")
    .toLowerCase();
  return (
    haystack.includes(state.search.toLowerCase()) &&
    state.statuses.has(project.status) &&
    (state.technology === "All" || project.technology === state.technology) &&
    (state.region === "All" || project.region === state.region) &&
    (state.vendor === "All" || project.vendor === state.vendor) &&
    (state.projectType === "All" || project.projectType === state.projectType)
  );
}

function updateFiltered() {
  state.filtered = state.data.projects.filter(projectMatches);
  if (!state.filtered.some((project) => project.id === state.selectedId)) {
    state.selectedId = state.filtered[0]?.id || null;
  }
}

function statusCount(status) {
  return state.data.projects.filter((project) => project.status === status).length;
}

function logo() {
  return `
    <a class="brand" href="./" aria-label="Global SMR Atlas home">
      <span class="brand-icon" aria-hidden="true"><i class="ph ph-globe-hemisphere-west"></i></span>
      <span>Global SMR Atlas</span>
    </a>
  `;
}

function renderMain() {
  updateFiltered();
  app.innerHTML = `
    <div class="atlas-shell">
      <header class="topbar">
        ${logo()}
        <div class="topbar-center">Atlas Observatory</div>
        <div class="topbar-actions">
          <button class="icon-button filter-trigger" id="mobile-filter-open" aria-label="Open filters">
            <i class="ph ph-sliders-horizontal"></i>
          </button>
          <a class="data-manager-link" href="./#admin">
            <i class="ph ph-shield-check" aria-hidden="true"></i>
            <span>Data manager</span>
          </a>
        </div>
      </header>

      <section class="overview" aria-labelledby="page-title">
        <div class="overview-copy">
          <p class="eyebrow">Global project intelligence</p>
          <h1 id="page-title">Atlas Observatory</h1>
          <p class="subtitle">Explore small modular reactor projects and research worldwide.</p>
          <p class="updated">Last updated: <strong>${escapeHtml(formatDate(state.data.updatedAt))}</strong></p>
        </div>
        <div class="kpi-strip" aria-label="Project summary">
          <div class="kpi kpi-total">
            <i class="ph ph-factory" aria-hidden="true"></i>
            <span><small>Total projects</small><strong>${state.data.projects.length}</strong><em>in ${unique("country").length} countries</em></span>
          </div>
          ${STATUS_ORDER.map(
            (status) => `
              <button class="kpi status-kpi ${state.statuses.has(status) ? "is-active" : ""}" data-status-kpi="${escapeHtml(status)}">
                <span class="status-dot ${STATUS_META[status].className}"></span>
                <span><small>${escapeHtml(status)}</small><strong>${statusCount(status)}</strong></span>
              </button>
            `,
          ).join("")}
        </div>
      </section>

      <section class="workspace">
        <aside class="filter-panel" id="filter-panel" aria-label="Project filters">
          <div class="mobile-panel-head">
            <strong>Filter projects</strong>
            <button class="icon-button" id="mobile-filter-close" aria-label="Close filters"><i class="ph ph-x"></i></button>
          </div>
          <label class="search-box sidebar-search">
            <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
            <input id="project-search" type="search" value="${escapeHtml(state.search)}" placeholder="Search projects" aria-label="Search projects" />
          </label>
          <div class="filter-group">
            <div class="filter-heading"><span>Status</span><span>${state.filtered.length} shown</span></div>
            ${STATUS_ORDER.map(
              (status) => `
                <label class="check-row">
                  <input type="checkbox" name="status" value="${escapeHtml(status)}" ${state.statuses.has(status) ? "checked" : ""} />
                  <span class="status-dot ${STATUS_META[status].className}"></span>
                  <span>${escapeHtml(status)}</span>
                  <em>${statusCount(status)}</em>
                </label>
              `,
            ).join("")}
          </div>
          <div class="filter-group">
            <label class="select-label" for="technology-filter">Technology</label>
            <select id="technology-filter">${optionList(unique("technology"), state.technology, "All technologies")}</select>
          </div>
          <div class="filter-group">
            <label class="select-label" for="region-filter">Region</label>
            <select id="region-filter">${optionList(unique("region"), state.region, "All regions")}</select>
          </div>
          <div class="filter-group">
            <label class="select-label" for="vendor-filter">Vendor / developer</label>
            <select id="vendor-filter">${optionList(unique("vendor"), state.vendor, "All vendors")}</select>
          </div>
          <div class="filter-group">
            <label class="select-label" for="type-filter">Project type</label>
            <select id="type-filter">${optionList(unique("projectType"), state.projectType, "All project types")}</select>
          </div>
          <button class="secondary-button clear-filters" id="clear-filters">
            <i class="ph ph-arrow-counter-clockwise"></i> Clear all filters
          </button>
        </aside>
        <div class="filter-scrim" id="filter-scrim"></div>

        <section class="map-stage" aria-label="Interactive world map">
          <div class="mobile-map-toolbar">
            <label class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input id="mobile-project-search" type="search" value="${escapeHtml(state.search)}" placeholder="Search projects" aria-label="Search projects" />
            </label>
            <button class="filter-mobile-button" id="mobile-filter-open-secondary">
              <i class="ph ph-sliders-horizontal"></i><span>Filters</span>
            </button>
          </div>
          <div id="map" role="application" aria-label="World map with SMR project markers"></div>
          <div class="map-empty" id="map-empty" hidden>
            <i class="ph ph-map-trifold"></i>
            <strong>No projects match these filters</strong>
            <button id="empty-clear">Clear filters</button>
          </div>
          <div class="map-legend" aria-label="Map legend">
            ${STATUS_ORDER.map(
              (status) => `<span><i class="status-dot ${STATUS_META[status].className}"></i>${escapeHtml(status)}</span>`,
            ).join("")}
          </div>
          <div class="map-note">
            <i class="ph ph-info"></i>
            <span>${escapeHtml(state.data.sourceNote)}</span>
          </div>
        </section>

        <aside class="detail-panel" id="detail-panel" aria-label="Selected project details">
          ${renderProjectDetail()}
        </aside>
      </section>
    </div>
  `;

  bindMainEvents();
  queueMicrotask(initializeMap);
}

function renderProjectDetail() {
  const project = state.data.projects.find((item) => item.id === state.selectedId);
  if (!project) {
    return `
      <div class="detail-empty">
        <i class="ph ph-cursor-click"></i>
        <h2>Select a project</h2>
        <p>Choose a marker to review the project profile and source.</p>
      </div>
    `;
  }
  const meta = STATUS_META[project.status] || STATUS_META["Pre-investment"];
  return `
    <div class="detail-head">
      <span class="status-pill ${meta.className}"><i></i>${escapeHtml(project.status)}</span>
      <button class="icon-button detail-collapse" id="detail-collapse" aria-label="Collapse details">
        <i class="ph ph-caret-down"></i>
      </button>
    </div>
    <h2>${escapeHtml(project.name)}</h2>
    <p class="location"><i class="ph ph-map-pin"></i>${escapeHtml(project.site)}, ${escapeHtml(project.country)}</p>
    <dl class="project-facts">
      <div><dt>Vendor / developer</dt><dd>${escapeHtml(project.vendor)}</dd></div>
      <div><dt>Technology</dt><dd>${escapeHtml(project.technology)}</dd></div>
      <div><dt>Model</dt><dd>${escapeHtml(project.model)}</dd></div>
      <div><dt>Net capacity</dt><dd>${Number(project.capacity).toLocaleString()} MWe</dd></div>
      <div><dt>Target deployment</dt><dd>${escapeHtml(project.targetDeployment)}</dd></div>
      <div><dt>Project type</dt><dd>${escapeHtml(project.projectType)}</dd></div>
    </dl>
    <div class="detail-section">
      <h3>Partners</h3>
      <p>${escapeHtml(project.partners)}</p>
    </div>
    <div class="detail-section summary">
      <h3>Project summary</h3>
      <p>${escapeHtml(project.summary)}</p>
    </div>
    <a class="primary-button source-button" href="${escapeHtml(safeUrl(project.source))}" target="_blank" rel="noreferrer">
      View ${escapeHtml(project.sourceLabel || "project source")}
      <i class="ph ph-arrow-square-out"></i>
    </a>
  `;
}

function bindMainEvents() {
  const syncSearch = (value) => {
    state.search = value;
    const peerId =
      document.activeElement?.id === "project-search"
        ? "mobile-project-search"
        : "project-search";
    const peer = document.getElementById(peerId);
    if (peer) peer.value = value;
    applyFilters();
  };
  document
    .getElementById("project-search")
    ?.addEventListener("input", (event) => syncSearch(event.target.value));
  document
    .getElementById("mobile-project-search")
    ?.addEventListener("input", (event) => syncSearch(event.target.value));

  document.querySelectorAll('input[name="status"]').forEach((input) => {
    input.addEventListener("change", () => {
      input.checked ? state.statuses.add(input.value) : state.statuses.delete(input.value);
      applyFilters();
    });
  });

  const selects = [
    ["technology-filter", "technology"],
    ["region-filter", "region"],
    ["vendor-filter", "vendor"],
    ["type-filter", "projectType"],
  ];
  selects.forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener("change", (event) => {
      state[key] = event.target.value;
      applyFilters();
    });
  });

  document.querySelectorAll("[data-status-kpi]").forEach((button) => {
    button.addEventListener("click", () => {
      const status = button.dataset.statusKpi;
      if (state.statuses.size === 1 && state.statuses.has(status)) {
        state.statuses = new Set(STATUS_ORDER);
      } else {
        state.statuses = new Set([status]);
      }
      renderMain();
    });
  });

  ["clear-filters", "empty-clear"].forEach((id) =>
    document.getElementById(id)?.addEventListener("click", clearFilters),
  );

  const openPanel = () => document.body.classList.add("filters-open");
  const closePanel = () => document.body.classList.remove("filters-open");
  ["mobile-filter-open", "mobile-filter-open-secondary"].forEach((id) =>
    document.getElementById(id)?.addEventListener("click", openPanel),
  );
  ["mobile-filter-close", "filter-scrim"].forEach((id) =>
    document.getElementById(id)?.addEventListener("click", closePanel),
  );

  document.getElementById("detail-collapse")?.addEventListener("click", () => {
    document.getElementById("detail-panel")?.classList.toggle("is-collapsed");
  });
}

function clearFilters() {
  state.search = "";
  state.statuses = new Set(STATUS_ORDER);
  state.technology = "All";
  state.region = "All";
  state.vendor = "All";
  state.projectType = "All";
  renderMain();
}

function applyFilters() {
  updateFiltered();
  updateMapMarkers();
  const count = document.querySelector(".filter-heading span:last-child");
  if (count) count.textContent = `${state.filtered.length} shown`;
  const empty = document.getElementById("map-empty");
  if (empty) empty.hidden = state.filtered.length > 0;
  const detail = document.getElementById("detail-panel");
  if (detail) detail.innerHTML = renderProjectDetail();
  document.getElementById("detail-collapse")?.addEventListener("click", () => {
    detail?.classList.toggle("is-collapsed");
  });
}

function initializeMap() {
  const mapNode = document.getElementById("map");
  if (!mapNode || !window.L) {
    if (mapNode) {
      mapNode.innerHTML = `
        <div class="map-load-error">
          <i class="ph ph-warning-circle"></i>
          <strong>The live map could not load.</strong>
          <span>Project details and the data manager remain available.</span>
        </div>
      `;
    }
    return;
  }

  state.map?.remove();
  state.markers.clear();
  state.map = window.L.map("map", {
    zoomControl: false,
    minZoom: 2,
    worldCopyJump: true,
    attributionControl: true,
  }).setView([24, 12], window.innerWidth < 700 ? 1.35 : 2.15);

  window.L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 18,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  ).addTo(state.map);
  window.L.control.zoom({ position: "bottomleft" }).addTo(state.map);
  state.markerLayer = window.L.layerGroup().addTo(state.map);
  updateMapMarkers();
}

function markerStyle(project, selected = false) {
  const color = STATUS_META[project.status]?.color || "#8e969f";
  return {
    radius: selected ? 9 : 6,
    fillColor: color,
    color: selected ? "#ffffff" : "#ffffff",
    weight: selected ? 4 : 2,
    opacity: 1,
    fillOpacity: 0.95,
  };
}

function updateMapMarkers() {
  if (!state.map || !state.markerLayer) return;
  state.markerLayer.clearLayers();
  state.markers.clear();

  state.filtered.forEach((project) => {
    const selected = project.id === state.selectedId;
    const marker = window.L.circleMarker(
      [Number(project.lat), Number(project.lon)],
      markerStyle(project, selected),
    );
    marker.bindTooltip(
      `<strong>${escapeHtml(project.name)}</strong><span>${escapeHtml(project.country)} · ${escapeHtml(project.status)}</span>`,
      { direction: "top", className: "atlas-tooltip", offset: [0, -8] },
    );
    marker.on("click", () => selectProject(project.id));
    marker.addTo(state.markerLayer);
    state.markers.set(project.id, marker);
  });

  if (state.selectedId && state.markers.has(state.selectedId)) {
    state.markers.get(state.selectedId).bringToFront();
  }
}

function selectProject(id) {
  state.selectedId = id;
  updateMapMarkers();
  const detail = document.getElementById("detail-panel");
  if (detail) {
    detail.classList.remove("is-collapsed");
    detail.innerHTML = renderProjectDetail();
    document.getElementById("detail-collapse")?.addEventListener("click", () => {
      detail.classList.toggle("is-collapsed");
    });
  }
  const project = state.data.projects.find((item) => item.id === id);
  if (project && window.innerWidth < 700) {
    detail?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function loginScreen(error = "") {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-visual">
        <a href="./" class="back-link"><i class="ph ph-arrow-left"></i> Back to atlas</a>
        <div class="login-visual-copy">
          <span class="brand-icon large"><i class="ph ph-globe-hemisphere-west"></i></span>
          <p class="eyebrow">Global SMR Atlas</p>
          <h1>Keep the map current.</h1>
          <p>Review, update, import, and export the project data that powers the public atlas.</p>
        </div>
      </section>
      <section class="login-panel">
        <form class="login-card" id="login-form">
          <div class="secure-icon"><i class="ph ph-lock-key"></i></div>
          <p class="eyebrow">Data manager</p>
          <h2>Sign in to continue</h2>
          <p class="login-help">Enter the case-sensitive manager password.</p>
          <label for="admin-password">Password</label>
          <div class="password-field">
            <i class="ph ph-key"></i>
            <input id="admin-password" type="password" autocomplete="current-password" required autofocus />
            <button type="button" id="toggle-password" aria-label="Show password"><i class="ph ph-eye"></i></button>
          </div>
          ${error ? `<p class="form-error"><i class="ph ph-warning-circle"></i>${escapeHtml(error)}</p>` : ""}
          <button class="primary-button login-button" type="submit">Unlock data manager <i class="ph ph-arrow-right"></i></button>
          <p class="security-note"><i class="ph ph-info"></i>This is lightweight password protection for a small internal workflow, not enterprise authentication.</p>
        </form>
      </section>
    </main>
  `;

  document.getElementById("toggle-password")?.addEventListener("click", () => {
    const input = document.getElementById("admin-password");
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    document.querySelector("#toggle-password i").className = showing ? "ph ph-eye" : "ph ph-eye-slash";
  });
  document.getElementById("login-form")?.addEventListener("submit", handleLogin);
}

async function handleLogin(event) {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  const password = document.getElementById("admin-password").value;
  button.disabled = true;
  button.textContent = "Checking…";

  if (state.storageMode === "static") {
    if (password !== STATIC_PASSWORD) {
      loginScreen("The password is incorrect.");
      return;
    }
    state.adminPassword = password;
    state.adminDraft = structuredClone(state.data);
    renderAdmin();
    return;
  }

  try {
    const response = await fetch(apiUrl("login"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) throw new Error("The password is incorrect.");
    state.adminPassword = password;
    state.adminDraft = structuredClone(state.data);
    renderAdmin();
  } catch (error) {
    loginScreen(error.message || "Unable to sign in.");
  }
}

function adminFilteredProjects() {
  const query = state.adminSearch.toLowerCase();
  return state.adminDraft.projects.filter((project) =>
    [project.name, project.country, project.vendor, project.model, project.status]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

function renderAdmin() {
  const projects = adminFilteredProjects();
  const isStatic = state.storageMode === "static";
  app.innerHTML = `
    <div class="admin-shell">
      <header class="admin-topbar">
        ${logo()}
        <div class="admin-status">
          <span class="save-state ${state.adminDirty ? "dirty" : ""}">
            <i class="ph ${state.adminDirty ? "ph-circle" : "ph-check-circle"}"></i>
            ${state.adminDirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <a href="./" class="secondary-button compact"><i class="ph ph-map-trifold"></i><span>View atlas</span></a>
          <button class="icon-button" id="admin-logout" aria-label="Lock data manager"><i class="ph ph-lock"></i></button>
        </div>
      </header>
      <main class="admin-main">
        <div class="admin-titlebar">
          <div>
            <p class="eyebrow">Protected workspace</p>
            <h1>Project data manager</h1>
            <p>${isStatic ? "Update the dataset stored in this browser, then export it for publishing." : "Update the live dataset, then publish changes to the atlas."}</p>
          </div>
          <button class="primary-button" id="save-online" ${state.adminDirty ? "" : "disabled"}>
            <i class="ph ${isStatic ? "ph-floppy-disk" : "ph-cloud-arrow-up"}"></i> ${isStatic ? "Save in browser" : "Save online"}
          </button>
        </div>

        ${
          isStatic
            ? `<div class="static-mode-note">
                <i class="ph ph-browser"></i>
                <span><strong>GitHub Pages mode:</strong> changes are private to this browser. Export JSON or CSV and commit the updated data file to share changes with everyone.</span>
              </div>`
            : ""
        }

        <section class="admin-summary">
          <div><span>Projects</span><strong>${state.adminDraft.projects.length}</strong></div>
          <div><span>Countries</span><strong>${new Set(state.adminDraft.projects.map((project) => project.country)).size}</strong></div>
          <div><span>Last published</span><strong>${escapeHtml(formatDate(state.adminDraft.updatedAt))}</strong></div>
          <label class="source-note-field">
            <span>Dataset note</span>
            <input id="source-note" value="${escapeHtml(state.adminDraft.sourceNote || "")}" />
          </label>
        </section>

        <section class="admin-toolbar" aria-label="Data tools">
          <label class="search-box admin-search">
            <i class="ph ph-magnifying-glass"></i>
            <input id="admin-search" type="search" value="${escapeHtml(state.adminSearch)}" placeholder="Search ${state.adminDraft.projects.length} projects" />
          </label>
          <div class="admin-actions">
            <button class="secondary-button" id="add-project"><i class="ph ph-plus"></i> Add project</button>
            <button class="secondary-button" id="import-data"><i class="ph ph-upload-simple"></i> Import</button>
            <input id="import-file" type="file" accept=".json,.csv,application/json,text/csv" hidden />
            <button class="secondary-button" id="export-json"><i class="ph ph-brackets-curly"></i> JSON</button>
            <button class="secondary-button" id="export-csv"><i class="ph ph-file-csv"></i> CSV</button>
          </div>
        </section>

        <div class="admin-toast" id="admin-toast" role="status"></div>
        <section class="records" id="records">
          <div class="records-head">
            <span>Project</span><span>Country</span><span>Status</span><span>Model</span><span>Capacity</span><span></span>
          </div>
          ${projects.map(renderRecord).join("") || `<div class="records-empty"><i class="ph ph-magnifying-glass"></i>No projects match this search.</div>`}
        </section>
      </main>
    </div>
  `;
  bindAdminEvents();
}

function renderRecord(project) {
  return `
    <details class="record" data-record-id="${escapeHtml(project.id)}">
      <summary>
        <span class="record-name"><i class="status-dot ${STATUS_META[project.status]?.className || "pre-investment"}"></i><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.site)}</small></span>
        <span data-label="Country">${escapeHtml(project.country)}</span>
        <span data-label="Status"><span class="status-pill ${STATUS_META[project.status]?.className || "pre-investment"}">${escapeHtml(project.status)}</span></span>
        <span data-label="Model">${escapeHtml(project.model)}</span>
        <span data-label="Capacity">${Number(project.capacity || 0).toLocaleString()} MWe</span>
        <i class="ph ph-caret-down record-caret"></i>
      </summary>
      <div class="record-form">
        ${recordField(project, "name", "Project name", "text", true)}
        ${recordField(project, "site", "Site / location")}
        ${recordField(project, "country", "Country", "text", true)}
        ${recordField(project, "region", "Region", "text", true)}
        ${recordSelect(project, "status", "Status", STATUS_ORDER)}
        ${recordSelect(project, "projectType", "Project type", ["Specific project", "Cooperation agreement / other"])}
        ${recordField(project, "vendor", "Vendor / developer", "text", true)}
        ${recordField(project, "model", "Reactor model", "text", true)}
        ${recordField(project, "technology", "Technology", "text", true)}
        ${recordField(project, "capacity", "Capacity (MWe)", "number")}
        ${recordField(project, "targetDeployment", "Target deployment")}
        ${recordField(project, "lat", "Latitude", "number")}
        ${recordField(project, "lon", "Longitude", "number")}
        ${recordField(project, "partners", "Partners", "text", false, "wide")}
        ${recordField(project, "source", "Source URL", "url", false, "wide")}
        ${recordField(project, "sourceLabel", "Source label")}
        <label class="record-field wide">
          <span>Summary</span>
          <textarea data-field="summary" rows="3">${escapeHtml(project.summary || "")}</textarea>
        </label>
        <div class="record-footer wide">
          <span>Record ID: ${escapeHtml(project.id)}</span>
          <button class="danger-button delete-record" type="button"><i class="ph ph-trash"></i> Delete project</button>
        </div>
      </div>
    </details>
  `;
}

function recordField(project, field, label, type = "text", required = false, className = "") {
  return `
    <label class="record-field ${className}">
      <span>${escapeHtml(label)}${required ? " *" : ""}</span>
      <input data-field="${field}" type="${type}" value="${escapeHtml(project[field] ?? "")}" ${type === "number" ? 'step="any"' : ""} ${required ? "required" : ""} />
    </label>
  `;
}

function recordSelect(project, field, label, values) {
  return `
    <label class="record-field">
      <span>${escapeHtml(label)}</span>
      <select data-field="${field}">
        ${values.map((value) => `<option value="${escapeHtml(value)}" ${project[field] === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
      </select>
    </label>
  `;
}

function bindAdminEvents() {
  document.getElementById("admin-logout")?.addEventListener("click", () => {
    state.adminPassword = "";
    state.adminDraft = null;
    state.adminDirty = false;
    loginScreen();
  });

  document.getElementById("admin-search")?.addEventListener("input", (event) => {
    state.adminSearch = event.target.value;
    const preserved = state.adminSearch;
    renderAdmin();
    const input = document.getElementById("admin-search");
    input.value = preserved;
    input.focus();
  });

  document.getElementById("source-note")?.addEventListener("input", (event) => {
    state.adminDraft.sourceNote = event.target.value;
    markDirty();
  });

  document.querySelectorAll(".record").forEach((record) => {
    const id = record.dataset.recordId;
    record.querySelectorAll("[data-field]").forEach((field) => {
      field.addEventListener("input", () => {
        const project = state.adminDraft.projects.find((item) => item.id === id);
        if (!project) return;
        const key = field.dataset.field;
        project[key] =
          field.type === "number" ? Number(field.value || 0) : field.value;
        markDirty();
      });
    });
    record.querySelector(".delete-record")?.addEventListener("click", () => {
      const project = state.adminDraft.projects.find((item) => item.id === id);
      if (!project) return;
      if (!window.confirm(`Delete “${project.name}” from the draft?`)) return;
      state.adminDraft.projects = state.adminDraft.projects.filter((item) => item.id !== id);
      state.adminDirty = true;
      renderAdmin();
    });
  });

  document.getElementById("add-project")?.addEventListener("click", addProject);
  document.getElementById("save-online")?.addEventListener("click", saveOnline);
  document.getElementById("import-data")?.addEventListener("click", () =>
    document.getElementById("import-file")?.click(),
  );
  document.getElementById("import-file")?.addEventListener("change", importData);
  document.getElementById("export-json")?.addEventListener("click", exportJson);
  document.getElementById("export-csv")?.addEventListener("click", exportCsv);
}

function markDirty() {
  state.adminDirty = true;
  const saveState = document.querySelector(".save-state");
  if (saveState) {
    saveState.classList.add("dirty");
    saveState.innerHTML = '<i class="ph ph-circle"></i> Unsaved changes';
  }
  const button = document.getElementById("save-online");
  if (button) button.disabled = false;
}

function addProject() {
  let id = `new-project-${Date.now()}`;
  while (state.adminDraft.projects.some((item) => item.id === id)) id += "-1";
  state.adminDraft.projects.unshift({
    id,
    name: "New SMR project",
    site: "",
    country: "",
    region: "",
    lat: 0,
    lon: 0,
    vendor: "",
    model: "",
    technology: "",
    status: "Pre-investment",
    projectType: "Specific project",
    capacity: 0,
    targetDeployment: "TBD",
    partners: "",
    summary: "",
    source: "",
    sourceLabel: "",
  });
  state.adminDirty = true;
  state.adminSearch = "";
  renderAdmin();
  const first = document.querySelector(".record");
  if (first) {
    first.open = true;
    first.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function saveOnline() {
  const button = document.getElementById("save-online");
  button.disabled = true;
  button.innerHTML = `<i class="ph ph-circle-notch spin"></i> ${state.storageMode === "static" ? "Saving…" : "Publishing…"}`;

  if (state.storageMode === "static") {
    try {
      state.adminDraft.updatedAt = new Date().toISOString();
      window.localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(state.adminDraft));
      state.adminDirty = false;
      state.data = structuredClone(state.adminDraft);
      renderAdmin();
      showToast(
        "Saved in this browser. Export a file to publish the dataset elsewhere.",
        "success",
      );
    } catch {
      button.disabled = false;
      button.innerHTML = '<i class="ph ph-floppy-disk"></i> Save in browser';
      showToast("This browser could not store the dataset.", "error");
    }
    return;
  }

  try {
    const response = await fetch(apiUrl("projects"), {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-admin-password": state.adminPassword,
      },
      body: JSON.stringify({
        sourceNote: state.adminDraft.sourceNote,
        projects: state.adminDraft.projects,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to publish changes.");
    state.adminDraft.updatedAt = result.updatedAt;
    state.adminDirty = false;
    state.data = structuredClone(state.adminDraft);
    renderAdmin();
    showToast("Published. The atlas now uses this dataset.", "success");
  } catch (error) {
    button.disabled = false;
    button.innerHTML = '<i class="ph ph-cloud-arrow-up"></i> Save online';
    showToast(error.message || "Unable to publish changes.", "error");
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("admin-toast");
  if (!toast) return;
  toast.className = `admin-toast is-visible ${type}`;
  toast.innerHTML = `<i class="ph ${type === "success" ? "ph-check-circle" : "ph-warning-circle"}"></i>${escapeHtml(message)}`;
  window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportJson() {
  download(
    "projects.json",
    JSON.stringify(state.adminDraft, null, 2),
    "application/json",
  );
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function exportCsv() {
  const fields = [
    "id",
    "name",
    "site",
    "country",
    "region",
    "lat",
    "lon",
    "vendor",
    "model",
    "technology",
    "status",
    "projectType",
    "capacity",
    "targetDeployment",
    "partners",
    "summary",
    "source",
    "sourceLabel",
  ];
  const csv = [
    fields.join(","),
    ...state.adminDraft.projects.map((project) =>
      fields.map((field) => csvEscape(project[field])).join(","),
    ),
  ].join("\n");
  download(
    `smr-atlas-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  const headers = rows.shift().map((header) => header.trim());
  return rows.map((values, rowIndex) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    record.id = record.id || slug(record.name) || `imported-${rowIndex + 1}`;
    ["lat", "lon", "capacity"].forEach((field) => {
      record[field] = Number(record[field] || 0);
    });
    return record;
  });
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = file.name.toLowerCase().endsWith(".csv")
      ? { ...state.adminDraft, projects: parseCsv(text) }
      : JSON.parse(text);
    if (!Array.isArray(imported.projects)) {
      throw new Error("The file must contain a projects array or CSV project rows.");
    }
    const ids = new Set();
    imported.projects = imported.projects.map((project, index) => {
      let id = slug(project.id || project.name || `project-${index + 1}`);
      while (ids.has(id)) id += "-copy";
      ids.add(id);
      return { ...project, id };
    });
    state.adminDraft = {
      updatedAt: state.adminDraft.updatedAt,
      sourceNote: imported.sourceNote || state.adminDraft.sourceNote,
      projects: imported.projects,
    };
    state.adminDirty = true;
    state.adminSearch = "";
    renderAdmin();
    showToast(`Imported ${imported.projects.length} projects. Review them before saving.`, "success");
  } catch (error) {
    showToast(error.message || "The file could not be imported.", "error");
  } finally {
    event.target.value = "";
  }
}

async function start() {
  await fetchDataset();
  renderRoute();
}

function renderRoute() {
  document.body.classList.remove("filters-open");
  state.map?.remove();
  state.map = null;
  state.markerLayer = null;
  state.markers.clear();

  if (isAdminRoute()) {
    state.adminPassword && state.adminDraft ? renderAdmin() : loginScreen();
    return;
  }
  renderMain();
}

window.addEventListener("hashchange", renderRoute);
start();
