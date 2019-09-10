/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import IonIcon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import { dataTableColors, SUSSOL_ORANGE } from '../globalStyles';

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

const closeIconStyle = { color: 'white' };
export const CloseIcon = () => <IonIcon name="md-close" size={36} style={closeIconStyle} />;

export const OpenModal = () => <FAIcon name="angle-double-up" size={20} color={SUSSOL_ORANGE} />;

export const Expand = () => <FAIcon name="external-link" size={16} color={SUSSOL_ORANGE} />;
