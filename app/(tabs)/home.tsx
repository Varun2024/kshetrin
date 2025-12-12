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
    Leaf,
    Search,
    RefreshCcwIcon
} from 'lucide-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import fetchWeatherData from '@/api/weather'
import MetricCard from '@/components/MetricCard';
import AIInsights from '@/components/AIInsights';
import { useNpk } from "@/context/DataContext";
const Home = () => {
    const router = useRouter();
    const [weatherData, setWeatherData] = React.useState<any[]>([]);
    const [selectedWeather, setSelectedWeather] = React.useState<any | null>(null); // <-- selected city
    const [showingAIInsight, setShowingAIInsight] = React.useState<boolean>(false);
    const { sensorData: globalSensorData } = useNpk();
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


    const handleSearch = (value: string) => {
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
    const handleSelectResult = (item: any) => {
        setSelectedWeather(item);     // set the selected item
        setWeatherData([]);          // hide the search list (optional)
        // optionally clear input if you track it
    };
    const dummyData = {
        N: { value: globalSensorData.n, unit: "mg_per_m2" },
        P2O5: { value: globalSensorData.p, unit: "mg_per_m2" },
        K2O: { value: globalSensorData.k, unit: "mg_per_m2" }
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
                    <View className="flex-row items-center justify-center gap-3">
                        <Search />
                        <TextInput
                            onChangeText={handleTextDebouce}
                            placeholderTextColor={'lightgray'}
                            placeholder="Search your city"
                            className="mb-4 py-4 border border-gray-300 rounded-lg w-full px-4 bg-white flex-1"
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

                    <View className='flex flex-row justify-between'>
                        <View className='mb-4'>
                            <Text className="text-2xl font-bold text-gray-900 mt-4">Sensor Metrics</Text>
                        </View>
                        {selectedWeather && (
                            <TouchableOpacity onPress={() => setShowingAIInsight(!showingAIInsight)} className='flex-row items-center justify-center mb-2 gap-4 bg-violet-100 px-3 py-1 rounded-2xl'>
                                <Text className="text-violet-600 text-sm">AI insights</Text>
                                <RefreshCcwIcon size={16} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* AI insight section */}

                    {showingAIInsight && (
                        <AIInsights visible={showingAIInsight} stateData={selectedWeather?.region.replace(/\s+/g, "_")} sensorData={dummyData} />
                    )}
                    {/* Sensor Cards */}
                    {selectedWeather ? (
                        <>
                            <MetricCard
                                title="Nitrogen"
                                value="24.5"
                                unit="gm/m²"
                                icon={<Thermometer color="#F59E0B" size={24} />}
                                bgColor="#FFF8E1" // Light Yellow
                                iconBgColor="#FFFFFF"
                                actionIcon={<Maximize2 color="#6B7280" size={16} />}
                                selectedWeather={selectedWeather}
                            />

                            <MetricCard
                                title="Phosphorus"
                                value="2.4"
                                unit="gm/m²"
                                icon={<Zap color="#10B981" size={24} />}
                                bgColor="#E8F5E9"
                                iconBgColor="#FFFFFF"
                                actionIcon={<ArrowRight color="#6B7280" size={16} />}
                                selectedWeather={selectedWeather}
                            />

                            <MetricCard
                                title="Potassium"
                                value="78"
                                unit="gm/m²"
                                icon={<Layers color="#8D6E63" size={24} />}
                                bgColor="#F5EFE6"
                                iconBgColor="#FFFFFF"
                                actionIcon={<Maximize2 color="#6B7280" size={16} />}
                                selectedWeather={selectedWeather}
                            />
                        </>
                    ) : (
                        <Text className="text-gray-200 mb-4 bg-gray-400 px-4 py-6 rounded-2xl">Select a city to view sensor metrics.</Text>
                    )}




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



const ReadingRow = ({ time, temp, cond, moist }: { time: string; temp: string; cond: string; moist: string }) => (
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
