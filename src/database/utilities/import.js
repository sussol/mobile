import { ToastAndroid } from 'react-native';
import RNRestart from 'react-native-restart';

import { generalStrings } from '../../localization';
import { UIDatabase } from '../index';

export const importData = async () => {
  const { success, error = '' } = await UIDatabase.importData();
  const toastMessage = success ? generalStrings.imported_data : error;

  ToastAndroid.show(toastMessage, ToastAndroid.LONG);

  if (success) {
    setTimeout(() => {
      // Delay application restart to 2 seconds
      // so the above toast message can be readable to the user
      RNRestart.Restart();
    }, 2000);
  }
};
