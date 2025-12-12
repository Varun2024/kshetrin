import { useState, createContext, useMemo, useContext } from "react";

const DataContext = createContext();

export const  DataProvider = ({ children }) => {
    const [sensorData, setSensorData] = useState({
        k: null,
        p: null,
        n: null,
    }); // State to hold sensor data
    const contextValue = useMemo(() => ({ sensorData, setSensorData }), [sensorData]);
    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );


}

export const useNpk = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useNpk must be used inside NpkProvider");
    }
    return context;
}