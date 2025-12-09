


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   Alert,
//   Keyboard,
//   ActivityIndicator,
// } from "react-native";
// import { PlusCircle, Trash2, Edit2 } from "lucide-react-native";
// import {
//   collection,
//   addDoc,
//   doc,
//   updateDoc,
//   deleteDoc,
//   onSnapshot,
//   query,
//   orderBy,
// } from "firebase/firestore";
// import { db } from "@/FirebaseConfig";
// import { SafeAreaProvider } from "react-native-safe-area-context";

// const History = () => {
//   // form state (added crop)
//   const [form, setForm] = useState({
//     crop: "",
//     total: "",
//     sales: "",
//     home: "",
//     leftover: "",
//   });

//   // records array: { id, crop, total, sales, home, leftover, ... }
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // edit mode
//   const [editingId, setEditingId] = useState(null);

//   const recordCollection = collection(db, "records");

//   // realtime listener for records (auto-updates)
//   useEffect(() => {
//     // ordering by __name__ is fallback; if you store timestamps, order by timestamp desc
//     const q = query(recordCollection, orderBy("__name__"));

//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
//         setRecords(docs);
//       },
//       (error) => {
//         console.error("Error fetching records:", error);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // numeric validator
//   const isNumeric = (val) => {
//     if (val === "" || val === null || val === undefined) return false;
//     return !Number.isNaN(Number(val));
//   };

//   const resetForm = () => {
//     setForm({ crop: "", total: "", sales: "", home: "", leftover: "" });
//     setEditingId(null);
//   };

//   const validateForm = () => {
//     if (!form.crop || form.crop.trim().length === 0) {
//       Alert.alert("Validation", "Please enter crop type.");
//       return false;
//     }
//     if (!isNumeric(form.total)) {
//       Alert.alert("Validation", "Please enter a valid total (yield).");
//       return false;
//     }
//     if (!isNumeric(form.sales)) {
//       Alert.alert("Validation", "Please enter a valid sales value.");
//       return false;
//     }
//     return true;
//   };

//   const addRecord = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const payload = {
//         crop: String(form.crop).trim(),
//         total: Number(form.total),
//         sales: Number(form.sales),
//         home: form.home ?? "",
//         leftover: form.leftover ?? "",
//         // createdAt: serverTimestamp()  // optional: add timestamp for ordering
//       };
//       const docRef = await addDoc(recordCollection, payload);
//       console.log("Document written with ID: ", docRef.id);
//       resetForm();
//       Keyboard.dismiss();
//     } catch (error) {
//       console.error("Error adding document: ", error);
//       Alert.alert("Error", "Failed to add record.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (item) => {
//     setEditingId(item.id);
//     setForm({
//       crop: item.crop ?? "",
//       total: String(item.total ?? ""),
//       sales: String(item.sales ?? ""),
//       home: String(item.home ?? ""),
//       leftover: String(item.leftover ?? ""),
//     });
//   };

//   const updateRecord = async () => {
//     if (!editingId) return;
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const docRef = doc(db, "records", editingId);
//       await updateDoc(docRef, {
//         crop: String(form.crop).trim(),
//         total: Number(form.total),
//         sales: Number(form.sales),
//         home: form.home ?? "",
//         leftover: form.leftover ?? "",
//       });
//       console.log("Document updated with ID: ", editingId);
//       resetForm();
//       Keyboard.dismiss();
//     } catch (error) {
//       console.error("Error updating document: ", error);
//       Alert.alert("Error", "Failed to update record.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const confirmDelete = (id) => {
//     Alert.alert("Delete record", "Are you sure you want to delete this record?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Delete", style: "destructive", onPress: () => deleteRecord(id) },
//     ]);
//   };

