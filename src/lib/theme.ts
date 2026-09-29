import { STORAGE_KEYS } from "./storage";

/** Inline script for <head>: applies the stored theme before first paint (no flash). */
export const themeInitScript = `try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEYS.theme)}));if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
