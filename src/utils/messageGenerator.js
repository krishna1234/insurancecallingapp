import { messageConfig } from "./messageConfig";

const sections = [
  "greeting",
  "wellWisher",
  "reminder",
  "vehicle",
  "renewal",
  "documents",
  "closing",
];

let callCounter = 0;
let lastSelection = null;

function seededPick(arr, seed) {
  if (!arr || arr.length === 0) return undefined;
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  const idx = Math.floor(Math.abs(x) % arr.length);
  return arr[idx];
}

function isSameSelection(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  for (const s of sections) {
    if (a[s] !== b[s]) return false;
  }
  return true;
}

function cleanPunctuation(text) {
  return text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\.\.\.*/g, ".")
    .replace(/,\s*\./g, ".")
    .replace(/\s*\.\s*/g, ". ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*-\s*/g, " - ")
    .trim();
}

function substitute(text, customer) {
  const { ownerName, make, model, vehicle_number, vehicleInsuranceUpto } = customer;
  const name = (ownerName || "Customer").trim();
  const makeModel = [make || "", model || ""].filter(Boolean).join(" ");
  const vehicle = (vehicle_number || "").trim();
  const expiry = (vehicleInsuranceUpto || "").trim();

  let result = text
    .replace(/\{owner\}/g, `${name}`)
    .replace(/\{vehicle\}/g, `${vehicle || "your vehicle"}`)
    .replace(/\{expiryDate\}/g, `${expiry || "soon"}`);

  if (makeModel) {
    result = result.replace(/\{make\} \{model\}/g, makeModel).replace(/\{make\}/g, makeModel);
  } else if (text.includes("{make}")) {
    result = result
      .replace(/\{make\} \{model\}/g, "")
      .replace(/\{make\}/g, "")
      .replace(/\{model\}/g, "")
      .replace(/\(\s*,/, "(")
      .replace(/,\s*\)/, ")")
      .replace(/\(\s*-/, "(")
      .replace(/-\s*\)/, ")")
      .replace(/\(\s*\)/, "")
      .replace(/:\s*$/, "");
  }

  result = cleanPunctuation(result);

  return result;
}

export function generateRenewalMessage(customer, type = "full") {
  let selection;
  let attempts = 0;
  const maxAttempts = 20;

  do {
    const seed = ++callCounter;
    selection = {};
    for (let i = 0; i < sections.length; i++) {
      const sectionName = sections[i];
      if (sectionName === "documents" && type !== "full") {
        selection[sectionName] = undefined;
        continue;
      }
      selection[sectionName] = seededPick(messageConfig[sectionName], seed + i * 31 + i * i * 7);
    }
    attempts++;
  } while (attempts < maxAttempts && isSameSelection(selection, lastSelection));

  lastSelection = selection;

  const parts = [];
  for (const sectionName of sections) {
    if (sectionName === "documents" && type !== "full") continue;
    const template = selection[sectionName];
    if (template === null || template === undefined) continue;
    const substituted = substitute(template, customer);
    if (substituted) {
      parts.push(substituted);
    }
  }

  return parts.join(" ");
}

export function getWhatsAppUrl(customer) {
  const message = generateRenewalMessage(customer, "full");
  const phone = customer.phone_number.replace(/\D/g, "");
  const fullPhone = phone.startsWith("91") ? phone : "91" + phone;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export function getSmsUrl(customer) {
  const message = generateRenewalMessage(customer, "sms");
  const phone = customer.phone_number.replace(/\D/g, "");
  return `sms:${phone}?body=${encodeURIComponent(message)}`;
}
