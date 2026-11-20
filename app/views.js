// Views: every part of the page that shows trophies. Each render builds
// plain DOM nodes, so the page stays readable with scripts off the network
// and with nothing but its own files.

import { GRADE_LABELS, KIND_LABELS, STAGES, TOTAL, TROPHIES, stageOf } from "./data.js";
import { isHiddenBySpoilers, missWindow, shownDescription, shownName } from "./filters.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function medalDot(grade) {
  return el("span", `medal ${grade}`);
}

function tagChip(text, extraClass) {
  return el("span", `tag${extraClass ? ` ${extraClass}` : ""}`, text);
}

// One checklist row: a checkbox, the grade medal, the name and description
// (spoiler-masked when the setting hides them), and the kind tags.
export function trophyRow(trophy, state, handlers) {
  const row = el("li");
  const button = el("button", "trophy-row");
  button.type = "button";
  button.dataset.name = trophy.name;
  if (state.earned.has(trophy.name)) button.classList.add("is-earned");
  if (state.selected === trophy.name) button.classList.add("is-selected");

  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = state.earned.has(trophy.name);
  box.setAttribute("aria-label", `Earned: ${shownName(trophy, state.spoilers, state.earned)}`);
  box.addEventListener("click", (event) => {
    event.stopPropagation();
    handlers.onToggle(trophy.name, box.checked);
  });
  button.appendChild(box);
  button.appendChild(medalDot(trophy.grade));

  const body = el("div");
  body.appendChild(el("div", "trophy-name", shownName(trophy, state.spoilers, state.earned)));
  body.appendChild(el("div", "trophy-desc", shownDescription(trophy, state.spoilers, state.earned)));
  const tags = el("div", "trophy-tags");
  tags.appendChild(tagChip(GRADE_LABELS[trophy.grade], `grade-${trophy.grade}`));
  tags.appendChild(tagChip(KIND_LABELS[trophy.kind] || trophy.kind));
  if (trophy.missable && trophy.kind !== "missable") tags.appendChild(tagChip("Missable", "missable"));
  if (trophy.hidden) tags.appendChild(tagChip("Hidden"));
  body.appendChild(tags);
  button.appendChild(body);
  button.appendChild(el("div", "trophy-stage", `Stage ${trophy.stage}`));

  button.addEventListener("click", () => handlers.onSelect(trophy.name));
  row.appendChild(button);
  return row;
}

export function renderChecklist(listNode, metaNode, emptyNode, trophies, state, handlers) {
  listNode.replaceChildren();
  for (const trophy of trophies) {
    listNode.appendChild(trophyRow(trophy, state, handlers));
  }
  emptyNode.hidden = trophies.length > 0;
  const shown = trophies.length;
  metaNode.textContent = `Showing ${shown} of ${TOTAL} trophies · ${state.earned.size} earned`;
}

export function renderMissables(listNode, state, handlers) {
  const missable = TROPHIES.filter((t) => t.missable);
  listNode.replaceChildren();
  for (const trophy of missable) {
    const row = trophyRow(trophy, state, handlers);
    const note = el("p", "view-intro", missWindow(trophy));
    note.style.margin = "4px 0 0";
    row.appendChild(note);
    listNode.appendChild(row);
  }
  return missable.length;
}

export function renderRoadmap(stagesNode, state, handlers) {
  stagesNode.replaceChildren();
  for (const stage of STAGES) {
    const members = TROPHIES.filter((t) => t.stage === stage.n);
    const earned = members.filter((t) => state.earned.has(t.name)).length;
    const section = el("section", "roadmap-stage");
    const heading = el("h2", null, `${stage.n}. ${stage.title} `);
    heading.appendChild(el("span", "stage-count", `— ${earned} of ${members.length} earned`));
    section.appendChild(heading);
    section.appendChild(el("p", null, stage.blurb));
    const list = el("ul", "trophy-list");
    for (const trophy of members) list.appendChild(trophyRow(trophy, state, handlers));
    section.appendChild(list);
    stagesNode.appendChild(section);
  }
}

