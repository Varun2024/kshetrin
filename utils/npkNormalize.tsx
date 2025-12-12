// utils/npkNormalize.js

const ACRE_TO_HA = 2.47105381;
const HA_TO_ACRE = 1 / ACRE_TO_HA;

/**
 * Convert mass to kg (accepts 'kg' or 'g')
 */
function massToKg(value, massUnit : (string | null) ) {
  if (value == null) return null;
  const v = Number(value);
  if (!Number.isFinite(v)) return null;
  const mu = (massUnit || "kg").toLowerCase();
  if (mu.startsWith("k")) return v;        // kg
  if (mu.startsWith("g")) return v / 1000; // g -> kg
  // fallback try numeric parse
  return v;
}

/**
 * Convert area units to kg/acre
 * If entry area_unit is 'acre' -> value is interpreted as kg/acre already.
 * If area_unit is 'ha' -> convert kg/ha -> kg/acre by dividing by ACRE_TO_HA.
 * If no area_unit specified, you can choose a default (here we assume 'acre' if text contained 'acre' previously,
 * otherwise assume 'ha' is also common — adapt as you need).
 */
function areaNormalizeToKgPerAcre(kgValue, areaUnit) {
  if (kgValue == null) return null;
  const au = (areaUnit || "").toLowerCase();
  if (au.startsWith("acre")) return kgValue;
  // treat hectare or missing => convert kg/ha -> kg/acre
  return kgValue * HA_TO_ACRE;
}

/**
 * Normalize extractor output into simple numeric map { N: number, P2O5: number, K2O: number } in kg/acre
 * Accepts either:
 *  - unit-aware object: { N: { value, mass_unit, area_unit }, ... }
 *  - simple numeric map: { N: 12.2, ... } (passed through)
 */
export function normalizeExtractedNpkToKgPerAcre(extracted) {
  if (!extracted) return null;

  // if already simple numeric map, ensure numbers
  const isSimple = ["N", "P2O5", "K2O"].every(k => typeof extracted[k] === "number");
  if (isSimple) {
    return {
      N: Number(extracted.N || 0),
      P2O5: Number(extracted.P2O5 || 0),
      K2O: Number(extracted.K2O || 0)
    };
  }

  // else assume unit-aware structure
  const out = {};
  ["N", "P2O5", "K2O"].forEach((k) => {
    const entry = extracted[k];
    if (!entry) {
      out[k] = 0;
      return;
    }
    // if entry is already a number
    if (typeof entry === "number") {
      out[k] = entry;
      return;
    }
    // if entry has .value and maybe units
    const value = entry.value ?? entry.v ?? entry.amount ?? null;
    const massUnit = entry.mass_unit ?? entry.mass ?? "kg";
    const areaUnit = entry.area_unit ?? entry.area ?? null;

    const kg = massToKg(value, massUnit);
    if (kg == null) {
      out[k] = 0;
      return;
    }
    // convert kg per area into kg/acre
    // NOTE: many extractors return value already as kg/acre in examples; if areaUnit missing but you know text used 'acre' apply logic earlier
    const kgPerAcre = areaNormalizeToKgPerAcre(kg, areaUnit);
    out[k] = Number((kgPerAcre || 0).toFixed(6)); // keep a sane precision
  });

  return out;
}

/** Convenience conversions */
export function kgPerAcreToKgPerHa(kgPerAcre) {
  return Number((kgPerAcre * ACRE_TO_HA).toFixed(6));
}
export function kgPerAcreToGPerM2(kgPerAcre) {
  // kg/acre -> g/m2: (kg * 1000 g/kg) / 4046.8564224 m2/acre
  const ACRE_TO_M2 = 4046.8564224;
  const gPerM2 = (kgPerAcre * 1000.0) / ACRE_TO_M2;
  return Number(gPerM2.toFixed(6));
}
