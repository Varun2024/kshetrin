
// // AIInsights.tsx
// import React, { useState } from "react";
// import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";

// type NpkSimple = { N: number; P2O5: number; K2O: number };
// type NpkUnitAware = {
//     N?: { value: number; mass_unit?: string; area_unit?: string };
//     P2O5?: { value: number; mass_unit?: string; area_unit?: string };
//     K2O?: { value: number; mass_unit?: string; area_unit?: string };
// };

// const ACRE_TO_HA = 2.47105381;
// const HA_TO_ACRE = 1 / ACRE_TO_HA;
// const ACRE_TO_M2 = 4046.8564224;
// const HA_TO_M2 = 10000.0;
// const FLOW_RATE_LPM = 10.0; // requested default

// const SOLUBILITY_G_PER_L: Record<string, number> = { N: 120.0, P2O5: 250.0, K2O: 83.0 };

// /* ------------------ helpers ------------------ */

// function kgPerHaToKgPerAcre(kgPerHa: number) {
//     return kgPerHa / ACRE_TO_HA;
// }
// function kgPerAcreToKgPerHa(kgPerAcre: number) {
//     return kgPerAcre * ACRE_TO_HA;
// }
// function kgPerAcreToGperM2(kgPerAcre: number) {
//     return (kgPerAcre * 1000.0) / ACRE_TO_M2;
// }
// function kgToKg(value: number, massUnit?: string) {
//     if (!massUnit) return value;
//     const mu = massUnit.toLowerCase();
//     if (mu.startsWith("g")) return value / 1000.0;
//     return value;
// }

// /** liters of stock solution per hectare given kg/ha and solubility (g/L) */
// function litersNeededPerHaFromKgPerHa(kgPerHa: number, nutrient: "N" | "P2O5" | "K2O") {
//     const gNeeded = kgPerHa * 1000.0;
//     const gPerL = SOLUBILITY_G_PER_L[nutrient];
//     if (!gPerL || gPerL <= 0) return 0;
//     return +(gNeeded / gPerL).toFixed(6);
// }

// /** compute times based on liters_per_ha and flow rate L/min */
// function timeMinutesForFlow(litersPerHa: number, flowRateLpm = FLOW_RATE_LPM) {
//     if (!flowRateLpm || flowRateLpm <= 0) return 0;
//     const minutes = litersPerHa / flowRateLpm;
//     const secPerM2 = (litersPerHa / HA_TO_M2 / flowRateLpm) * 60.0;
//     return { minutes: +minutes.toFixed(4), seconds_per_m2: +secPerM2.toFixed(6) };
// }

// /** normalize server returned recommended_application to a simple kg/acre map
//  * Accepts either:
//  *  - simple numeric map in kg/ha (common), or
//  *  - unit-aware extractor object { N: {value, mass_unit, area_unit}, ... } (like your earlier example)
//  * Returns { kgPerAcre: {N,P2O5,K2O}, kgPerHa: {...} }
//  */
// function normalizeRecommended(rec: any): { kgPerAcre: NpkSimple; kgPerHa: NpkSimple } {
//     // default zeros
//     const zeros = { N: 0, P2O5: 0, K2O: 0 };

//     if (!rec) return { kgPerAcre: zeros, kgPerHa: zeros };

//     // if rec appears simple numeric map (kg/ha)
//     const simpleKeys = ["N", "P2O5", "K2O"];
//     const isSimpleNumeric =
//         simpleKeys.every((k) => typeof rec[k] === "number" || typeof rec[k] === "string");

//     if (isSimpleNumeric) {
//         // interpret as kg/ha (common server side shape). Convert to numbers safely.
//         const kgPerHa: NpkSimple = {
//             N: Number(rec.N || 0),
//             P2O5: Number(rec.P2O5 || 0),
//             K2O: Number(rec.K2O || 0),
//         };
//         const kgPerAcre: NpkSimple = {
//             N: +kgPerHaToKgPerAcre(kgPerHa.N).toFixed(2),
//             P2O5: +kgPerHaToKgPerAcre(kgPerHa.P2O5).toFixed(2),
//             K2O: +kgPerHaToKgPerAcre(kgPerHa.K2O).toFixed(2),
//         };
//         return { kgPerAcre, kgPerHa };
//     }