// The guide pane beside the checklist: official text, our guide, steps,
// the miss window when there is one, and the sources for every fact.
export function renderDetail(pane, trophy, state, handlers) {
  pane.replaceChildren();
  if (!trophy) {
    pane.appendChild(el("p", "detail-empty", "Select a trophy to read its guide, steps and sources."));
    return;
  }
  const hidden = isHiddenBySpoilers(trophy, state.spoilers, state.earned);
  pane.appendChild(el("h2", null, shownName(trophy, state.spoilers, state.earned)));
  const official = el("p", "official", `Official: ${shownDescription(trophy, state.spoilers, state.earned)} · ${GRADE_LABELS[trophy.grade]} · ${KIND_LABELS[trophy.kind] || trophy.kind}${trophy.missable ? " · Missable" : ""} · Stage ${trophy.stage} — ${stageOf(trophy).title}`);
  pane.appendChild(official);
  if (hidden) {
    pane.appendChild(el("p", "spoiler-note", "Spoilers are hidden: this story trophy's guide is masked until you earn it. Untick the spoiler setting above, or tick the trophy earned, to read it."));
  } else {
    pane.appendChild(el("h3", null, "Guide"));
    pane.appendChild(el("p", null, trophy.guide));
    if (trophy.steps && trophy.steps.length > 0) {
      pane.appendChild(el("h3", null, "Steps"));
      const steps = el("ol");
      for (const step of trophy.steps) steps.appendChild(el("li", null, step));
      pane.appendChild(steps);
    }
    if (trophy.missable) {
      pane.appendChild(el("h3", null, "When it can be missed"));
      pane.appendChild(el("p", null, missWindow(trophy)));
    }
    pane.appendChild(el("h3", null, "Sources"));
    const sources = el("ul", "sources");
    for (const source of trophy.sources) sources.appendChild(el("li", null, source));
    pane.appendChild(sources);
  }
  const actions = el("div", "detail-actions");
  const toggle = el("button", null, state.earned.has(trophy.name) ? "Mark as not earned" : "Mark as earned");
  toggle.type = "button";
  toggle.addEventListener("click", () => handlers.onToggle(trophy.name, !state.earned.has(trophy.name)));
  actions.appendChild(toggle);
  pane.appendChild(actions);
}

export function renderCounters(state) {
  const countNode = document.getElementById("earned-count");
  countNode.textContent = String(state.earned.size);
  const fill = document.getElementById("progress-fill");
  fill.style.width = `${(state.earned.size / TOTAL) * 100}%`;
  const bar = document.getElementById("progress-bar");
  bar.setAttribute("aria-valuenow", String(state.earned.size));
  const gradeNode = document.getElementById("grade-counts");
  gradeNode.replaceChildren();
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    const total = TROPHIES.filter((t) => t.grade === grade).length;
    const earned = TROPHIES.filter((t) => t.grade === grade && state.earned.has(t.name)).length;
    const item = el("li");
    item.appendChild(el("b", null, `${earned}/${total}`));
    item.appendChild(document.createTextNode(` ${GRADE_LABELS[grade]}`));
    gradeNode.appendChild(item);
  }
  const next = document.getElementById("next-up");
  const ordered = [...TROPHIES].sort((a, b) => a.stage - b.stage || TROPHIES.indexOf(a) - TROPHIES.indexOf(b));
  const upcoming = ordered.find((t) => !state.earned.has(t.name));
  if (upcoming) {
    next.replaceChildren();
    next.appendChild(document.createTextNode("Next up: "));
    next.appendChild(el("b", null, upcoming.name));
    next.appendChild(document.createTextNode(` (Stage ${upcoming.stage})`));
  } else {
    next.textContent = "Every trophy earned — Leonida Legend.";
  }
  const badge = document.getElementById("missable-count");
  const missed = TROPHIES.filter((t) => t.missable && !state.earned.has(t.name)).length;
  badge.textContent = String(missed);
}
