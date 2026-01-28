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
  { value: "a", label: "ሀና" },
  { value: "f", label: "ሳራ" },
  { value: "i", label: "ሜሮን" },
  { value: "s", label: "ቤቲ" },
  { value: "y", label: "ሜላት" },
  { value: "z", label: "አለሚቱ" },

  // amharic voices
  { value: "b", label: "ዳንኤል" },
  { value: "c", label: "ሳሙኤል" },
  { value: "d", label: "ዮናስ" },
  { value: "e", label: "አብነት" },
  { value: "g", label: "ኤርምያስ" },
  { value: "h", label: "ብዙአየሁ" },
  { value: "j", label: "ካሌብ" },
  { value: "k", label: "ኤልያስ" },
  { value: "m", label: "መስፍን" },
  { value: "n", label: "አማኑኤል" },
  { value: "q", label: "አቤል" },
  { value: "r", label: "ናቲ" },

  // oromiffa voices
  { value: "o", label: "ጫልቱ" },
  { value: "p", label: "ሰብሪና" },

  // tigrigna voices
  { value: "t", label: "ሰናይት" },
  { value: "u", label: "ሩት" },

  // tigrigna male
  { value: "v", label: "ተወልደ" },

  // wolayta voice
  { value: "w", label: "ዳዊት" },

  // sidama voice
  { value: "x", label: "ወይና" },
];

//constants for the game
export { META_PATTERNS, BINGO_PATTERNS } from "../utils/patterns";