//     // else assume unit-aware object like {N:{value,mass_unit,area_unit}, ...}
//     const kgPerAcre: any = {};
//     const kgPerHa: any = {};
//     simpleKeys.forEach((k) => {
//         const entry = rec[k];
//         if (!entry) {
//             kgPerAcre[k] = 0;
//             kgPerHa[k] = 0;
//             return;
//         }
//         // If entry value is direct number, assume it's kg/acre
//         if (typeof entry === "number") {
//             kgPerAcre[k] = entry;
//             kgPerHa[k] = +kgPerAcreToKgPerHa(entry).toFixed(6);
//             return;
//         }
//         const val = Number(entry.value ?? entry.v ?? 0);
//         const mass_unit = entry.mass_unit ?? entry.mass ?? "kg";
//         const area_unit = (entry.area_unit ?? entry.area ?? "").toLowerCase();

//         const kgMass = kgToKg(val, mass_unit);
//         let kgAcre = 0;
//         if (area_unit.startsWith("acre")) {
//             kgAcre = kgMass;
//         } else if (area_unit.startsWith("ha")) {
//             kgAcre = +(kgMass * HA_TO_ACRE);
//         } else {
//             // area_unit missing: guess - many LLM outputs used 'per acre' in examples;
//             // as safer default assume acre if the entry explicitly had area_unit 'acre' else treat as acre (you can change)
//             kgAcre = kgMass;
//         }
//         kgPerAcre[k] = +kgAcre.toFixed(6);
//         kgPerHa[k] = +kgPerAcreToKgPerHa(kgAcre).toFixed(6);
//     });
//     return { kgPerAcre: kgPerAcre as NpkSimple, kgPerHa: kgPerHa as NpkSimple };
// }

// /* ------------------ component ------------------ */

// export default function AIInsights({
//     visible,
//     stateData,
//     sensorData,
// }: {
//     visible: boolean;
//     stateData: string;
//     sensorData: any;
// }) {
//     const [loading, setLoading] = useState(false);
//     const [insight, setInsight] = useState<string | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [npkValues, setNpkValues] = useState<NpkSimple | null>(null);
//     const [times, setTimes] = useState<any | null>(null);

//     async function fetchInsight() {
//         setLoading(true);
//         setError(null);
//         setInsight(null);
//         setNpkValues(null);
//         setTimes(null);

//         try {
//             const resp = await fetch("http://10.232.159.240:5000/ai/insights", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     state: stateData,
//                     sensor: sensorData,
//                     assumptions: {},
//                 }),
//             });
//             const json = await resp.json();
//             if (!resp.ok) {
//                 setError(json?.error || "Server error");
//                 setLoading(false);
//                 return;
//             }

//             const descriptive = json?.descriptive_recommendation ?? json?.descriptive_recommendation_text ?? null;
//             setInsight(descriptive || "No recommendation returned.");

//             // server may return recommended_application_kg_per_ha (kg/ha) or returned unit-aware extractor
//             const rec = json?.recommended_application_kg_per_ha ?? json?.computed?.recommended_application_kg_per_ha ?? json?.recommended;
//             const extractorLike = json?.npk_extracted ?? json?.recommended_extracted ?? null;

//             // prefer explicit extractor-like object if present (unit-aware)
//             const normalized = normalizeRecommended(extractorLike ?? rec);
//             setNpkValues(normalized.kgPerAcre); // keep kg/ha in state for clarity

//             // compute liters/time per nutrient (based on kg/ha) and store
//             const perNut: any = {};
//             (["N", "P2O5", "K2O"] as const).forEach((nut) => {
//                 const kgPerAcre = normalized.kgPerAcre[nut];
//                 const litersPerAcre = litersNeededPerHaFromKgPerHa(kgPerAcre, nut);
//                 const t = timeMinutesForFlow(litersPerAcre, FLOW_RATE_LPM);
//                 perNut[nut] = {
//                     kg_per_acre: kgPerAcre,
//                     // kg_per_acre: +kgPerHaToKgPerAcre(kgPerAcre).toFixed(6),
//                     liters_per_acre: litersPerAcre,
//                     minutes_per_acre: t.minutes,
//                     seconds_per_m2: t.seconds_per_m2,
//                 };
//             });
//             setTimes(perNut);
//         } catch (e: any) {
//             setError(e?.message ?? "Network error");
//         } finally {
//             setLoading(false);
//         }
//     }

