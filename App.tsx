import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Updates from 'expo-updates';
import { checkForUpdateAsync } from 'expo-updates';

export default function App() {
  useEffect(() =>{
    async function UpdateApp() {
      const { isAvailable } = await checkForUpdateAsync();
      
      if(isAvailable){
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    }
    UpdateApp();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hallo word with Update!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
