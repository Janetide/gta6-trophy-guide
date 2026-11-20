// Saved progress: which trophies are earned, plus the spoiler setting.
// Everything lives in the browser's local storage under one key, so the
// guide keeps working with the network off and across visits.

const PROGRESS_KEY = "gta6-trophy-guide-progress-v1";
const SPOILER_KEY = "gta6-trophy-guide-spoilers-v1";

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((name) => typeof name === "string"));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
  } catch {
    // Storage full or unavailable: progress still works for this visit.
  }
}

export function loadSpoilers() {
  try {
    return localStorage.getItem(SPOILER_KEY) === "on";
  } catch {
    return false;
  }
}

export function saveSpoilers(on) {
  try {
    localStorage.setItem(SPOILER_KEY, on ? "on" : "off");
  } catch {
    // Ignore: the setting still applies for this visit.
  }
}

// Write the earned list out as a JSON file the reader can keep or share.
export function exportProgress(earned) {
  const payload = {
    app: "gta6-trophy-guide",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gta6-trophy-progress.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Read a progress file back in. Names that are not on the official list
// are ignored, so a file from another guide cannot corrupt the tracker.
// Calls onDone with the number of trophies imported, or onError with a
// short message when the file cannot be read.
export function importProgress(file, knownNames, onDone, onError) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const names = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(names)) throw new Error("no earned list");
      const kept = names.filter((name) => knownNames.has(name));
      onDone(new Set(kept), kept.length);
    } catch {
      onError("That file is not a progress export from this guide.");
    }
  };
  reader.onerror = () => onError("That file could not be read.");
  reader.readAsText(file);
}
