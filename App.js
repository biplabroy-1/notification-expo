import React, { useEffect, useRef, useState } from 'react';
import { Button, View, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import BackgroundFetch from 'react-native-background-fetch';

export default function App() {
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Set notification handler to show notifications even when the app is in the foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Create a notification channel for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        sound: true,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Add notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // Fetch interval in minutes
        stopOnTerminate: false, // Continue to run even if app is terminated
        startOnBoot: true, // Start fetch when device is restarted
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
        requiresCharging: false, // Default
        requiresDeviceIdle: false, // Default
        requiresBatteryNotLow: false, // Default
        requiresStorageNotLow: false, // Default
      },
      async (taskId) => {
        console.log('[BackgroundFetch] taskId:', taskId);
        await scheduleAlarm();
        BackgroundFetch.finish(taskId);
      },
      (taskId) => {
        console.log('[BackgroundFetch] TIMEOUT taskId:', taskId);
        BackgroundFetch.finish(taskId);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const scheduleAlarm = async () => {
    const trigger = new Date(Date.now() + 5 * 1000); // 5 seconds from now

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alarm",
        body: "This is your alarm notification!",
        sound: true,
      },
      trigger,
    });

    Alert.alert('Alarm Set!', 'Your alarm has been scheduled.');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Set Alarm background" onPress={scheduleAlarm} />
    </View>
  );
}
