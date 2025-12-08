import { View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Folder, Home, Network, Store } from 'lucide-react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'


const _layout = () => {
    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <Tabs>
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Home",
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <View className='isize-full justify-center items-center'>
                                <Home size={24} />
                            </View>
                        ),
                    }} />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: "History",
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <View className='isize-full justify-center items-center'>
                                <Folder size={24} />
                            </View>
                        ),
                    }} />
                <Tabs.Screen
                    name="pairing"
                    options={{
                        title: "Pairing",
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <View className='isize-full justify-center items-center'>
                                <Network size={24} />
                            </View>
                        ),
                    }} />
            </Tabs>
        </SafeAreaProvider>
    )
}

export default _layout