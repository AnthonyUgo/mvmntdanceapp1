import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://muvs-backend-abc-e5hse4csf6dhajfy.canadacentral-01.azurewebsites.net/api';

export const getUserFromBackend = async (
  setUser: Function,
  setProfileImage: Function,
  setLocation: Function
) => {
  const email = await AsyncStorage.getItem('userEmail');
  if (!email) return;

  try {
    const res = await fetch(`${API_URL}/users/get?email=${email}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.warn('❌ Server returned error:', errorText);
      return;
    }

    const data = await res.json();
    const user = data.user;
    setUser(user);
    setProfileImage(user.profileImage);

    await AsyncStorage.setItem('userProfileImage', user.profileImage);
    await AsyncStorage.setItem('userFirstName', user.firstName);
    await AsyncStorage.setItem('userLastName', user.lastName);
    await AsyncStorage.setItem('userUsername', user.username);

    if (user.location) {
      setLocation(user.location);
      await AsyncStorage.setItem('userLocation', user.location);
    }
  } catch (err) {
    console.error('Failed to fetch user:', err);
  }
};

export function isOrganizer(user: any): boolean {
  return user?.role === 'organizer';
}

export const syncUserToStorage = async (user: any) => {
  if (!user) return;
  await AsyncStorage.setItem('userProfileImage', user.profileImage || '');
  await AsyncStorage.setItem('userFirstName', user.firstName || '');
  await AsyncStorage.setItem('userLastName', user.lastName || '');
  await AsyncStorage.setItem('userUsername', user.username || '');
  if (user.location) {
    await AsyncStorage.setItem('userLocation', user.location);
  }
};