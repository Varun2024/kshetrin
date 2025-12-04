import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'



const _layout = () => {
  return (
    <Tabs>
        <Tabs.Screen name="home" options={{title:"Home"}}/>
        <Tabs.Screen name="market" options={{title:"Market"}}/>
    </Tabs>
  )
}

export default _layout