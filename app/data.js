// Trophy data: the official list plus this guide's own notes, loaded from
// the data file that ships with the app. No network is involved: the JSON
// is a module the page imports from its own files.
import trophyFile from "./data/trophies.json" with { type: "json" };

export const TROPHIES = trophyFile.trophies;

export const TOTAL = TROPHIES.length;

export const GRADE_LABELS = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export const KIND_LABELS = {
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  online: "Online",
};

// The six roadmap stages, in the order a player should work through them.
export const STAGES = [
  { n: 1, title: "Story — chapters and missions", blurb: "Play the story in order. Earn the mission trophies as they appear, and finish every missable mission trophy before the final mission." },
  { n: 2, title: "Side strands and one-off moments", blurb: "Character strands and single moments tied to one place or one chance. Clear these before the story ends where the guide says so." },
  { n: 3, title: "Collectibles and exploration", blurb: "Cards, meditation spots, vehicles and the whole map of Leonida. All of it stays open after the story, so take it at your own pace." },
  { n: 4, title: "Activities and combat", blurb: "Races, the shooting range, robberies, stunts and challenges. The long grinds live here — let them build up as you play." },
  { n: 5, title: "Money and properties", blurb: "Launder marked bills, spend across the shops and buy every garage. A good place to spend the money the earlier stages earned." },
  { n: 6, title: "The platinum", blurb: "Reach 100% completion and the platinum unlocks with the last trophy. If anything is still missing, the missables view shows what can no longer be earned." },
];

export function stageOf(trophy) {
  return STAGES.find((s) => s.n === trophy.stage) || STAGES[0];
}

export function byName(name) {
  return TROPHIES.find((t) => t.name === name);
}
