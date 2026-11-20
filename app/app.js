// Boot: wires the toolbar, the tabs and the views together, and keeps the
// saved progress in step with what the reader ticks.

import { TROPHIES, byName } from "./data.js";
import { exportProgress, importProgress, loadEarned, loadSpoilers, saveEarned, saveSpoilers } from "./store.js";
import { filterTrophies } from "./filters.js";
import { renderChecklist, renderCounters, renderDetail, renderMissables, renderRoadmap } from "./views.js";

const state = {
  earned: loadEarned(),
  spoilers: loadSpoilers(),
  selected: null,
  kind: "all",
  grade: "all",
  query: "",
  view: "checklist",
};

const listNode = document.getElementById("trophy-list");
const metaNode = document.getElementById("list-meta");
const emptyNode = document.getElementById("empty-note");
const detailPane = document.getElementById("detail-pane");
const roadmapNode = document.getElementById("roadmap-stages");
const missableNode = document.getElementById("missable-list");

const handlers = {
  onToggle(name, earned) {
    if (earned) state.earned.add(name);
    else state.earned.delete(name);
    saveEarned(state.earned);
    renderAll();
  },
  onSelect(name) {
    state.selected = name;
    showView("checklist");
    renderAll();
  },
};

function currentFilters() {
  return { kind: state.kind, grade: state.grade, query: state.query };
}

function renderAll() {
  renderCounters(state);
  renderChecklist(listNode, metaNode, emptyNode, filterTrophies(TROPHIES, currentFilters()), state, handlers);
  renderDetail(detailPane, state.selected ? byName(state.selected) : null, state, handlers);
  renderRoadmap(roadmapNode, state, handlers);
  renderMissables(missableNode, state, handlers);
}

function showView(view) {
  state.view = view;
  for (const tab of document.querySelectorAll(".tab")) {
    tab.classList.toggle("is-active", tab.dataset.view === view);
  }
  for (const section of document.querySelectorAll(".view")) {
    const visible = section.id === `view-${view}`;
    section.classList.toggle("is-visible", visible);
    section.hidden = !visible;
  }
}

for (const tab of document.querySelectorAll(".tab")) {
  tab.addEventListener("click", () => {
    showView(tab.dataset.view);
    renderAll();
  });
}

for (const button of document.querySelectorAll(".kind-btn")) {
  button.addEventListener("click", () => {
    state.kind = button.dataset.kind;
    for (const other of document.querySelectorAll(".kind-btn")) {
      other.classList.toggle("is-active", other === button);
    }
    renderAll();
  });
}

document.getElementById("grade-filter").addEventListener("change", (event) => {
  state.grade = event.target.value;
  renderAll();
});

document.getElementById("search").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderAll();
});

const spoilerBox = document.getElementById("spoiler-toggle");
spoilerBox.checked = state.spoilers;
spoilerBox.addEventListener("change", () => {
  state.spoilers = spoilerBox.checked;
  saveSpoilers(state.spoilers);
  renderAll();
});

document.getElementById("export-btn").addEventListener("click", () => {
  exportProgress(state.earned);
});

const importFile = document.getElementById("import-file");
document.getElementById("import-btn").addEventListener("click", () => importFile.click());
importFile.addEventListener("change", () => {
  const file = importFile.files && importFile.files[0];
  if (!file) return;
  const knownNames = new Set(TROPHIES.map((t) => t.name));
  importProgress(
    file,
    knownNames,
    (earned, count) => {
      state.earned = earned;
      saveEarned(state.earned);
      renderAll();
      alert(`Imported progress: ${count} trophies earned.`);
    },
    (message) => alert(message),
  );
  importFile.value = "";
});

renderAll();