//     function onStartIrrigation() {
//         if (!times) {
//             Alert.alert("No timing calculated", "Please fetch recommendation first.");
//             return;
//         }
//         // For now just log; hook this to your endpoint controlling servo/pump later
//         console.log("Start irrigation timings (mins per acre):", times);
//         Alert.alert("Irrigation", `N: ${times.N.minutes_per_ha} min/acre, P: ${times.P2O5.minutes_per_ha} min/acre, K: ${times.K2O.minutes_per_ha} min/acre`);
//     } 

//     if (!visible) return null;

//     return (
//         <View style={{ backgroundColor: "#F3E8FF", borderRadius: 20, padding: 16, marginBottom: 16 }}>
//             <Text style={{ fontSize: 18, fontWeight: "700", color: "#5B21B6", marginBottom: 8 }}>AI Insights</Text>

//             {loading ? (
//                 <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
//                     <Text>AI is generating insights</Text>
//                     <ActivityIndicator size="small" color="#6D28D9" />
//                 </View>
//             ) : error ? (
//                 <>
//                     <Text style={{ color: "#B91C1C", marginBottom: 8 }}>Error: {error}</Text>
//                     <TouchableOpacity onPress={fetchInsight} style={{ backgroundColor: "#6D28D9", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
//                         <Text style={{ color: "white" }}>Retry</Text>
//                     </TouchableOpacity>
//                 </>
//             ) : insight ? (
//                 <>
//                     <Text style={{ color: "#4C1D95", marginBottom: 12 }}>{insight}</Text>

//                     {npkValues && times ? (
//                         <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 12 }}>
//                             <Text style={{ fontWeight: "600", marginBottom: 6 }}>Recommended application (kg/ha):</Text>
//                             <Text>N: {npkValues.N} kg/ha</Text>
//                             <Text>P2O5: {npkValues.P2O5} kg/ha</Text>
//                             <Text>K2O: {npkValues.K2O} kg/ha</Text>

//                             <View style={{ height: 8 }} />

//                             <Text style={{ fontWeight: "600", marginBottom: 6 }}>Solution & timing (flow: {FLOW_RATE_LPM} L/min):</Text>
//                             <Text>N: {times.N.liters_per_acre} L/acre → {times.N.minutes_per_acre} min</Text>
//                             <Text>P2O5: {times.P2O5.liters_per_acre} L/acre → {times.P2O5.minutes_per_acre} min</Text>
//                             <Text>K2O: {times.K2O.liters_per_acre} L/acre → {times.K2O.minutes_per_acre} min</Text>

//                             <View style={{ height: 12 }} />
//                             <TouchableOpacity onPress={onStartIrrigation} style={{ backgroundColor: "#6D28D9", borderRadius: 12, padding: 10 }}>
//                                 <Text style={{ color: "white", textAlign: "center" }}>Start irrigation</Text>
//                             </TouchableOpacity>
//                         </View>
//                     ) : (
//                         <TouchableOpacity onPress={fetchInsight} style={{ backgroundColor: "#6D28D9", borderRadius: 12, padding: 10 }}>
//                             <Text style={{ color: "white", textAlign: "center" }}>Fetch & compute timings</Text>
//                         </TouchableOpacity>
//                     )}
//                 </>
//             ) : (
//                 <>
//                     <Text style={{ color: "#5B21B6", marginBottom: 12 }}>
//                         Based on current sensors and weather, request an AI recommendation.
//                     </Text>
//                     <TouchableOpacity onPress={fetchInsight} style={{ backgroundColor: "#6D28D9", borderRadius: 12, padding: 10 }}>
//                         <Text style={{ color: "white", textAlign: "center" }}>Get Recommendation</Text>
//                     </TouchableOpacity>
//                 </>
//             )}
//         </View>
//     );
// }