//   const deleteRecord = async (id) => {
//     setLoading(true);
//     try {
//       const docRef = doc(db, "records", id);
//       await deleteDoc(docRef);
//       console.log("Document deleted with ID: ", id);
//       if (editingId === id) resetForm();
//     } catch (error) {
//       console.error("Error deleting document: ", error);
//       Alert.alert("Error", "Failed to delete record.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // helper: find previous record for the same crop before given index
//   const findPreviousForSameCrop = (crop, currentIndex) => {
//     // look for previous records in the records array with same crop that occur before currentIndex
//     for (let i = currentIndex - 1; i >= 0; i--) {
//       if ((records[i]?.crop ?? "").toLowerCase() === (crop ?? "").toLowerCase()) {
//         return records[i];
//       }
//     }
//     return null;
//   };

//   // render item (removed extra SafeAreaProvider)
//   const renderItem = ({ item, index }) => {
//     const prev = findPreviousForSameCrop(item.crop, index);
//     const prevTotal = prev ? Number(prev.total) : null;
//     const currentTotal = Number(item.total);
//     const diff = prevTotal !== null ? currentTotal - prevTotal : null;
//     const diffPct = prevTotal !== null && prevTotal !== 0 ? ((diff / prevTotal) * 100) : null;
//     const diffLabel =
//       diff === null
//         ? "—"
//         : diff > 0
//         ? `+${diff} (${diffPct !== null ? diffPct.toFixed(1) + "%" : ""})`
//         : `${diff} (${diffPct !== null ? diffPct.toFixed(1) + "%" : ""})`;

//     return (
//       <View className="bg-white rounded-xl p-4 mb-3 flex-row justify-between items-center">
//         <View style={{ flex: 1 }}>
//           <Text className="text-base font-semibold">Crop: {item.crop}</Text>
//           <Text className="text-base font-semibold">Yield: {item.total}</Text>
//           <Text className="text-sm text-gray-500">Sales: {item.sales}</Text>
//           <Text className="text-sm text-gray-500">Home: {item.home}</Text>
//           <Text className="text-sm text-gray-500">Leftover: {item.leftover}</Text>

//           <View style={{ marginTop: 6 }}>
//             <Text className="text-sm">
//               Previous yield (same crop): {prevTotal !== null ? prevTotal : "No previous"}
//             </Text>
//             <Text className={`text-sm ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-600"}`}>
//               Change: {diffLabel}
//             </Text>
//           </View>
//         </View>

//         <View className="flex-row items-center gap-2">
//           <TouchableOpacity className="p-2" onPress={() => startEdit(item)} accessibilityLabel="Edit record">
//             <Edit2 size={18} color="#111827" />
//           </TouchableOpacity>

//           <TouchableOpacity className="p-2" onPress={() => confirmDelete(item.id)} accessibilityLabel="Delete record">
//             <Trash2 size={18} color="#DC2626" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaProvider>
//       <SafeAreaView className="flex-1 bg-[#F8F9FA]">
//         <View className="p-4 mt-8" style={{ flex: 1 }}>
//           <Text className="text-xl font-bold mb-3">Records History</Text>

//           {/* Form */}
//           <View className="bg-white rounded-2xl p-4 mb-4">
//             <Text className="text-sm text-gray-600 mb-1">Crop Type</Text>
//             <TextInput
//               value={form.crop}
//               onChangeText={(t) => setForm((p) => ({ ...p, crop: t }))}
//               placeholder="e.g. Wheat, Rice, Maize"
//               className="mb-3 p-2 border border-gray-200 rounded"
//             />

//             <Text className="text-sm text-gray-600 mb-1">Yield (total)</Text>
//             <TextInput
//               value={form.total}
//               onChangeText={(t) => setForm((p) => ({ ...p, total: t }))}
//               keyboardType="numeric"
//               placeholder="Enter yield"
//               className="mb-3 p-2 border border-gray-200 rounded"
//             />

//             <Text className="text-sm text-gray-600 mb-1">Sales</Text>
//             <TextInput
//               value={form.sales}
//               onChangeText={(t) => setForm((p) => ({ ...p, sales: t }))}
//               keyboardType="numeric"
//               placeholder="Enter sales"
//               className="mb-3 p-2 border border-gray-200 rounded"
//             />

