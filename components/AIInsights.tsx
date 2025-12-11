// AIInsights.js
import React, { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";

export default function AIInsights({ visible, stateData , sensorData }: {visible: boolean, stateData: string, sensorData: any})  {
  // computedValues should be the object returned by compute_all_values on your server
  // or locally computed on the client. Example:
  // { state: "Uttar_Pradesh", recommended_application_kg_per_ha: { N:15, P2O5:4.5, K2O:0 }, confidence:"high" }

  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);

  async function fetchInsight() {
    setLoading(true);
    setError(null);
    setInsight(null);

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
      } else {
        setInsight(json?.descriptive_recommendation || "No recommendation returned.");
      }
    } catch (e : any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  // Optionally fetch when component mounts or on button press
  // Here we show a button to trigger to avoid unnecessary calls
  if (!visible) return null;

  return (
    <View className="bg-purple-100 rounded-3xl p-5 mb-6">
      <Text className="text-lg font-bold text-purple-900 mb-2">AI Insights</Text>

      {loading ? (
        <View className="flex flex-row gap-2 items-center">
        <Text>AI is generating insights</Text> 
        <ActivityIndicator size="small" color="#6D28D9" />
        </View>
      ) : error ? (
        <>
          <Text className="text-sm text-red-600 mb-2">Error: {error}</Text>
          <TouchableOpacity onPress={fetchInsight} className="bg-purple-600 rounded-2xl px-3 py-2">
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </>
      ) : insight ? (
        <Text className="text-sm text-purple-800">
            {insight}
        </Text>
      ) : (
        <>
          <Text className="text-sm text-purple-800 mb-3">
            Based on the current sensor readings and weather conditions, request an AI-generated recommendation.
          </Text>
          <TouchableOpacity onPress={fetchInsight} className="bg-purple-600 rounded-2xl px-3 py-2">
            <Text className="text-white">Get Recommendation</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
