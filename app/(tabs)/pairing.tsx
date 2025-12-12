import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {
  Sprout,
  Timer,
  SunMedium,
  CloudRain,
  Wheat,
  Info,
  CalendarClock,
  Leaf,
  Bug,
  AlertTriangle,
  Stethoscope,
  ShieldAlert,
  Droplets
} from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- Data Model ---
const CROP_DATA = [
  {
    id: 'rice',
    name: 'Rice / Paddy',
    shortName: 'Rice',
    themeColor: 'bg-emerald-600',
    lightThemeColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    icon: <Sprout color="white" size={20} />,
    totalDuration: '120-150 Days',
    stages: [
      {
        title: 'Germination & Seedling',
        duration: 'Day 0 - 20',
        details: 'Seeds sprout in the nursery bed. Requires consistent moisture but not deep flooding. Tiny leaves emerge.',
        icon: Sprout,
      },
      {
        title: 'Tillering Phase',
        duration: 'Day 20 - 60',
        details: 'After transplanting, the main stem develops side shoots (tillers). Rapid green growth occurs.',
        icon: Leaf,
      },
      {
        title: 'Panicle Initiation',
        duration: 'Day 60 - 90',
        details: 'The reproductive phase begins. The developing grain head (panicle) bulges inside the upper leaf sheath.',
        icon: CloudRain,
      },
      {
        title: 'Flowering',
        duration: 'Day 90 - 105',
        details: 'The panicle emerges fully. Small flowers open. Very sensitive to water stress.',
        icon: SunMedium,
      },
      {
        title: 'Ripening',
        duration: 'Day 105 - 135+',
        details: 'Grains fill with starch and turn golden yellow. Grains harden. Ready for harvest.',
        icon: Wheat,
      },
    ],
    diseases: [
      {
        name: 'Rice Blast',
        severity: 'High',
        symptoms: 'Diamond-shaped white/gray lesions with reddish borders on leaves.',
        treatment: 'Use Tricyclazole 75 WP. Avoid excessive nitrogen fertilizer.',
      },
      {
        name: 'Bacterial Leaf Blight',
        severity: 'High',
        symptoms: 'Water-soaked streaks on leaf edges turning yellow/orange and drying up.',
        treatment: 'Drain water from field. Spray Streptocycline + Copper Oxychloride.',
      },
      {
        name: 'Brown Spot',
        severity: 'Medium',
        symptoms: 'Oval, dark brown spots on leaves resembling sesame seeds.',
        treatment: 'Seed treatment with Carbendazim. Maintain proper potash levels.',
      },
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat',
    shortName: 'Wheat',
    themeColor: 'bg-amber-500',
    lightThemeColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: <Wheat color="white" size={20} />,
    totalDuration: '110-130 Days',
    stages: [
      {
        title: 'Germination',
        duration: 'Day 0 - 15',
        details: 'Seed absorbs water, swells, and the first root and shoot emerge.',
        icon: Sprout,
      },
      {
        title: 'Tillering',
        duration: 'Day 15 - 45',
        details: 'Critical stage where secondary stems (tillers) form. Crown roots develop.',
        icon: Leaf,
      },
      {
        title: 'Jointing',
        duration: 'Day 45 - 75',
        details: 'Stem elongation begins. Nodes become visible above ground.',
        icon: Timer,
      },
      {
        title: 'Flowering',
        duration: 'Day 75 - 95',
        details: 'The wheat spike (head) emerges. Pollination occurs rapidly.',
        icon: SunMedium,
      },
      {
        title: 'Ripening',
        duration: 'Day 95 - 125+',
        details: 'Kernels fill with starch. Plant turns straw-colored and dries down.',
        icon: Wheat,
      },
    ],
    diseases: [
      {
        name: 'Yellow Rust',
        severity: 'High',
        symptoms: 'Yellow pustules arranged in stripes on leaves. "Yellow powder" appears.',
        treatment: 'Spray Propiconazole or Tebuconazole immediately upon spotting.',
      },
      {
        name: 'Loose Smut',
        severity: 'Medium',
        symptoms: 'Heads turn into black powdery mass instead of grains.',
        treatment: 'Seed treatment with Carboxin or Carbendazim is essential before sowing.',
      },
      {
        name: 'Powdery Mildew',
        severity: 'Low',
        symptoms: 'White powdery growth on leaves and stems.',
        treatment: 'Avoid dense sowing. Spray wettable sulphur if severe.',
      },
    ]
  },
];

const CropGrowthScreen = () => {
  const [selectedCrop, setSelectedCrop] = useState(CROP_DATA[0]);
  const [viewMode, setViewMode] = useState('stages'); // 'stages' or 'diseases'

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        {/* Header */}
        <View className="p-5 bg-white pb-2">
          <Text className="text-2xl font-bold text-slate-800 mt-8">Crop Insights</Text>
          <Text className="text-slate-500 text-sm">Growth guide & disease management</Text>
        </View>

        {/* Unified Crop & Disease Selector */}
        <View className="bg-white px-5 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 pt-4">
            {CROP_DATA.map((crop) => {
              const isCropActive = selectedCrop.id === crop.id;
              const isStagesActive = isCropActive && viewMode === 'stages';
              const isDiseasesActive = isCropActive && viewMode === 'diseases';

              return (
                <React.Fragment key={crop.id}>
                  {/* 1. Crop Growth Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCrop(crop);
                      setViewMode('stages');
                    }}
                    className={`flex-row items-center py-2.5 px-4 rounded-full border ${isStagesActive
                        ? `${crop.themeColor} border-transparent`
                        : 'bg-slate-100 border-slate-200'
                      }`}
                  >
                    {isStagesActive ? crop.icon : <View className="opacity-50">{crop.icon}</View>}
                    <Text
                      className={`ml-2 font-semibold ${isStagesActive ? 'text-white' : 'text-slate-600'
                        }`}
                    >
                      {crop.name}
                    </Text>
                  </TouchableOpacity>

                  {/* 2. Disease Button (Just beside the crop) */}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCrop(crop);
                      setViewMode('diseases');
                    }}
                    className={`flex-row items-center py-2.5 px-4 rounded-full border mr-2 ${isDiseasesActive
                        ? 'bg-red-500 border-transparent'
                        : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    {/* Conditional Icon Color */}
                    <Bug
                      size={18}
                      color={isDiseasesActive ? 'white' : '#64748b'}
                    />
                    <Text
                      className={`ml-2 font-semibold ${isDiseasesActive ? 'text-white' : 'text-slate-500'
                        }`}
                    >
                      Diseases
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>

          {/* RENDER STAGES VIEW */}
          {viewMode === 'stages' && (
            <>
              {/* 

[Image of plant growth stages diagram]
 */}
              <View className={`w-full p-4 rounded-2xl mb-6 flex-row items-center justify-between ${selectedCrop.lightThemeColor}`}>
                <View className="flex-row items-center">
                  <View className={`p-2 rounded-full mr-3 ${selectedCrop.themeColor}`}>
                    <CalendarClock size={24} color="white" />
                  </View>
                  <View>
                    <Text className={`text-xs font-medium opacity-70 ${selectedCrop.textColor}`}>EST. DURATION</Text>
                    <Text className={`text-xl font-bold ${selectedCrop.textColor}`}>{selectedCrop.totalDuration}</Text>
                  </View>
                </View>
              </View>

              <View className="pb-10">
                {selectedCrop.stages.map((stage, index) => {
                  const isLast = index === selectedCrop.stages.length - 1;
                  const StageIcon = stage.icon;
                  return (
                    <View key={index} className="flex-row z-10">
                      <View className="items-center mr-4">
                        <View className={`z-20 w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-sm ${selectedCrop.themeColor}`}>
                          <StageIcon size={18} color="white" strokeWidth={2.5} />
                        </View>
                        {!isLast && <View className="w-0.5 h-full bg-slate-200 absolute top-5 -z-10" />}
                      </View>
                      <View className="flex-1 bg-white rounded-2xl p-4 mb-5 shadow-sm border border-slate-100">
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="text-lg font-bold text-slate-800 flex-1 mr-2">{stage.title}</Text>
                          <View className={`flex-row items-center px-2 py-1 rounded-md ${selectedCrop.lightThemeColor}`}>
                            <Timer size={14} className={selectedCrop.textColor} />
                            <Text className={`text-xs font-bold ml-1 ${selectedCrop.textColor}`}>{stage.duration}</Text>
                          </View>
                        </View>
                        <View className="flex-row items-start mt-1">
                          <Info size={16} color="#94a3b8" style={{ marginTop: 2, marginRight: 6 }} />
                          <Text className="text-slate-600 text-sm leading-5 flex-1">{stage.details}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* RENDER DISEASES VIEW */}
          {viewMode === 'diseases' && (
            <View className="pb-10">
              <View className="mb-4">
                <Text className="text-xl font-bold text-slate-800">Common {selectedCrop.name} Diseases</Text>
                <Text className="text-slate-500 text-sm">Identify and treat early to save yield</Text>
              </View>

              {selectedCrop.diseases.map((disease, index) => {
                // Determine Severity Color
                let severityColor = 'bg-slate-100';
                let severityText = 'text-slate-600';
                let borderColor = 'border-slate-200';

                if (disease.severity === 'High') {
                  severityColor = 'bg-red-50';
                  severityText = 'text-red-600';
                  borderColor = 'border-red-100';
                } else if (disease.severity === 'Medium') {
                  severityColor = 'bg-orange-50';
                  severityText = 'text-orange-600';
                  borderColor = 'border-orange-100';
                }

                return (
                  <View key={index} className={`bg-white rounded-2xl p-5 mb-4 shadow-sm border ${borderColor}`}>
                    {/* Disease Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center flex-1">
                        <View className={`p-2 rounded-lg mr-3 ${severityColor}`}>
                          <ShieldAlert size={20} className={severityText.replace('text-', 'color-')} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-slate-800">{disease.name}</Text>
                          <View className="flex-row items-center mt-1">
                            <AlertTriangle size={12} className={severityText} />
                            <Text className={`text-xs font-bold ml-1 ${severityText}`}>{disease.severity} Risk</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Symptoms Section */}
                    {/*  */}
                    <View className="bg-slate-50 p-3 rounded-lg mb-2">
                      <Text className="text-xs font-bold text-slate-400 mb-1 uppercase">Symptoms</Text>
                      <Text className="text-slate-700 text-sm leading-5">{disease.symptoms}</Text>
                    </View>

                    {/* Treatment Section */}
                    <View className={`p-3 rounded-lg ${selectedCrop.lightThemeColor}`}>
                      <View className="flex-row items-center mb-1">
                        <Stethoscope size={14} className={selectedCrop.textColor} />
                        <Text className={`text-xs font-bold ml-1 uppercase ${selectedCrop.textColor}`}>Treatment / Control</Text>
                      </View>
                      <Text className="text-slate-700 text-sm leading-5">{disease.treatment}</Text>
                    </View>
                  </View>
                );
              })}
              <View className="mt-4 p-4 bg-blue-50 rounded-xl flex-row items-start">
                <Info size={20} color="#3b82f6" style={{ marginTop: 2, marginRight: 8 }} />
                <Text className="text-blue-700 text-sm flex-1">
                  Always consult with a local agricultural expert before applying chemical treatments.
                </Text>
              </View>
            </View>
          )}

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default CropGrowthScreen;