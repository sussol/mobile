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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  WHITE,
  FINALISE_GREEN,
  SUSSOL_ORANGE,
  FINALISED_RED,
  DARK_GREY,
  dataTableColors,
  GREY,
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
export const DisabledUncheckedIcon = () => <MaterialCommunityIcon name="cancel" size={15} />;

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

export const CogIcon = ({ size, color }) => <FAIcon name="cog" size={size} color={color} />;
CogIcon.defaultProps = { color: GREY, size: 30 };
CogIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const ExpandIcon = React.memo(({ style, color, size }) => (
  <FAIcon name="external-link" style={style} size={size} color={color} />
));

ExpandIcon.defaultProps = { color: SUSSOL_ORANGE, size: 16, style: {} };
ExpandIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const ConfirmIcon = React.memo(({ style }) => <FAIcon name="check-circle" style={style} />);
ConfirmIcon.defaultProps = { style: { color: FINALISE_GREEN, fontSize: 40 } };
ConfirmIcon.propTypes = { style: PropTypes.object };

export const LockIcon = React.memo(({ style }) => <FAIcon name="lock" size={28} style={style} />);
LockIcon.defaultProps = { style: { color: FINALISED_RED } };
LockIcon.propTypes = { style: PropTypes.object };

export const LanguageIcon = ({ size, color }) => (
  <FAIcon name="language" size={size} color={color} />
);
LanguageIcon.defaultProps = { color: GREY, size: 30 };
LanguageIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const ChevronDownIcon = React.memo(({ color, size, style }) => (
  <FA5Icon name="chevron-down" color={color} size={size} style={style} />
));
ChevronDownIcon.defaultProps = { color: WHITE, size: 20, style: {} };
ChevronDownIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const ChevronUpIcon = React.memo(({ color, size, style }) => (
  <FA5Icon name="chevron-up" color={color} size={size} style={style} />
));
ChevronUpIcon.defaultProps = { color: WHITE, size: 20, style: {} };
ChevronUpIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const PowerIcon = React.memo(({ color, size }) => (
  <FAIcon name="power-off" color={color} size={size} />
));
PowerIcon.defaultProps = { color: GREY, size: 30 };
PowerIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

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

export const TemperatureIcon = ({ color, size, style }) => (
  <FA5Icon name="temperature-high" size={size} style={style} color={color} />
);
TemperatureIcon.defaultProps = { color: DARK_GREY, size: 25, style: { marginLeft: 10 } };
TemperatureIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const HazardIcon = ({ color, size, style }) => (
  <FA5Icon name="exclamation-triangle" size={size} style={style} color={color} />
);
HazardIcon.defaultProps = { color: SUSSOL_ORANGE, size: 25, style: {} };
HazardIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const SyncArrow = ({ size, style, color }) => (
  <MaterialIcon name="sync" size={size} style={style} color={color} />
);
SyncArrow.defaultProps = { size: 30, style: {}, color: GREY };
SyncArrow.propTypes = { size: PropTypes.number, style: PropTypes.object, color: PropTypes.string };

export const SyncArrowDisabled = ({ size, style, color }) => (
  <MaterialIcon name="sync-disabled" size={size} style={style} color={color} />
);
SyncArrowDisabled.defaultProps = { size: 30, style: {}, color: GREY };
SyncArrowDisabled.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const SyncArrowProblem = ({ size, style, color }) => (
  <MaterialIcon name="sync-problem" size={size} style={style} color={color} />
);
SyncArrowProblem.defaultProps = { size: 30, style: {}, color: GREY };
SyncArrowProblem.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};
