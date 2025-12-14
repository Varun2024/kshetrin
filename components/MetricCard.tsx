

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNpk } from '@/context/DataContext';
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';

const MetricCard = ({ title, value, unit, icon, bgColor, iconBgColor, actionIcon, selectedWeather }: { title: string; value: string; unit: string; icon: React.ReactNode; bgColor: string; iconBgColor: string; actionIcon: React.ReactNode, selectedWeather: any }) => {
    const [clicked, setClicked] = React.useState(false);
    const [fetchedValue, setFetchedValue] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { setSensorData } = useNpk() as { setSensorData?: (value: string) => void };

    // store main-device npk (from read-now)
    const [latestNpk, setLatestNpk] = React.useState<{ n: number | null; p: number | null; k: number | null } | null>(null);

    // NEW: store slave's npk reading (what you want to fetch & render)
    const [latestNpkSlave, setLatestNpkSlave] = React.useState<{ n: number | null; p: number | null; k: number | null } | null>(null);
    const [fetchingSlave, setFetchingSlave] = React.useState(false);
    const [slaveError, setSlaveError] = React.useState<string | null>(null);

    const rice_npk_by_state: Record<string, Record<string, number[]>> = {
        /* ... same mapping ... */
        "Punjab": { "N": [9.64, 14.83], "P2O5": [3.86, 5.93], "K2O": [1.93, 2.97] },
        "Haryana": { "N": [9.64, 14.83], "P2O5": [3.86, 5.93], "K2O": [1.93, 2.97] },
        "Uttar Pradesh": { "N": [9.80, 15.08], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Madhya Pradesh": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Rajasthan": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Bihar": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Gujarat": { "N": [6.42, 9.88], "P2O5": [3.21, 4.94], "K2O": [3.21, 4.94] },
        "Maharashtra": { "N": [6.42, 9.88], "P2O5": [3.21, 4.94], "K2O": [2.57, 3.95] },
        "West Bengal": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Uttarakhand": { "N": [9.80, 15.08], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Jammu Kashmir": { "N": [6.42, 9.88], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Himachal Pradesh": { "N": [6.42, 9.88], "P2O5": [3.21, 4.94], "K2O": [3.21, 4.94] },
        "Chhattisgarh": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Jharkhand": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Assam": { "N": [5.14, 7.90], "P2O5": [2.57, 3.96], "K2O": [2.57, 3.95] },
        "Odisha": { "N": [5.14, 7.90], "P2O5": [2.57, 3.96], "K2O": [2.57, 3.95] },
        "Karnataka": { "N": [6.42, 9.88], "P2O5": [3.21, 4.94], "K2O": [2.57, 3.95] },
        "Tamil Nadu": { "N": [6.42, 9.88], "P2O5": [3.21, 4.94], "K2O": [2.57, 3.95] },
        "Andhra Pradesh": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] },
        "Telangana": { "N": [7.87, 12.11], "P2O5": [3.86, 5.93], "K2O": [2.57, 3.95] }
    }
    const key = selectedWeather?.region ? selectedWeather.region.replace(/\s+/g, "_") : undefined;

    const metricKeyMap: Record<string, string> = {
        "Nitrogen": "n",
        "Phosphorus": "p",
        "Potassium": "k"
    };

    const BACKEND_URL = "http://10.232.159.215:5000/read-now";

    // <-- ADJUST THIS to the slave's read endpoint.
    // It might be GET http://10.232.159.232/read or POST http://10.232.159.232/read with a body.
    const SLAVE_NPK_URL = "http://10.232.159.215:5000/read-now-slave"; // example

    // helper to parse string-style payloads like "n: 12|p: 8|k: 150"
    const parseStringPayload = (s: string) => {
        const out: Record<string, number | null> = { n: null, p: null, k: null };
        if (typeof s !== "string") return out;

        const parts = s.split(/[|;]+/);
        for (let part of parts) {
            part = part.trim();
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

    const normalizePayload = (payload: any) => {
        if (!payload && payload !== "") return { n: null, p: null, k: null };

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

        if (typeof payload === "string") {
            try {
                const parsed = JSON.parse(payload);
                if (typeof parsed === "object") return normalizePayload(parsed);
            } catch (e: any) { }
            return parseStringPayload(payload);
        }

        return { n: null, p: null, k: null };
    };

    // const SLAVE_NPK_URL = `${BACKEND_BASE}/read-now-slave`; // frontend calls your Flask wrapper

    // Fetch NPK from the slave stick via your Flask wrapper and store for rendering
    const fetchSlaveNpk = React.useCallback(async () => {
        setFetchingSlave(true);
        setSlaveError(null);
        try {
            // call the Flask wrapper which will call the actual slave device
            const resp = await fetch(SLAVE_NPK_URL, {
                method: "POST", // your endpoint expects POST with JSON body
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ device_id: "esp32-01" }), // change device_id if needed
            });

            // handle HTTP-level errors from Flask quickly
            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(`wrapper error ${resp.status}: ${txt}`);
            }

            // parse wrapper response
            let json: any;
            try {
                json = await resp.json();
            } catch (e) {
                // if not JSON, treat as text
                const txt = await resp.text().catch(() => "");
                throw new Error(`invalid wrapper response: ${txt}`);
            }

            // wrapper returns errors like { error: "device timeout" } or success { ts, device_id, payload }
            if (json.error) {
                throw new Error(json.error + (json.detail ? `: ${json.detail}` : ""));
            }

            // Accept both shapes: { ts, device_id, payload } or direct device object
            const rawPayload = (json && typeof json === "object" && json.payload !== undefined) ? json.payload : json;

            // Normalize with existing helper (handles strings like "n:12|p:3|k:5")
            const norm = normalizePayload(rawPayload);
            setLatestNpkSlave({ n: norm.n, p: norm.p, k: norm.k });
        } catch (err: any) {
            console.error("[MetricCard] fetchSlaveNpk error:", err);
            // expose meaningful message to user
            const message = err?.message ?? "failed to fetch slave";
            setSlaveError(message);
            setLatestNpkSlave(null);
        } finally {
            setFetchingSlave(false);
        }
    }, [/* no dependencies needed */]);

    // Fetch latest reading from the backend and extract the metric for this card
    const fetchMetric = React.useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);

        try {
            const resp = await fetch(BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ device_id: "esp32-01" }),
                signal,
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "<no body>");
                throw new Error(`backend error ${resp.status}: ${txt}`);
            }

            let json: any;
            try {
                json = await resp.json();
            } catch (e) {
                const txt = await resp.text().catch(() => "");
                json = txt;
            }

            const rawPayload = (json && typeof json === "object" && json.payload !== undefined) ? json.payload : json;
            const norm = normalizePayload(rawPayload);

            // store main-device npk
            setLatestNpk({ n: norm.n, p: norm.p, k: norm.k });

            const metricKey = metricKeyMap[title] ?? null;
            let val: number | null = null;
            if (metricKey === "n") val = norm.n;
            else if (metricKey === "p") val = norm.p;
            else if (metricKey === "k") val = norm.k;

            if (val !== null && val !== undefined && !isNaN(val)) {
                setFetchedValue(Number.isInteger(val) ? String(val) : String(val));
                if (typeof setSensorData === "function") {
                    setSensorData(Number.isInteger(val) ? String(val) : String(val));
                }
            } else {
                setFetchedValue(null);
                setError("metric not found in payload");
            }
        } catch (err: any) {
            console.error("[MetricCard] fetch error:", err);
            if (err.name === "AbortError") {
            } else {
                setError(err.message ?? "fetch failed");
                setFetchedValue(null);
            }
        } finally {
            setLoading(false);
        }
    }, [selectedWeather, title]);


    React.useEffect(() => {
        const controller = new AbortController();
        fetchMetric(controller.signal);
        return () => {
            controller.abort()
        };
    }, [selectedWeather, fetchMetric]);



    const displayValue = fetchedValue ?? value;

    return (
        <View
            className="rounded-3xl p-5 mb-4 min-h-[140px] justify-between"
            style={{ backgroundColor: bgColor }}
        >
            <TouchableOpacity onPress={()=>fetchMetric()} className='bg-yellow-100 text-yellow-200 px-3 py-1 rounded-full self-end mb-2'>
                <Text >
                    Refresh

                </Text>
            </TouchableOpacity>

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

            {/* Slave read UI */}
            <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "600" }}>Slave NPK</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                            onPress={fetchSlaveNpk}
                            disabled={fetchingSlave}
                            style={{
                                backgroundColor: fetchingSlave ? "#ddd" : "#60A5FA",
                                paddingVertical: 6,
                                paddingHorizontal: 10,
                                borderRadius: 8,
                                alignSelf: "flex-start",
                            }}
                        >
                            {/* <Text style={{ color: fetchingSlave ? "#666" : "#fff", fontWeight: "600" }}>
                                {fetchingSlave ? "Refreshing..." : "Refresh Slave"}
                            </Text> */}
                        </TouchableOpacity>
                    </View>
                </View>

                {slaveError ? (
                    <Text style={{ color: "red", marginTop: 6, fontSize: 12 }}>{slaveError}</Text>
                ) : latestNpkSlave ? (
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ fontSize: 14 }}>N: {latestNpkSlave.n ?? "-"}</Text>
                        <Text style={{ fontSize: 14 }}>P: {latestNpkSlave.p ?? "-"}</Text>
                        <Text style={{ fontSize: 14 }}>K: {latestNpkSlave.k ?? "-"}</Text>
                    </View>
                ) : (
                    <Text style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>No slave data yet</Text>
                )}
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
