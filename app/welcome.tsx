import { View, Text, Image, ImageBackground, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { Button } from '@react-navigation/elements'
import heroBg from '@/assets/images/hero-bg.png'

const Welcome = () => {
    const router = useRouter()
    return (
        <View className='x'>
            <ImageBackground
                className=' min-w-screen w-full min-h-screen flex-1 justify-center items-center gap-5 px-5'
                source={heroBg}

            >
                <View className='absolute inset-0 bg-green-600/70' />

                <Image
                    source={require('../assets/images/kshetrin.png')}
                    style={{ width: 160, height: 160 }}
                    className='rounded-2xl'
                    resizeMode='contain'
                />
                <Text
                    className='text-white text-4xl font-bold'>
                    Kshetrin
                </Text>
                <Text
                    className='text-white text-lg text-center px-5'>
                    Smart agricultural monitoring for the modern farmer. Track soil conditions, temperature, and conductivity in real-time.
                </Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}
                    className='bg-white px-10 py-4 rounded-xl mt-4'>
                    <Text className='text-green-700 text-xs'> Get Started </Text>
                </TouchableOpacity>

            </ImageBackground>
        </View>
    )
}

export default Welcome