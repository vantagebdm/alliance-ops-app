/**
 * Simple in-memory + localStorage store for company logos.
 * Keys: "company_logo", "invoice_logo"
 * Values: data URLs or hosted URLs
 */

const STORAGE_KEY = "app_company_logos";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(logos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
}

export function getLogo(key) {
  return load()[key] || null;
}

export function setLogo(key, url) {
  const logos = load();
  logos[key] = url;
  save(logos);
}

export function removeLogo(key) {
  const logos = load();
  delete logos[key];
  save(logos);
}

export function getAllLogos() {
  return load();
}