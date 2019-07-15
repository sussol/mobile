/* eslint-disable import/prefer-default-export */
import { PermissionsAndroid } from 'react-native';

/**
 * Helper method to request permissions during runtime.
 *
 * When trying to use native features for API level > 23, permissions may
 * need to be granted for permissions a part of the dangerous group,
 * which can't be granted during installation.
 * See:
 * https://developer.android.com/training/permissions/requesting
 * https://facebook.github.io/react-native/docs/permissionsandroid
 *
 *
 * @property {String} permission The permission request, examples below
 * @property {String} message    A reason for requesting the permission
 * @return   {Object} {success, permissionType, result, error}
 * Permission examples: WRITE_EXTERNAL_STORAGE, READ_EXTERNAL_STORAGE
 * See [for permission groups]:
 * https://developer.android.com/guide/topics/permissions/overview
 */
export async function requestPermission({ permissionType, message }) {
  const rationale = {
    title: 'mSupply Mobile',
    buttonNeutral: 'Ask Me Later',
    buttonNegative: 'Cancel',
    buttonPositive: 'OK',
    message,
  };

  let result;
  try {
    const permission = PermissionsAndroid.PERMISSIONS[permissionType];
    result = await PermissionsAndroid.request(permission, rationale);

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return { success: true, permissionType, result };
    }

    return { success: false, permissionType, result };
  } catch (error) {
    return { success: false, permissionType, result, error };
  }
}
