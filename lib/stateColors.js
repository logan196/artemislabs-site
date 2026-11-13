// Canonical cell-state -> color map, shared by every interactive figure so a
// state keeps its color across sections (Okabe-Ito base, tuned for cream bg).
export const STATE_COLORS = {
  "oligodendrocytes": "#0072B2",
  "astrocytes": "#009E73",
  "NPC-like tumor cells": "#D55E00",
  "NPC-like tumor": "#D55E00",
  "MES-like tumor cells": "#CC79A7",
  "MES-like tumor": "#CC79A7",
  "microglia/TAMs": "#E69F00",
  "pericytes/smooth muscle": "#56B4E9",
  "endothelial": "#1c1a15",
  "endothelial cells": "#1c1a15",
  "proliferating tumor": "#b0a004",
  "proliferating tumor cells": "#b0a004",
};

// deterministic fallback for states not in the map
const FALLBACK = ["#0072B2", "#009E73", "#D55E00", "#CC79A7", "#E69F00", "#56B4E9", "#1c1a15", "#b0a004"];

export function stateColor(name, i = 0) {
  return STATE_COLORS[name] || FALLBACK[i % FALLBACK.length];
}
