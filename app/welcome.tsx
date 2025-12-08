import { View, Text, Image, ImageBackground, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import heroBg from '@/assets/images/hero-bg.png'
import { Leaf } from 'lucide-react-native'

const Welcome = () => {
    const router = useRouter()
    return (
        <View className=''>
            <ImageBackground
                blurRadius={2}
                className=' min-w-screen w-full min-h-screen flex-1 justify-center items-center gap-5 px-5'
                source={heroBg}
            >
                <View className='absolute inset-0 bg-green-700/50' />

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
                    className='bg-white px-10 py-4 rounded-xl mt-4 flex-row justify-center items-center gap-2'>
                    <Text className='text-green-700 text-xs'> Get Started </Text>
                    <Leaf size={16} color='#4caf50' className='mt-2' />
                </TouchableOpacity>

            </ImageBackground>
        </View>
    )
}

export default Welcome