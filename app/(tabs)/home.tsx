

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
    Menu
} from 'lucide-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import fetchWeatherData from '@/api/weather'

const Home = () => {
    const router = useRouter();
    const [weatherData, setWeatherData] = React.useState([]);
    const [selectedWeather, setSelectedWeather] = React.useState(null); // <-- selected city
    const normalizeWeather = (apiData) => {
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

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-[#F8F9FA]">
                <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

                <ScrollView
                    contentContainerClassName="p-4"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View className="flex-row gap-4 items-center justify-between mb-6">
                        <Menu size={24} />
                        <View className="flex-1 px-3">
                            <Text className="text-2xl font-bold text-gray-900 mt-5">Farm Overview</Text>
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
                            className="mb-4 p-2 border border-gray-300 rounded" />
                    </View>

                    {/* Search results list (visible only when weatherData has items) */}
                    {Array.isArray(weatherData) && weatherData.length > 0 && (
                        <View className="relative w-full bg-gray-200/60 gap-5 rounded-3xl p-5 mb-2 flex-col justify-between items-start z-10">
                            {weatherData.filter(Boolean).map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={item?.name + index}
                                        className={`flex-row items-center gap-3 pb-3 mb-3`}
                                        onPress={() => handleSelectResult(item)} // <-- select handler
                                    >
                                        <MapPin color="#333" size={22} />

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text className="text-base font-semibold ">
                                                {item?.name}, {item?.country}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Weather Card — now uses selectedWeather if available */}
                    <View className="bg-[#D6E6F2] rounded-3xl p-5 flex-row justify-between items-center mb-4">
                        <View className="flex-1 flex-row items-center gap-3">
                            <View>
                                {/* show icon if selectedWeather exists, otherwise sun icon */}
                                {selectedWeather?.icon ? (
                                    <Image
                                        source={{ uri: selectedWeather.icon }}
                                        style={{ width: 40, height: 40 }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Sun color="#FDB813" size={40} fill="#FDB813" />
                                )}
                            </View>

                            <View className="flex-1">
                                <Text className="text-base font-semibold text-slate-800">
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

                    {/* Sensor Cards */}
                    <MetricCard
                        title="Soil Temperature"
                        value="24.5"
                        unit="°C"
                        icon={<Thermometer color="#F59E0B" size={24} />}
                        bgColor="#FFF8E1" // Light Yellow
                        iconBgColor="#FFFFFF"
                        actionIcon={<Maximize2 color="#6B7280" size={16} />}
                    />

                    <MetricCard
                        title="Conductivity"
                        value="2.4"
                        unit="mS/cm"
                        icon={<Zap color="#10B981" size={24} />}
                        bgColor="#E8F5E9"
                        iconBgColor="#FFFFFF"
                        actionIcon={<ArrowRight color="#6B7280" size={16} />}
                    />

                    <MetricCard
                        title="Soil Content"
                        value="78"
                        unit="%"
                        icon={<Layers color="#8D6E63" size={24} />}
                        bgColor="#F5EFE6"
                        iconBgColor="#FFFFFF"
                        actionIcon={<Maximize2 color="#6B7280" size={16} />}
                    />

                    <MetricCard
                        title="Moisture Level"
                        value="65"
                        unit="%"
                        icon={<Droplets color="#3B82F6" size={24} />}
                        bgColor="#F0F9FF"
                        iconBgColor="#FFFFFF"
                        actionIcon={<Maximize2 color="#6B7280" size={16} />}
                    />

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

// MetricCard + ReadingRow remain unchanged
const MetricCard = ({ title, value, unit, icon, bgColor, iconBgColor, actionIcon }) => (
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
            <TouchableOpacity>
                {actionIcon}
            </TouchableOpacity>
        </View>
        <View className="mt-3">
            <Text className="text-base font-semibold text-gray-500 mb-1">{title}</Text>
            <View className="flex-row items-baseline">
                <Text className="text-3xl font-bold text-gray-800 mr-1">{value}</Text>
                <Text className="text-base font-medium text-gray-500">{unit}</Text>
            </View>
        </View>
    </View>
);

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
