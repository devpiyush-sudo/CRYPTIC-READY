import { useEffect, useState } from "react";
import { frameStyleFromCss, getWallpaperById } from "../data/wallpapers";
import { WallpaperContext } from "./wallpaper";

const STORAGE_KEY = "chat-wallpaper-id";

function readStoredWallpaperId() {
  return localStorage.getItem(STORAGE_KEY) || "sunrise";
}

export function WallpaperProvider({ children }) {
  const [wallpaperId, setWallpaperId] = useState(readStoredWallpaperId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, wallpaperId);
  }, [wallpaperId]);

  const wallpaper = getWallpaperById(wallpaperId);
  const frameStyle = frameStyleFromCss(wallpaper.css);

  return (
    <WallpaperContext.Provider value={{ wallpaperId, setWallpaperId, wallpaper, frameStyle }}>
      {children}
    </WallpaperContext.Provider>
  );
}
