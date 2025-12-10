import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Image
} from 'react-native';
import {
    Bell,
    Sun,
    Thermometer,
    Zap,
    Layers,
    Droplets,
    Maximize2,
    ArrowRight,
    MapPin,
    Menu,
    Leaf
} from 'lucide-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import fetchWeatherData from '@/api/weather'

const Home = () => {
    const router = useRouter();
    const [weatherData, setWeatherData] = React.useState<any[]>([]);
    const [selectedWeather, setSelectedWeather] = React.useState<any | null>(null); // <-- selected city
    const normalizeWeather = (apiData: any) => {
        if (!apiData?.location) return null;
        const icon = apiData.current?.condition?.icon ?? '';
        const safeIcon = icon.startsWith('//') ? `https:${icon}` : icon;
        return {
            name: apiData.location.name,
            region: apiData.location.region,
            country: apiData.location.country,
            temp_c: apiData.current?.temp_c ?? null,
            condition: apiData.current?.condition?.text ?? '',
            icon: safeIcon,
            raw: apiData,
        };
    };
    const rice_npk_by_state: Record<string, Record<string, number[]>> = {
        "Punjab": { "Nitrogen": [45, 55], "Phosphorus": [20, 25], "Potassium": [20, 25] },
        "West_Bengal": { "Nitrogen": [40, 50], "Phosphorus": [15, 20], "Potassium": [20, 25] },
        "Uttar_Pradesh": { "Nitrogen": [35, 45], "Phosphorus": [15, 20], "Potassium": [15, 20] },
        "Andhra_Pradesh": { "Nitrogen": [40, 50], "Phosphorus": [20, 25], "Potassium": [20, 25] },
        "Odisha": { "Nitrogen": [35, 45], "Phosphorus": [15, 20], "Potassium": [15, 20] },
        "Bihar": { "Nitrogen": [40, 50], "Phosphorus": [20, 25], "Potassium": [15, 20] }
    }

    const handleSearch = (value) => {
        if (!value || value.length <= 2) {
            // clear results when query too short
            setWeatherData([]);
            return;
        }

        fetchWeatherData({ cityName: value })
            .then((data) => {
                // console.log("API response:", data);
                const item = normalizeWeather(data);
                if (!item) return;
                setWeatherData(prev => {
                    // avoid duplicates by name
                    const exists = prev.some(p => p.name.toLowerCase() === item.name.toLowerCase());
                    return exists ? prev : [...prev, item];
                });
            })
            .catch(err => console.error(err));
    };

    const handleTextDebouce = React.useCallback(debounce(handleSearch, 500), []);

    // when a result is tapped:
    const handleSelectResult = (item) => {
        setSelectedWeather(item);     // set the selected item
        setWeatherData([]);          // hide the search list (optional)
        // optionally clear input if you track it
    };

    const MetricCard = ({ title, value, unit, icon, bgColor, iconBgColor, actionIcon }: { title: string; value: string; unit: string; icon: React.ReactNode; bgColor: string; iconBgColor: string; actionIcon: React.ReactNode }) => {
        const [clicked, setClicked] = React.useState(false);
        const [fetchedValue, setFetchedValue] = React.useState<string | null>(null);
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState<string | null>(null);

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
                } catch (e) {
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
                <View className="mt-3">
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


    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-[#F8F9FA]">
                <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

                <ScrollView
                    contentContainerClassName="p-4"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View className="flex-row gap-4 items-center justify-between mb-6 bg-green-400 p-5 rounded-3xl ">
                        {/* <Menu size={24} /> */}
                        <View className="flex-1 px-3">
                            <Text className="text-2xl font-bold text-gray-900 flex-row items-center">Farm Overview <Leaf size={18} color={'green'} /></Text>
                            <Text className="text-sm text-gray-500 mt-1">Monitor your agricultural sensors</Text>
                        </View>

                        <View className="items-end gap-2">
                            <TouchableOpacity className="p-1">
                                <Bell color="#333" size={22} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Weather Search Input */}
                    <View>
                        <TextInput
                            onChangeText={handleTextDebouce}
                            placeholderTextColor={'lightgray'}
                            placeholder="Search your city"
                            className="mb-4 py-4 border border-gray-300 rounded-lg "
                        />
                    </View>

                    {/* Search results list (visible only when weatherData has items) */}
                    {Array.isArray(weatherData) && weatherData.length > 0 && (
                        <View className="relative w-full bg-gray-200/60 gap-4 rounded-3xl p-5 mb-2 flex-col justify-between items-start z-10">
                            {weatherData.filter(Boolean).map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={item?.name + index}
                                        className={`flex-row items-center gap-3 py-2 w-full ${index < weatherData.length - 1 ? 'border-b border-gray-300' : ''}`}
                                        onPress={() => handleSelectResult(item)} // <-- select handler
                                    >
                                        <MapPin color="#333" size={22} />

                                        <View style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                                            <Text className="text-sm ">
                                                {item?.name},{item?.region}{" "}
                                            </Text>
                                            <Text className="text-xs text-gray-500">
                                                City in {item?.country}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Weather Card — now uses selectedWeather if available */}
                    <View className="bg-[#D6E6F2] rounded-3xl p-4 flex-row justify-between items-center mb-4">
                        <View className="flex-1 flex-row items-center gap-2">
                            <View>
                                {/* show icon if selectedWeather exists, otherwise sun icon */}
                                {selectedWeather?.icon ? (
                                    <Image
                                        source={{ uri: selectedWeather.icon }}
                                        style={{ width: 50, height: 60 }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Sun color="#FDB813" size={40} fill="#FDB813" />
                                )}
                            </View>

                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-slate-800">
                                    {selectedWeather ? `${selectedWeather.name}, ${selectedWeather.region}` : "Today's Weather"}
                                </Text>

                                <Text className="text-xs text-slate-600 mt-0.5">
                                    {selectedWeather ? `${selectedWeather.condition} • ${selectedWeather.temp_c}°C` : 'Search for a city to get started!'}
                                </Text>
                            </View>
                        </View>

                        <View className="items-end">
                            <Text className="text-2xl font-bold text-slate-800">
                                {selectedWeather ? `${selectedWeather.temp_c}°C` : 'Search for city '}
                            </Text>
                            <Text className="text-xs text-slate-600">
                                {selectedWeather ? `Feels like ${Math.round((selectedWeather.temp_c ?? 0) + 1)}°C` : 'and find out!'}
                            </Text>
                        </View>
                    </View>

                    <View className='mb-4'>
                        <Text className="text-2xl font-bold text-gray-900 mt-4">Sensor Metrics</Text>
                    </View>
                    {/* Sensor Cards */}
                    <MetricCard
                        title="Nitrogen"
                        value="24.5"
                        unit="°C"
                        icon={<Thermometer color="#F59E0B" size={24} />}
                        bgColor="#FFF8E1" // Light Yellow
                        iconBgColor="#FFFFFF"
                        actionIcon={<Maximize2 color="#6B7280" size={16} />}
                    />

                    <MetricCard
                        title="Phosphorus"
                        value="2.4"
                        unit="mS/cm"
                        icon={<Zap color="#10B981" size={24} />}
                        bgColor="#E8F5E9"
                        iconBgColor="#FFFFFF"
                        actionIcon={<ArrowRight color="#6B7280" size={16} />}
                    />

                    <MetricCard
                        title="Potassium"
                        value="78"
                        unit="%"
                        icon={<Layers color="#8D6E63" size={24} />}
                        bgColor="#F5EFE6"
                        iconBgColor="#FFFFFF"
                        actionIcon={<Maximize2 color="#6B7280" size={16} />}
                    />


                    {/* <MetricCard
                        title="Moisture Level"
                        value="65"
                        unit="%"
                        icon={<Droplets color="#3B82F6" size={24} />}
                        bgColor="#F0F9FF"
                        iconBgColor="#FFFFFF"
                        actionIcon={<Maximize2 color="#6B7280" size={16} />}
                    /> */}


                    {/* Recent Readings Section */}
                    <View className="mt-4 mb-4">
                        <Text className="text-xl font-bold text-gray-900">Recent Readings</Text>
                        <Text className="text-sm text-gray-500 mt-1">Latest sensor data from your farm</Text>
                    </View>

                    <View>
                        <TouchableOpacity onPress={() => router.push('/welcome')}>
                            <Text className="text-green-600 text-sm mb-4">Back to Dashboard</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="gap-3">
                        <ReadingRow
                            time="2 mins ago"
                            temp="24.5°C"
                            cond="2.4 mS/cm"
                            moist="65%"
                        />
                        <ReadingRow
                            time="5 mins ago"
                            temp="24.3°C"
                            cond="2.5 mS/cm"
                            moist="64%"
                        />
                        <ReadingRow
                            time="8 mins ago"
                            temp="24.1°C"
                            cond="2.3 mS/cm"
                            moist="66%"
                        />
                    </View>

                    {/* Bottom spacing */}
                    <View className="h-10" />
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};



const ReadingRow = ({ time, temp, cond, moist }) => (
    <View className="bg-white rounded-xl p-4 flex-row items-center justify-between">
        <View className="w-1/4">
            <Text className="text-xs text-gray-500 leading-5">{time}</Text>
        </View>

        <View className="flex-1 flex-row justify-between items-center pl-3">
            <View className="flex-row items-center">
                <Thermometer size={14} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text className="text-sm font-medium text-gray-700">{temp}</Text>
            </View>

            <View className="flex-row items-center">
                <Zap size={14} color="#10B981" style={{ marginRight: 4 }} />
                <Text className="text-sm font-medium text-gray-700">{cond.split(' ')[0]}</Text>
            </View>

            <View className="flex-row items-center">
                <Droplets size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                <Text className="text-sm font-medium text-gray-700">{moist}</Text>
            </View>
        </View>
    </View>
);

export default Home;
