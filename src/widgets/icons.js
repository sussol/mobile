/* eslint-disable react/forbid-prop-types */
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

import { FINALISE_GREEN, SUSSOL_ORANGE, FINALISED_RED, dataTableColors } from '../globalStyles';

export const SortAscIcon = () => <FAIcon name="sort-asc" size={15} style={{ marginRight: 10 }} />;
export const SortNeutralIcon = () => <FAIcon name="sort" size={15} style={{ marginRight: 10 }} />;
export const SortDescIcon = () => <FAIcon name="sort-desc" size={15} style={{ marginRight: 10 }} />;

export const CheckedComponent = () => (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellChecked} />
);

export const UncheckedComponent = () => (
  <IonIcon name="md-radio-button-off" size={15} color={SUSSOL_ORANGE} />
);

export const DisabledCheckedComponent = () => (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellDisabled} />
);

export const DisabledUncheckedComponent = () => <MaterialIcon name="cancel" size={15} />;

export const OpenModal = () => <FAIcon name="angle-double-up" size={20} color={SUSSOL_ORANGE} />;

export const MagnifyingGlass = React.memo(({ size, color }) => (
  <EvilIcon name="search" size={size} color={color} />
));

MagnifyingGlass.propTypes = { size: PropTypes.number, color: PropTypes.string };
MagnifyingGlass.defaultProps = { size: 40, color: SUSSOL_ORANGE };

export const Cancel = React.memo(() => <EntypoIcon name="cross" color={FINALISED_RED} size={25} />);

export const CloseIcon = React.memo(() => <IonIcon name="md-close" size={36} color="white" />);

export const Expand = React.memo(() => (
  <FAIcon name="external-link" size={16} color={SUSSOL_ORANGE} />
));

export const ConfirmIcon = React.memo(({ style }) => <FAIcon name="check-circle" style={style} />);
ConfirmIcon.defaultProps = { style: { color: FINALISE_GREEN, fontSize: 40 } };
ConfirmIcon.propTypes = { style: PropTypes.object };

export const LockIcon = React.memo(({ style }) => <FAIcon name="lock" size={28} style={style} />);
LockIcon.defaultProps = { style: { color: FINALISED_RED, marginHorizontal: 8, bottom: 6 } };
LockIcon.propTypes = { style: PropTypes.object };
