import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';

const Home = () => {

    const [sound, setSound] = useState();

    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(
        require('./assets/one.mp3'),
          { shouldPlay: true }
        );
        setSound(sound);
    }
    
    function pauseSound() {
        sound.pauseAsync();
    }
    
    function stopSound() {
        sound.stopAsync();
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Music Player App</Text>
        <Button title="Play" onPress={playSound} />
        <Button title="Pause" onPress={pauseSound} />
        <Button title="Stop" onPress={stopSound} />
      </View>
  )
}

export default Home