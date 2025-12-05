import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'



const _layout = () => {
    return (
        <Tabs>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <Text style={{ color: color, fontSize: size }}>H</Text>
                        </View>
                    ),
                }} />
            <Tabs.Screen
                name="market"
                options={{
                    title: "Market",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <Text style={{ color: color, fontSize: size }}>M</Text>
                        </View>
                    ),
                }} />
        </Tabs>
    )
}

export default _layout