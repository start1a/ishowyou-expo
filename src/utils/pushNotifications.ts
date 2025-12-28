import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 앱이 포그라운드에 있을 때 알림을 어떻게 처리할지 설정
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            // Expo Push Token 가져오기
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);
        } catch (e) {
            console.error('Error fetching push token:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

/**
 * Expo Push API를 통해 알림 발송
 * (백엔드 없이 클라이언트에서 직접 발송하는 방식)
 */
export async function sendPushNotification(
    tokens: string | string[],
    title: string,
    body: string,
    data?: Record<string, any>
) {
    const message = {
        to: tokens,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const resData = await response.json();
        return { success: true, data: resData };
    } catch (error) {
        console.error('Push send error:', error);
        return { success: false, error };
    }
}
