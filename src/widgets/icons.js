/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import IonIcon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { SUSSOL_ORANGE, dataTableColors } from '../globalStyles';

export const SortAscIcon = <FAIcon name="sort-asc" size={15} style={{ marginRight: 10 }} />;
export const SortNeutralIcon = <FAIcon name="sort" size={15} style={{ marginRight: 10 }} />;
export const SortDescIcon = <FAIcon name="sort-desc" size={15} style={{ marginRight: 10 }} />;
export const CheckedComponent = (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellChecked} />
);
export const UncheckedComponent = (
  <IonIcon name="md-radio-button-off" size={15} color={SUSSOL_ORANGE} />
);
export const DisabledCheckedComponent = (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellDisabled} />
);
export const DisabledUncheckedComponent = <MaterialIcon name="cancel" size={15} />;

export const MagnifyingGlass = ({ size, color }) => (
  <EvilIcon name="search" size={size} color={color} />
);
MagnifyingGlass.propTypes = { size: PropTypes.number, color: PropTypes.string };
MagnifyingGlass.defaultProps = { size: 40, color: SUSSOL_ORANGE };

export const Cancel = ({ color, size }) => <EntypoIcon name="cross" color={color} size={size} />;
Cancel.propTypes = { size: PropTypes.number, color: PropTypes.string };
Cancel.defaultProps = { size: 40, color: SUSSOL_ORANGE };
const closeIconStyle = { color: 'white' };
export const CloseIcon = () => <IonIcon name="md-close" size={36} style={closeIconStyle} />;

export const OpenModal = () => <FAIcon name="angle-double-up" size={20} color={SUSSOL_ORANGE} />;

export const Expand = () => <FAIcon name="external-link" size={16} color={SUSSOL_ORANGE} />;
