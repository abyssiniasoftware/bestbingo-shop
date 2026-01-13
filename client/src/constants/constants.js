import config from "./config";
export const backgroundOptions = [
  { value: "default", label: "Default", style: { backgroundColor: "#111827" } },

  {
    value: "white",
    label: "White",
    style: { backgroundColor: "#f6f6f6" },
  },
  {
    value: "gradient-blue",
    label: "Blue Gradient",
    style: { background: "linear-gradient(135deg, #1e3a8a, #60a5fa)" },
  },
  {
    value: "gradient-purple",
    label: "Purple Gradient",
    style: { background: "linear-gradient(135deg, #4c1d95, #a78bfa)" },
  },
  {
    value: "night-sky",
    label: "Night Sky",
    style: {
      background: "url(/backgrounds/night-sky.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "ocean-waves",
    label: "Ocean Waves",
    style: {
      background: "url(/backgrounds/ocean-waves.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "forest",
    label: "Forest",
    style: {
      background: "url(/backgrounds/forest.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "abstract",
    label: "Abstract",
    style: {
      background: "url(/backgrounds/abstract.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "cosmic",
    label: "Cosmic",
    style: {
      background: "url(/backgrounds/cosmic.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "pixel-art",
    label: "Pixel Art",
    style: {
      background: "url(/backgrounds/pixel-art.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "sunset",
    label: "Sunset",
    style: {
      background: "url(/backgrounds/sunset.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "city-lights",
    label: "City Lights",
    style: { background: "linear-gradient(135deg, #ff3333, #ffcc00)" },
  },
  {
    value: "desert-sands",
    label: "Desert Sands",
    style: {
      background: "url(/backgrounds/desert-sands.jpg)",
      backgroundSize: "cover",
    },
  },
  {
    value: "cyberpunk",
    label: "Cyberpunk",
    style: { background: "linear-gradient(135deg, #ff0066, #3300cc)" },
  },
];
export const backgroundButtonColors = {
  default: "bg-gray-600",
  white: "bg-blue-700",
  "gradient-blue": "bg-blue-600",
  "gradient-purple": "bg-purple-600",
  "night-sky": "bg-blue-800",
  "ocean-waves": "bg-teal-600",
  forest: "bg-green-700",
  abstract: "bg-indigo-600",
  cosmic: "bg-purple-700",
  "pixel-art": "bg-gray-700",
  sunset: "bg-orange-600",
  "city-lights": "bg-amber-600",
  "desert-sands": "bg-yellow-700",
  cyberpunk: "bg-pink-600",
};
// green, blue, default,

export const voiceOptions = [
  // ai voice
  { value: "l", label: "ሮቦት" },

  // amharic females
  { value: "a", label: "አማርኛ 1" },
  { value: "f", label: "አማርኛ 6" },
  { value: "i", label: "አማርኛ 9" },
  { value: "s", label: "አማርኛ 16" },
  { value: "y", label: "አማርኛ 17" },
  { value: "z", label: "አማርኛ 18" },


  // amharic voices
  { value: "b", label: "አማርኛ 2" },
  { value: "c", label: "አማርኛ 3" },
  { value: "d", label: "አማርኛ 4" },
  { value: "e", label: "አማርኛ 5" },
  { value: "g", label: "አማርኛ 7"},
  { value: "h", label: "አማርኛ 8" },
  { value: "j", label: "አማርኛ 10" },
  { value: "k", label: "አማርኛ 11" },
  { value: "m", label: "አማርኛ 12" },
  { value: "n", label: "አማርኛ 13" },
  { value: "q", label: "አማርኛ 14" },
  { value: "r", label: "አማርኛ 15" },

  // oromiffa voices
  { value: "o", label: "ኦሮምኛ 1" },
  { value: "p", label: "ኦሮምኛ 2" },

  // tigrigna voices
  { value: "t", label: "ትግረኛ 1" },
  { value: "u", label: "ትግረኛ 2" },

  // tigrigna male
  { value: "v", label: "ትግረኛ 3" },

  // wolayta voice
    { value: "w", label: "ወላይታ" },

      // sidama voice
    { value: "x", label: "ሲዳማ" },
];

//constants for the game
export { META_PATTERNS, BINGO_PATTERNS } from "../utils/patterns";
