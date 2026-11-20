// Filtering and the spoiler rule: which trophies a view shows, and what a
// hidden story trophy looks like before it is earned.

export function filterTrophies(trophies, options) {
  const query = (options.query || "").trim().toLowerCase();
  return trophies.filter((t) => {
    if (options.kind && options.kind !== "all" && t.kind !== options.kind) return false;
    if (options.grade && options.grade !== "all" && t.grade !== options.grade) return false;
    if (query) {
      const haystack = `${t.name} ${t.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function isHiddenBySpoilers(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.kind === "story" && !earned.has(trophy.name);
}

export function shownName(trophy, spoilersOn, earned) {
  if (isHiddenBySpoilers(trophy, spoilersOn, earned)) return "Hidden story trophy";
  return trophy.name;
}

export function shownDescription(trophy, spoilersOn, earned) {
  if (isHiddenBySpoilers(trophy, spoilersOn, earned)) {
    return "A story trophy. Earn it to reveal its name and description.";
  }
  return trophy.description;
}

// The miss window, in plain words, from the official description alone.
// A named mission closes when that mission ends; a one-off moment closes
// when the moment passes; a character strand closes at its final mission.
export function missWindow(trophy) {
  const done = trophy.description.match(/^Complete (.+)\.$/);
  if (done && trophy.kind === "missable") {
    return `Miss window: ${done[1]} — once that mission is done, this may be gone for this playthrough.`;
  }
  if (trophy.kind === "missable") {
    return "Miss window: the one moment the description names — take it when it appears.";
  }
  return "";
}
