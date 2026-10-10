// Backdrops are pure CSS gradients: nothing to download, instant to switch.
export const WALLPAPER_SECTIONS = [
  { id: "scenic", title: "Scenic" },
  { id: "abstract", title: "Abstract" },
];

export const WALLPAPERS = [
  { id: "sunrise", category: "scenic", label: "Sunrise", css: "linear-gradient(160deg,#ff9a8b 0%,#ff6a88 45%,#ff99ac 100%)" },
  { id: "ocean", category: "scenic", label: "Ocean", css: "linear-gradient(160deg,#2193b0 0%,#6dd5ed 100%)" },
  { id: "forest", category: "scenic", label: "Forest", css: "linear-gradient(160deg,#134e5e 0%,#71b280 100%)" },
  { id: "dusk", category: "scenic", label: "Dusk", css: "linear-gradient(160deg,#2c3e50 0%,#fd746c 100%)" },
  { id: "desert", category: "scenic", label: "Desert", css: "linear-gradient(160deg,#f7b733 0%,#fc4a1a 100%)" },
  { id: "glacier", category: "scenic", label: "Glacier", css: "linear-gradient(160deg,#bdc3c7 0%,#2c3e50 100%)" },
  { id: "aurora", category: "abstract", label: "Aurora", css: "radial-gradient(circle at 20% 20%,#00c6ff 0%,transparent 55%),radial-gradient(circle at 80% 80%,#7f00ff 0%,transparent 55%),#0b1020" },
  { id: "radial-blue", category: "abstract", label: "Radial Blue", css: "radial-gradient(circle at 50% 40%,#4facfe 0%,#1a3cff 60%,#08134d 100%)" },
  { id: "radial-green", category: "abstract", label: "Radial Green", css: "radial-gradient(circle at 50% 40%,#9be15d 0%,#00b09b 60%,#014d40 100%)" },
  { id: "radial-purple", category: "abstract", label: "Radial Purple", css: "radial-gradient(circle at 50% 40%,#d38cff 0%,#7b2ff7 60%,#2a0a5e 100%)" },
  { id: "radial-yellow", category: "abstract", label: "Radial Yellow", css: "radial-gradient(circle at 50% 40%,#fff3a0 0%,#ffc837 60%,#c26a00 100%)" },
  { id: "midnight", category: "abstract", label: "Midnight", css: "linear-gradient(160deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" },
];

export function frameStyleFromCss(css) {
  return { backgroundImage: css, backgroundSize: "cover", backgroundPosition: "center" };
}

export function getWallpaperById(id) {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}