// AIInsights.tsx
import React, { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";

type NpkSimple = { N: number; P2O5: number; K2O: number };
type NpkUnitAware = {
  N?: { value: number; mass_unit?: string; area_unit?: string };
  P2O5?: { value: number; mass_unit?: string; area_unit?: string };
  K2O?: { value: number; mass_unit?: string; area_unit?: string };
};

const ACRE_TO_HA = 2.47105381;
const HA_TO_ACRE = 1 / ACRE_TO_HA;
const ACRE_TO_M2 = 4046.8564224;
const HA_TO_M2 = 10000.0;
const FLOW_RATE_LPM = 10.0; // requested default

const SOLUBILITY_G_PER_L: Record<string, number> = { N: 120.0, P2O5: 250.0, K2O: 83.0 };

/* ------------------ helpers ------------------ */

function kgPerHaToKgPerAcre(kgPerHa: number) {
  return kgPerHa / ACRE_TO_HA;
}
function kgPerAcreToKgPerHa(kgPerAcre: number) {
  return kgPerAcre * ACRE_TO_HA;
}
function kgPerAcreToGperM2(kgPerAcre: number) {
  return (kgPerAcre * 1000.0) / ACRE_TO_M2;
}
function kgToKg(value: number, massUnit?: string) {
  if (!massUnit) return value;
  const mu = massUnit.toLowerCase();
  if (mu.startsWith("g")) return value / 1000.0;
  return value;
}

/** liters of stock solution per hectare given kg/ha and solubility (g/L) */
function litersNeededPerHaFromKgPerHa(kgPerHa: number, nutrient: "N" | "P2O5" | "K2O") {
  const gNeeded = kgPerHa * 1000.0;
  const gPerL = SOLUBILITY_G_PER_L[nutrient];
  if (!gPerL || gPerL <= 0) return 0;
  return +(gNeeded / gPerL).toFixed(6);
}

/** compute times based on liters_per_ha and flow rate L/min */
function timeMinutesForFlowPerHa(litersPerHa: number, flowRateLpm = FLOW_RATE_LPM) {
  if (!flowRateLpm || flowRateLpm <= 0) return { minutes: 0, seconds_per_m2: 0 };
  const minutes = litersPerHa / flowRateLpm;
  const secPerM2 = (litersPerHa / HA_TO_M2 / flowRateLpm) * 60.0;
  return { minutes: +minutes.toFixed(4), seconds_per_m2: +secPerM2.toFixed(6) };
}

/** normalize server returned recommended_application to a simple kg/acre map
 * Accepts either:
 *  - simple numeric map in kg/ha (common), or
 *  - unit-aware extractor object { N: {value, mass_unit, area_unit}, ... }
 * Returns { kgPerAcre: {N,P2O5,K2O}, kgPerHa: {...} }
 */
function normalizeRecommended(rec: any): { kgPerAcre: NpkSimple; kgPerHa: NpkSimple } {
  const zeros = { N: 0, P2O5: 0, K2O: 0 };

  if (!rec) return { kgPerAcre: zeros, kgPerHa: zeros };

  const simpleKeys = ["N", "P2O5", "K2O"];
  const isSimpleNumeric = simpleKeys.every((k) => typeof rec[k] === "number" || typeof rec[k] === "string");

  if (isSimpleNumeric) {
    // interpret as kg/ha
    const kgPerHa: NpkSimple = {
      N: Number(rec.N || 0),
      P2O5: Number(rec.P2O5 || 0),
      K2O: Number(rec.K2O || 0),
    };
    const kgPerAcre: NpkSimple = {
      N: +kgPerHaToKgPerAcre(kgPerHa.N).toFixed(6),
      P2O5: +kgPerHaToKgPerAcre(kgPerHa.P2O5).toFixed(6),
      K2O: +kgPerHaToKgPerAcre(kgPerHa.K2O).toFixed(6),
    };
    return { kgPerAcre, kgPerHa };
  }

  // unit-aware extractor
  const kgPerAcre: any = {};
  const kgPerHa: any = {};
  simpleKeys.forEach((k) => {
    const entry = rec[k];
    if (!entry) {
      kgPerAcre[k] = 0;
      kgPerHa[k] = 0;
      return;
    }
    if (typeof entry === "number") {
      // assume kg/acre if raw number (retain previous behavior)
      kgPerAcre[k] = entry;
      kgPerHa[k] = +kgPerAcreToKgPerHa(entry).toFixed(6);
      return;
    }
    const val = Number(entry.value ?? entry.v ?? 0);
    const mass_unit = entry.mass_unit ?? entry.mass ?? "kg";
    const area_unit = (entry.area_unit ?? entry.area ?? "").toLowerCase();

    const kgMass = kgToKg(val, mass_unit);
    let kgAcre = 0;
    if (area_unit.startsWith("acre")) {
      kgAcre = kgMass;
    } else if (area_unit.startsWith("ha")) {
      kgAcre = +(kgMass * HA_TO_ACRE);
    } else {
      // default to kg per acre if missing/ambiguous
      kgAcre = kgMass;
    }
    kgPerAcre[k] = +kgAcre.toFixed(6);
    kgPerHa[k] = +kgPerAcreToKgPerHa(kgAcre).toFixed(6);
  });
  return { kgPerAcre: kgPerAcre as NpkSimple, kgPerHa: kgPerHa as NpkSimple };
}

/* ------------------ component ------------------ */

export default function AIInsights({
  visible,
  stateData,
  sensorData,
}: {
  visible: boolean;
  stateData: string;
  sensorData: any;
}) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [npkValuesHa, setNpkValuesHa] = useState<NpkSimple | null>(null); // store kg/ha
  const [npkValuesAcre, setNpkValuesAcre] = useState<NpkSimple | null>(null); // store kg/acre
  const [timesPerHa, setTimesPerHa] = useState<any | null>(null);
  const [sending, setSending] = useState(false);

  async function fetchInsight() {
    setLoading(true);
    setError(null);
    setInsight(null);
    setNpkValuesHa(null);
    setTimesPerHa(null);

    try {
      const resp = await fetch("http://10.232.159.215:5000/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: stateData,
          sensor: sensorData,
          assumptions: {},
        }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        setError(json?.error || "Server error");
        setLoading(false);
        return;
      }

      const descriptive = json?.descriptive_recommendation ?? json?.descriptive_recommendation_text ?? null;
      setInsight(descriptive || "No recommendation returned.");

      const rec = json?.recommended_application_kg_per_ha ?? json?.computed?.recommended_application_kg_per_ha ?? json?.recommended;
      const extractorLike = json?.npk_extracted ?? json?.recommended_extracted ?? null;

      const normalized = normalizeRecommended(extractorLike ?? rec);

      // store both kg/ha and kg/acre
      setNpkValuesHa(normalized.kgPerHa);
      setNpkValuesAcre(normalized.kgPerAcre);

      // compute liters/time per nutrient based on kg/ha (correct)
      const perNut: any = {};
      (["N", "P2O5", "K2O"] as const).forEach((nut) => {
        const kgPerHa = normalized.kgPerHa[nut];
        const litersPerHa = litersNeededPerHaFromKgPerHa(kgPerHa, nut);
        const t = timeMinutesForFlowPerHa(litersPerHa, FLOW_RATE_LPM);

        // also compute per-acre equivalents for convenience
        const litersPerAcre = +(litersPerHa * HA_TO_ACRE).toFixed(6);
        const minutesPerAcre = +(t.minutes * HA_TO_ACRE).toFixed(4);
        perNut[nut] = {
          kg_per_ha: +kgPerHa.toFixed(6),
          kg_per_acre: +kgPerHaToKgPerAcre(kgPerHa).toFixed(6),
          liters_per_ha: litersPerHa,
          liters_per_acre: litersPerAcre,
          minutes_per_ha: t.minutes,
          minutes_per_acre: minutesPerAcre,
          seconds_per_m2: t.seconds_per_m2,
        };
      });
      setTimesPerHa(perNut);
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function onStartIrrigation() {
    if (!timesPerHa || !npkValuesHa) {
      Alert.alert("No timing calculated", "Please fetch recommendation first.");
      return;
    }

    // Build payload to send to Flask backend (which will forward to ESP)
      // Only send minutes per acre
  const payload = {
    timings: {
      N: timesPerHa.N.minutes_per_acre,
      P2O5: timesPerHa.P2O5.minutes_per_acre,
      K2O: timesPerHa.K2O.minutes_per_acre,
    }
  };

    setSending(true);
    try {
      const resp = await fetch("http://10.232.159.215:5000/start-irrigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await resp.json().catch(() => null);

      if (!resp.ok) {
        const msg = json?.error ?? `Server responded with ${resp.status}`;
        Alert.alert("Start failed", msg);
        setSending(false);
        return;
      }

      // assume backend returns something like { success: true, message: "dispatched to esp" }
      Alert.alert("Irrigation started", json?.message ?? "Command sent to controller.");
    } catch (err: any) {
      Alert.alert("Network error", err?.message ?? "Failed to reach controller.");
    } finally {
      setSending(false);
    }
  }

  if (!visible) return null;

  return (
    <View style={{ backgroundColor: "#F3E8FF", borderRadius: 20, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#5B21B6", marginBottom: 8 }}>AI Insights</Text>

      {loading ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text>AI is generating insights</Text>
          <ActivityIndicator size="small" color="#6D28D9" />
        </View>
      ) : error ? (
        <>
          <Text style={{ color: "#B91C1C", marginBottom: 8 }}>Error: {error}</Text>
          <TouchableOpacity onPress={fetchInsight} style={{ backgroundColor: "#6D28D9", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ color: "white" }}>Retry</Text>
          </TouchableOpacity>
        </>
      ) : insight ? (
        <>
          <Text style={{ color: "#4C1D95", marginBottom: 12 }}>{insight}</Text>

          {npkValuesHa && timesPerHa ? (
            <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 12 }}>
              <Text style={{ fontWeight: "600", marginBottom: 6 }}>Recommended application:</Text>
              <Text>— Per hectare: N {npkValuesHa.N} kg/ha, P₂O₅ {npkValuesHa.P2O5} kg/ha, K₂O {npkValuesHa.K2O} kg/ha</Text>
              <Text>— Per acre: N {npkValuesAcre?.N} kg/acre, P₂O₅ {npkValuesAcre?.P2O5} kg/acre, K₂O {npkValuesAcre?.K2O} kg/acre</Text>

              <View style={{ height: 8 }} />

              <Text style={{ fontWeight: "600", marginBottom: 6 }}>Solution & timing (flow: {FLOW_RATE_LPM} L/min):</Text>
              <Text>N: {timesPerHa.N.liters_per_ha} L/ha → {timesPerHa.N.minutes_per_ha} min/ha ({timesPerHa.N.minutes_per_acre} min/acre)</Text>
              <Text>P₂O₅: {timesPerHa.P2O5.liters_per_ha} L/ha → {timesPerHa.P2O5.minutes_per_ha} min/ha ({timesPerHa.P2O5.minutes_per_acre} min/acre)</Text>
              <Text>K₂O: {timesPerHa.K2O.liters_per_ha} L/ha → {timesPerHa.K2O.minutes_per_ha} min/ha ({timesPerHa.K2O.minutes_per_acre} min/acre)</Text>

              <View style={{ height: 12 }} />

              <TouchableOpacity onPress={onStartIrrigation} disabled={sending} style={{ backgroundColor: sending ? "#9F7AEA" : "#6D28D9", borderRadius: 12, padding: 10 }}>
                {sending ? <ActivityIndicator color="white" /> : <Text style={{ color: "white", textAlign: "center" }}>Start irrigation</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={fetchInsight} style={{ backgroundColor: "#6D28D9", borderRadius: 12, padding: 10 }}>
              <Text style={{ color: "white", textAlign: "center" }}>Fetch & compute timings</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Text style={{ color: "#5B21B6", marginBottom: 12 }}>Based on current sensors and weather, request an AI recommendation.</Text>
          <TouchableOpacity onPress={fetchInsight} style={{ backgroundColor: "#6D28D9", borderRadius: 12, padding: 10 }}>
            <Text style={{ color: "white", textAlign: "center" }}>Get Recommendation</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
