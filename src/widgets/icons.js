/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import IonIcon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  WHITE,
  FINALISE_GREEN,
  SUSSOL_ORANGE,
  FINALISED_RED,
  DARK_GREY,
  dataTableColors,
} from '../globalStyles';

export const SortAscIcon = () => <FAIcon name="sort-asc" size={15} style={{ marginRight: 10 }} />;
export const SortNeutralIcon = () => <FAIcon name="sort" size={15} style={{ marginRight: 10 }} />;
export const SortDescIcon = () => <FAIcon name="sort-desc" size={15} style={{ marginRight: 10 }} />;

export const CheckedIcon = () => (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellChecked} />
);

export const UncheckedIcon = () => (
  <IonIcon name="md-radio-button-off" size={15} color={SUSSOL_ORANGE} />
);

export const DisabledCheckedIcon = () => (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellDisabled} />
);
export const DisabledUncheckedIcon = () => <MaterialIcon name="cancel" size={15} />;

export const OpenModalIcon = () => (
  <FAIcon name="angle-double-up" size={20} color={SUSSOL_ORANGE} />
);

export const MagnifyingGlassIcon = React.memo(({ size, color }) => (
  <EvilIcon name="search" size={size} color={color} />
));
MagnifyingGlassIcon.propTypes = { size: PropTypes.number, color: PropTypes.string };
MagnifyingGlassIcon.defaultProps = { size: 40, color: SUSSOL_ORANGE };

export const CancelIcon = React.memo(() => (
  <EntypoIcon name="cross" color={FINALISED_RED} size={25} />
));

export const CloseIcon = ({ size, color }) => <IonIcon name="md-close" size={size} color={color} />;
CloseIcon.defaultProps = { color: WHITE, size: 36 };
CloseIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const ExpandIcon = React.memo(() => (
  <FAIcon name="external-link" size={16} color={SUSSOL_ORANGE} />
));

export const ConfirmIcon = React.memo(({ style }) => <FAIcon name="check-circle" style={style} />);
ConfirmIcon.defaultProps = { style: { color: FINALISE_GREEN, fontSize: 40 } };
ConfirmIcon.propTypes = { style: PropTypes.object };

export const LockIcon = React.memo(({ style }) => <FAIcon name="lock" size={28} style={style} />);
LockIcon.defaultProps = { style: { color: FINALISED_RED } };
LockIcon.propTypes = { style: PropTypes.object };

export const ChevronDownIcon = React.memo(({ color, size }) => (
  <FA5Icon name="chevron-down" color={color} size={size} />
));
ChevronDownIcon.defaultProps = { color: WHITE, size: 20 };
ChevronDownIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const PencilIcon = React.memo(({ color, size }) => (
  <FAIcon name="pencil" color={color} size={size} />
));
PencilIcon.defaultProps = { color: WHITE, size: 20 };
PencilIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const HistoryIcon = ({ color, size }) => (
  <FA5Icon name="history" size={size} color={color} />
);
HistoryIcon.defaultProps = { color: WHITE, size: 20 };
HistoryIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const ChevronRightIcon = () => (
  <FA5Icon name="chevron-right" color={SUSSOL_ORANGE} size={20} />
);
export const FavouriteStarIcon = () => <FAIcon name="star-o" color={SUSSOL_ORANGE} size={20} />;
export const BurgerMenuIcon = () => <EntypoIcon name="menu" color={SUSSOL_ORANGE} size={30} />;

export const BookIcon = ({ color, size }) => (
  <EntypoIcon name="open-book" color={color} size={size} />
);
BookIcon.defaultProps = { color: WHITE, size: 20 };
BookIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const AddIcon = ({ size, color }) => <IonIcon name="ios-add" size={size} color={color} />;
AddIcon.defaultProps = { color: WHITE, size: 30 };
AddIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const MinusIcon = ({ size, color }) => (
  <IonIcon name="ios-remove" size={size} color={color} />
);
MinusIcon.defaultProps = { color: WHITE, size: 30 };
MinusIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const CalendarIcon = () => <FAIcon name="calendar" size={20} color={WHITE} />;

export const BackIcon = () => <FAIcon name="chevron-left" size={16} color="black" />;

export const CloudIcon = ({ color, size, style }) => (
  <IonIcon name="md-cloud" size={size} color={color} style={style} />
);
CloudIcon.defaultProps = { color: DARK_GREY, size: 30, style: {} };
CloudIcon.propTypes = { color: PropTypes.string, size: PropTypes.number, style: PropTypes.object };

export const ArrowIcon = ({ color, size, style }) => (
  <FAIcon name="exchange" size={size} style={style} color={color} />
);
ArrowIcon.defaultProps = { color: DARK_GREY, size: 16, style: { marginLeft: 10 } };
ArrowIcon.propTypes = { color: PropTypes.string, size: PropTypes.number, style: PropTypes.object };

export const WifiIcon = ({ color, size, style }) => (
  <IonIcon name="logo-rss" size={size} style={style} color={color} />
);
WifiIcon.defaultProps = { color: DARK_GREY, size: 22, style: { marginLeft: 10 } };
WifiIcon.propTypes = { color: PropTypes.string, size: PropTypes.number, style: PropTypes.object };