//             <Text className="text-sm text-gray-600 mb-1">Home</Text>
//             <TextInput
//               value={form.home}
//               onChangeText={(t) => setForm((p) => ({ ...p, home: t }))}
//               placeholder="Enter home value (optional)"
//               className="mb-3 p-2 border border-gray-200 rounded"
//             />

//             <Text className="text-sm text-gray-600 mb-1">Leftover</Text>
//             <TextInput
//               value={form.leftover}
//               onChangeText={(t) => setForm((p) => ({ ...p, leftover: t }))}
//               placeholder="Enter leftover (optional)"
//               className="mb-3 p-2 border border-gray-200 rounded"
//             />

//             <View className="flex-row justify-between items-center">
//               <TouchableOpacity
//                 onPress={editingId ? updateRecord : addRecord}
//                 className="bg-green-500 rounded-2xl px-4 py-3"
//                 disabled={loading}
//               >
//                 <Text className="text-white font-semibold">{editingId ? "Update Record" : "Add Record"}</Text>
//               </TouchableOpacity>

//               {editingId ? (
//                 <TouchableOpacity onPress={resetForm} className="bg-gray-200 rounded-2xl px-4 py-3">
//                   <Text className="text-gray-700">Cancel</Text>
//                 </TouchableOpacity>
//               ) : (
//                 <TouchableOpacity
//                   onPress={() => setForm({ crop: "Wheat", total: "100", sales: "30", home: "40", leftover: "30" })}
//                   className="bg-gray-100 rounded-2xl px-4 py-3"
//                 >
//                   <Text className="text-gray-700">Fill demo</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>

//           {/* List */}
//           <Text className="text-lg font-semibold mb-2">Saved Records</Text>
//           {loading && <ActivityIndicator size="large" color="#4B5563" className="mb-2" />}

//           <FlatList
//             data={records}
//             keyExtractor={(item) => item.id}
//             renderItem={renderItem}
//             contentContainerStyle={{ paddingBottom: 80 }}
//             ListEmptyComponent={<Text className="text-gray-500 text-center mt-20">No records yet</Text>}
//             showsVerticalScrollIndicator={true}
//             style={{ flex: 1 }}
//           />
//         </View>
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// };

// export default History;


// History.js
import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    FlatList,
    Alert,
    Keyboard,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { Trash2, Edit2, Wheat, Leaf, ClosedCaptionIcon, Cross, CircleSlash } from "lucide-react-native";
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Svg, { Polyline, Circle, Line, Text as SvgText } from "react-native-svg";

/**
 * Small Chart component using react-native-svg
 * props.data => array of numbers (chronological order)
 * height, width => chart size
 */
