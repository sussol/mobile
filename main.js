/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { AppRegistry } from 'react-native';
import OfflineMobileApp from './src/OfflineMobileApp';

// Disable AutoComplete warning as we use realm results instead of an array
console.ignoredYellowBox = ['Warning: Failed propType: Invalid prop `data` of type ' // eslint-disable-line
                           + '`object` supplied to `AutoComplete`, expected `array`.'
                           + ' Check the render method of `SelectModal`.'];
AppRegistry.registerComponent('offlineMobile', () => OfflineMobileApp);
