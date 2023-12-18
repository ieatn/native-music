import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import LikedSongsScreen from './LikedSongsScreen';

const Home = () => {

  return (
    <View style={styles.container}>
      <LikedSongsScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },
});

export default Home;
