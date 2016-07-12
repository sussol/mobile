/**
 * mSupply MobileAndroid Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { AppRegistry } from 'react-native';
import mSupplyMobileApp from './src/mSupplyMobileApp';

// Disable AutoComplete warning as we use realm results instead of an array
console.ignoredYellowBox = // eslint-disable-line no-console
  ['Warning: Failed prop type: Invalid prop `data` of type `object` supplied to `AutoComplete`'];
AppRegistry.registerComponent('mSupplyMobile', () => mSupplyMobileApp);