const CropChart = ({ data = [], width = 320, height = 120 }) => {
    if (!Array.isArray(data) || data.length === 0)
        return (
            <View style={{ alignItems: "center", justifyContent: "center", height }}>
                <Text className="text-sm text-gray-500">No chart data</Text>
            </View>
        );

    // convert to numbers
    const nums = data.map((v) => Number(v));
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const range = max - min === 0 ? 1 : max - min;

    // create points scaled to the svg viewbox
    const stepX = width / Math.max(1, nums.length - 1);
    const points = nums
        .map((val, i) => {
            const x = i * stepX;
            // invert Y because SVG origin is top-left
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");

    // draw small circles for each point
    return (
        <Svg width={width} height={height}>
            {/* horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
                const y = height - t * height;
                return <Line key={`g-${idx}`} x1="0" y1={y} x2={width} y2={y} stroke="#E6EEF8" strokeWidth="1" />;
            })}

            {/* polyline */}
            <Polyline points={points} fill="none" stroke="#2b8cff" strokeWidth="2" />

            {/* points */}
            {nums.map((val, i) => {
                const x = i * stepX;
                const y = height - ((val - min) / range) * height;
                return <Circle key={`c-${i}`} cx={x} cy={y} r={3} fill="#2b8cff" />;
            })}

            {/* min/max labels */}
            <SvgText x={width - 4} y={12} fontSize="10" fill="#6B7280" textAnchor="end">
                {max}
            </SvgText>
            <SvgText x={width - 4} y={height - 4} fontSize="10" fill="#6B7280" textAnchor="end">
                {min}
            </SvgText>
        </Svg>
    );
};

const History = () => {
    // form state (added crop)
    const [form, setForm] = useState({
        crop: "",
        total: "",
        sales: "",
        home: "",
        leftover: "",
    });

    // records array: { id, crop, total, sales, home, leftover, createdAt }
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    // edit mode & selected crop for chart
    const [editingId, setEditingId] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState(null);

    const recordCollection = collection(db, "records");

    // realtime listener for records ordered by createdAt desc (newest first)
    useEffect(() => {
        const q = query(recordCollection, orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docs = snapshot.docs.map((d) => {
                    const data = d.data();
                    // convert Firestore Timestamp to JS Date if available
                    const createdAt = data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt ?? null;
                    return { id: d.id, ...data, createdAt };
                });
                setRecords(docs);
            },
            (error) => {
                console.error("Error fetching records:", error);
            }
        );

        return () => unsubscribe();
    }, []);

    // numeric validator
    const isNumeric = (val) => {
        if (val === "" || val === null || val === undefined) return false;
        return !Number.isNaN(Number(val));
    };

    const resetForm = () => {
        setForm({ crop: "", total: "", sales: "", home: "", leftover: "" });
        setEditingId(null);
    };

    const validateForm = () => {
        if (!form.crop || form.crop.trim().length === 0) {
            Alert.alert("Validation", "Please enter crop type.");
            return false;
        }
        if (!isNumeric(form.total)) {
            Alert.alert("Validation", "Please enter a valid total (yield).");
            return false;
        }
        if (!isNumeric(form.sales)) {
            Alert.alert("Validation", "Please enter a valid sales value.");
            return false;
        }
        return true;
    };

    const addRecord = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                crop: String(form.crop).trim(),
                total: Number(form.total),
                sales: Number(form.sales),
                home: form.home ?? "",
                leftover: form.leftover ?? "",
                createdAt: serverTimestamp(),
            };
            const docRef = await addDoc(recordCollection, payload);
            console.log("Document written with ID: ", docRef.id);
            resetForm();
            Keyboard.dismiss();
        } catch (error) {
            console.error("Error adding document: ", error);
            Alert.alert("Error", "Failed to add record.");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setForm({
            crop: item.crop ?? "",
            total: String(item.total ?? ""),
            sales: String(item.sales ?? ""),
            home: String(item.home ?? ""),
            leftover: String(item.leftover ?? ""),
        });
        // select the crop when editing too
        setSelectedCrop(item.crop ?? null);
    };

    const updateRecord = async () => {
        if (!editingId) return;
        if (!validateForm()) return;

        setLoading(true);
        try {
            const docRef = doc(db, "records", editingId);
            await updateDoc(docRef, {
                crop: String(form.crop).trim(),
                total: Number(form.total),
                sales: Number(form.sales),
                home: form.home ?? "",
                leftover: form.leftover ?? "",
            });
            console.log("Document updated with ID: ", editingId);
            resetForm();
            Keyboard.dismiss();
        } catch (error) {
            console.error("Error updating document: ", error);
            Alert.alert("Error", "Failed to update record.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
        Alert.alert("Delete record", "Are you sure you want to delete this record?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteRecord(id) },
        ]);
    };

    const deleteRecord = async (id) => {
        setLoading(true);
        try {
            const docRef = doc(db, "records", id);
            await deleteDoc(docRef);
            console.log("Document deleted with ID: ", id);
            if (editingId === id) resetForm();
        } catch (error) {
            console.error("Error deleting document: ", error);
            Alert.alert("Error", "Failed to delete record.");
        } finally {
            setLoading(false);
        }
    };

    // get chronological history for a crop (oldest -> newest)
    const cropHistory = useMemo(() => {
        if (!selectedCrop) return [];
        const history = records
            .filter((r) => (r.crop ?? "").toLowerCase() === (selectedCrop ?? "").toLowerCase())
            // records is newest-first; reverse to chronological: oldest -> newest
            .slice()
            .reverse();
        return history;
    }, [records, selectedCrop]);

    // helper: compute previous record for same crop using newest-first order
    const findPreviousForSameCrop = (crop, currentIndex) => {
        // since records are newest-first, to find previous (immediately older) we look AFTER currentIndex
        for (let i = currentIndex + 1; i < records.length; i++) {
            if ((records[i]?.crop ?? "").toLowerCase() === (crop ?? "").toLowerCase()) {
                return records[i];
            }
        }
        return null;
    };

    const renderItem = ({ item, index }) => {
        const prev = findPreviousForSameCrop(item.crop, index);
        const prevTotal = prev ? Number(prev.total) : null;
        const currentTotal = Number(item.total);
        const diff = prevTotal !== null ? currentTotal - prevTotal : null;
        const diffPct = prevTotal !== null && prevTotal !== 0 ? ((diff / prevTotal) * 100) : null;

        // dynamic color
        const diffColor = diff === null ? "#6B7280" : diff > 0 ? "#059669" : diff < 0 ? "#DC2626" : "#6B7280";
        const diffLabel =
            diff === null
                ? "—"
                : diff > 0
                    ? `+${diff} (${diffPct !== null ? diffPct.toFixed(1) + "%" : ""})`
                    : `${diff} (${diffPct !== null ? diffPct.toFixed(1) + "%" : ""})`;

        return (
            <TouchableOpacity
                onPress={() => setSelectedCrop(item.crop)}
                style={{ marginBottom: 12 }}
                activeOpacity={0.9}
            >
                <View className="bg-white rounded-xl p-4 flex-row justify-between items-start">
                    <View style={{ flex: 1 }}>
                        <Text className="text-base font-semibold">Crop: {item.crop}</Text>
                        <Text className="text-base font-semibold">Yield: {item.total}</Text>
                        <Text className="text-sm text-gray-500">Sales: {item.sales}</Text>
                        <Text className="text-sm text-gray-500">Home: {item.home}</Text>
                        <Text className="text-sm text-gray-500">Leftover: {item.leftover}</Text>

                        <View style={{ marginTop: 8 }}>
                            <Text className="text-sm">Previous yield (same crop): {prevTotal !== null ? prevTotal : "No previous"}</Text>
                            <Text style={{ marginTop: 2, color: diffColor, fontWeight: "600" }}>Change: {diffLabel}</Text>
                            {item.createdAt ? (
                                <Text className="text-xs text-gray-400" style={{ marginTop: 4 }}>
                                    {`Recorded: ${item.createdAt instanceof Date ? item.createdAt.toLocaleString() : String(item.createdAt)}`}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity className="p-2" onPress={() => startEdit(item)} accessibilityLabel="Edit record">
                            <Edit2 size={18} color="#111827" />
                        </TouchableOpacity>

                        <TouchableOpacity className="p-2" onPress={() => confirmDelete(item.id)} accessibilityLabel="Delete record">
                            <Trash2 size={18} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-[#F8F9FA]">
                <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ padding: 16,marginTop:20 }}>
                    <View style={{ flex: 1 }}>
                        <View className="flex flex-row gap-2 mb-3 justify-center items-center">
                            <Text className="text-xl font-bold">Dhan khata</Text>
                            <Leaf size={16} color="#4B5563" />
                        </View>
                        {/* Form */}
                        <View className="bg-white rounded-2xl p-4 mb-4">
                            <Text className="text-sm text-gray-600 mb-1">Crop Type</Text>
                            <TextInput
                                value={form.crop}
                                onChangeText={(t) => setForm((p) => ({ ...p, crop: t }))}
                                placeholder="e.g. Wheat, Rice, Maize"
                                className="mb-3 p-2 border border-gray-200 rounded"
                            />

                            <Text className="text-sm text-gray-600 mb-1">Yield (total)</Text>
                            <TextInput
                                value={form.total}
                                onChangeText={(t) => setForm((p) => ({ ...p, total: t }))}
                                keyboardType="numeric"
                                placeholder="Enter yield"
                                className="mb-3 p-2 border border-gray-200 rounded"
                            />

                            <Text className="text-sm text-gray-600 mb-1">Sales</Text>
                            <TextInput
                                value={form.sales}
                                onChangeText={(t) => setForm((p) => ({ ...p, sales: t }))}
                                keyboardType="numeric"
                                placeholder="Enter sales"
                                className="mb-3 p-2 border border-gray-200 rounded"
                            />

                            <Text className="text-sm text-gray-600 mb-1">Home</Text>
                            <TextInput
                                value={form.home}
                                onChangeText={(t) => setForm((p) => ({ ...p, home: t }))}
                                placeholder="Enter home value (optional)"
                                className="mb-3 p-2 border border-gray-200 rounded"
                            />

                            <Text className="text-sm text-gray-600 mb-1">Leftover</Text>
                            <TextInput
                                value={form.leftover}
                                onChangeText={(t) => setForm((p) => ({ ...p, leftover: t }))}
                                placeholder="Enter leftover (optional)"
                                className="mb-3 p-2 border border-gray-200 rounded"
                            />

                            <View className="flex-row justify-between items-center">
                                <TouchableOpacity
                                    onPress={editingId ? updateRecord : addRecord}
                                    className="bg-green-500 rounded-2xl px-4 py-3"
                                    disabled={loading}
                                >
                                    <Text className="text-white font-semibold">{editingId ? "Update Record" : "Add Record"}</Text>
                                </TouchableOpacity>

                                {editingId ? (
                                    <TouchableOpacity onPress={resetForm} className="bg-gray-200 rounded-2xl px-4 py-3">
                                        <Text className="text-gray-700">Cancel</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => setForm({ crop: "Wheat", total: "100", sales: "30", home: "40", leftover: "30" })}
                                        className="bg-gray-100 rounded-2xl px-4 py-3"
                                    >
                                        <Text className="text-gray-700">Fill demo</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Chart & selected crop summary */}
                        {selectedCrop ? (
                            <View className="bg-white rounded-2xl p-4 mb-4 max-w-screen ">
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text className="text-base font-semibold">Crop: {selectedCrop}</Text>
                                    <TouchableOpacity onPress={() => setSelectedCrop(null)}>
                                        <Text style={{ color: "red" }}><CircleSlash color={'red'} /></Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 12 }}>
                                    <Text className="text-sm text-gray-500 mb-2">Last {Math.min(10, cropHistory.length)} yields</Text>
                                    <CropChart data={cropHistory.map((r) => r.total)} width={300} height={140} />
                                </View>

                                <View style={{ marginTop: 12 }}>
                                    <Text className="text-sm text-gray-600">Latest: {cropHistory.length ? cropHistory[cropHistory.length - 1].total : "—"}</Text>
                                    <Text className="text-sm text-gray-600">Count: {cropHistory.length}</Text>
                                </View>
                            </View>
                        ) : null}

                        {/* List */}
                        <Text className="text-lg font-semibold mb-2">Saved Records</Text>
                        <Text className="text-sm text-gray-500 mb-2">Tap a record to view its crop chart</Text>
                        {loading && <ActivityIndicator size="large" color="#4B5563" className="mb-2" />}

                        <FlatList
                            data={records}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 80 }}
                            ListEmptyComponent={<Text className="text-gray-500 text-center mt-20">No records yet</Text>}
                            showsVerticalScrollIndicator={true}
                            style={{ flex: 1 }}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default History;
