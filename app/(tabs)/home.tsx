import { View, Text } from 'react-native'
import React from 'react'
import { Button } from '@react-navigation/elements'
import { useRouter } from 'expo-router'

const Home = () => {
    const router = useRouter()
    return (
        <View>
            <Text>home</Text>
            <Button
                onPress={() => {
                    router.push('/welcome')
                }} >
                Back
            </Button>
        </View>
    )
}

export default Home