/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';





const MetricCard = ({ title, value, unit, icon, bgColor, iconBgColor, actionIcon ,selectedWeather}: { title: string; value: string; unit: string; icon: React.ReactNode; bgColor: string; iconBgColor: string; actionIcon: React.ReactNode , selectedWeather: any }) => {
    const [clicked, setClicked] = React.useState(false);
    const [fetchedValue, setFetchedValue] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const rice_npk_by_state: Record<string, Record<string, number[]>> = {
        "Punjab": { "Nitrogen": [45, 55], "Phosphorus": [20, 25], "Potassium": [20, 25] },
        "West_Bengal": { "Nitrogen": [40, 50], "Phosphorus": [15, 20], "Potassium": [20, 25] },
        "Uttar_Pradesh": { "Nitrogen": [35, 45], "Phosphorus": [15, 20], "Potassium": [15, 20] },
        "Andhra_Pradesh": { "Nitrogen": [40, 50], "Phosphorus": [20, 25], "Potassium": [20, 25] },
        "Odisha": { "Nitrogen": [35, 45], "Phosphorus": [15, 20], "Potassium": [15, 20] },
        "Bihar": { "Nitrogen": [40, 50], "Phosphorus": [20, 25], "Potassium": [15, 20] }
    }
    // compute key as a plain string that matches rice_npk_by_state keys (e.g. "Punjab" or "West_Bengal")
    const key = selectedWeather?.region ? selectedWeather.region.replace(/\s+/g, "_") : undefined;

    // Map card title to expected metric key in the device payload
    const metricKeyMap: Record<string, string> = {
        "Nitrogen": "n",
        "Phosphorus": "p",
        "Potassium": "k"
    };

    // Change this to your backend address if needed
    const BACKEND_URL = "http://192.168.43.92:5000/read-now";

    // helper to parse string-style payloads like "n: 12|p: 8|k: 150"
    const parseStringPayload = (s: string) => {
        const out: Record<string, number | null> = { n: null, p: null, k: null };
        if (typeof s !== "string") return out;

        // split on pipe or semicolon or whitespace+pipe variants
        const parts = s.split(/[|;]+/);
        for (let part of parts) {
            part = part.trim();
            // match patterns like "n: 12", "p=8", "k :150"
            const m = part.match(/([npk]|nitrogen|phosphorus|potassium)\s*[:=]\s*([+-]?\d+(\.\d+)?)/i);
            if (m) {
                const rawKey = m[1].toLowerCase();
                const num = Number(m[2]);
                if (isNaN(num)) continue;
                if (rawKey.startsWith("n")) out.n = num;
                else if (rawKey.startsWith("p")) out.p = num;
                else if (rawKey.startsWith("k")) out.k = num
            }
        }
        return out;
    };

    // normalize payload into { n, p, k } or nulls
    const normalizePayload = (payload: any) => {
        if (!payload && payload !== "") return { n: null, p: null, k: null };

        // if it's an object with n,p,k
        if (typeof payload === "object") {
            const n = payload.n ?? payload.N ?? payload.nitrogen ?? null;
            const p = payload.p ?? payload.P ?? payload.phosphorus ?? null;
            const k = payload.k ?? payload.K ?? payload.potassium ?? null;
            return {
                n: n === null || n === undefined ? null : Number(n),
                p: p === null || p === undefined ? null : Number(p),
                k: k === null || k === undefined ? null : Number(k),
            };
        }

        // if it's a string, try parse
        if (typeof payload === "string") {
            // try JSON first (in case backend returned JSON as string)
            try {
                const parsed = JSON.parse(payload);
                if (typeof parsed === "object") return normalizePayload(parsed);
            } catch (e: any) {
                // not JSON, fall through to string parsing

            }
            return parseStringPayload(payload);
        }

        // other types -> nulls
        return { n: null, p: null, k: null };
    };

    // Fetch latest reading from the backend and extract the metric for this card
    const fetchMetric = React.useCallback(async (signal?: AbortSignal) => {
        // if (!selectedWeather) return; // only fetch when user selects a city (as you used before)

        setLoading(true);
        setError(null);

        try {
            console.log("[MetricCard] fetching from:", BACKEND_URL);
            const resp = await fetch(BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ device_id: "esp32-01" }),
                signal,
            });

            console.log("[MetricCard] fetch status:", resp.status);

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "<no body>");
                throw new Error(`backend error ${resp.status}: ${txt}`);
            }

            // backend might return json or text
            let json: any;
            try {
                json = await resp.json();
            } catch (e) {
                // not JSON — try text
                const txt = await resp.text().catch(() => "");
                json = txt;
            }
            console.log("[MetricCard] backend response:", json);

            // The backend wrapper used earlier puts device payload inside json.payload
            const rawPayload = (json && typeof json === "object" && json.payload !== undefined) ? json.payload : json;

            const norm = normalizePayload(rawPayload);
            console.log("[MetricCard] normalized payload:", norm)

            const metricKey = metricKeyMap[title] ?? null;
            let val: number | null = null;
            if (metricKey === "n") val = norm.n;
            else if (metricKey === "p") val = norm.p;
            else if (metricKey === "k") val = norm.k;

            if (val !== null && val !== undefined && !isNaN(val)) {
                // show integer if it's integral, otherwise keep decimal
                setFetchedValue(Number.isInteger(val) ? String(val) : String(val));
            } else {
                setFetchedValue(null);
                setError("metric not found in payload");
            }
        } catch (err: any) {
            console.error("[MetricCard] fetch error:", err);
            if (err.name === "AbortError") {
                // ignore
            } else {
                setError(err.message ?? "fetch failed");
                setFetchedValue(null);
            }
        } finally {
            setLoading(false);
        }
    }, [selectedWeather, title]);

    // Fetch when selectedWeather changes
    React.useEffect(() => {
        const controller = new AbortController();
        // optionally refresh periodically (uncomment to enable)
        fetchMetric(controller.signal);
        return () => {
            controller.abort()
        };
    }, [fetchMetric]);

    // Show prop value unless we have a fetchedValue
    const displayValue = fetchedValue ?? value;

    return (
        <View
            className="rounded-3xl p-5 mb-4 min-h-[140px] justify-between"
            style={{ backgroundColor: bgColor }}
        >
            <View className="flex-row justify-between items-start">
                <View
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: iconBgColor }}
                >
                    {icon}
                </View>
                <TouchableOpacity className="p-2 w-8 h-8" onPress={() => setClicked(!clicked)}>
                    {actionIcon}
                </TouchableOpacity>
            </View>
            <View className="mt-3 flex flex-row items-end justify-between">
                <Text className="text-base font-semibold text-gray-500 mb-1">{title}</Text>
                <View className="flex-row items-baseline">
                    <Text className="text-3xl font-bold text-gray-800 mr-1">
                        {loading ? "…" : (error ? "-" : displayValue)}
                    </Text>
                    <Text className="text-base font-medium text-gray-500 ">{unit}</Text>
                </View>
                {error ? (
                    <Text className="text-xs text-red-500 mt-1">{error}</Text>
                ) : null}
            </View>
            <View className="flex-col items-start mt-2 ">
                {clicked && key && rice_npk_by_state[key] && rice_npk_by_state[key][title] ? (
                    <>
                        <Text className=" text-gray-800 text-lg font-semibold">
                            Recommended {title} for {selectedWeather.region}:
                        </Text>
                        <Text className=" text-gray-600">
                            {rice_npk_by_state[key][title].join('-')} kg/ha
                        </Text>
                    </>
                ) : null}
            </View>
        </View>
    );
};

export default MetricCard;