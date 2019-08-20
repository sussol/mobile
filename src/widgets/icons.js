/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import IonIcon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import { dataTableColors } from '../globalStyles';

export const SortAscIcon = <FAIcon name="sort-asc" size={15} style={{ marginRight: 10 }} />;
export const SortNeutralIcon = <FAIcon name="sort" size={15} style={{ marginRight: 10 }} />;
export const SortDescIcon = <FAIcon name="sort-desc" size={15} style={{ marginRight: 10 }} />;
export const CheckedComponent = (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellChecked} />
);
export const UncheckedComponent = (
  <IonIcon name="md-radio-button-off" size={15} color={dataTableColors.checkableCellUnchecked} />
);
export const DisabledCheckedComponent = (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellDisabled} />
);
export const DisabledUncheckedComponent = (
  <IonIcon name="md-radio-button-off" size={15} color={dataTableColors.checkableCellDisabled} />
);
