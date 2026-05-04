/**
 * Company logos storage.
 * Persists logo URLs to both localStorage (for instant access) and AppSettings entity (for cross-device persistence).
 * Keys: "company_logo", "invoice_logo"
 * Values: hosted URLs (uploaded via UploadFile)
 */

import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "app_company_logos";
const SETTINGS_KEY = "company_logos";

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLocal(logos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
}

export function getLogo(key) {
  return loadLocal()[key] || null;
}

export function setLogo(key, url) {
  const logos = loadLocal();
  logos[key] = url;
  saveLocal(logos);
  // Also persist to database
  base44.entities.AppSettings.filter({ key: SETTINGS_KEY }).then(existing => {
    const value = JSON.stringify(logos);
    if (existing && existing.length > 0) {
      base44.entities.AppSettings.update(existing[0].id, { value });
    } else {
      base44.entities.AppSettings.create({ key: SETTINGS_KEY, value });
    }
  }).catch(() => {});
}

export function removeLogo(key) {
  const logos = loadLocal();
  delete logos[key];
  saveLocal(logos);
  // Also persist to database
  base44.entities.AppSettings.filter({ key: SETTINGS_KEY }).then(existing => {
    const value = JSON.stringify(logos);
    if (existing && existing.length > 0) {
      base44.entities.AppSettings.update(existing[0].id, { value });
    } else {
      base44.entities.AppSettings.create({ key: SETTINGS_KEY, value });
    }
  }).catch(() => {});
}

export function getAllLogos() {
  return loadLocal();
}

/** Call this on app init to sync logos from DB into localStorage */
export async function syncLogosFromDB() {
  try {
    const existing = await base44.entities.AppSettings.filter({ key: SETTINGS_KEY });
    if (existing && existing.length > 0) {
      const logos = JSON.parse(existing[0].value || "{}");
      saveLocal(logos);
      return logos;
    }
  } catch {}
  return loadLocal();
}