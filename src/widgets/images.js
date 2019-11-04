/* eslint-disable react/forbid-prop-types */
/* eslint-disable global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';

/**
 * Collection of image components for easy access and to ensure
 * images are lazily required.
 */

const flagPropTypes = { style: PropTypes.object.isRequired };

export const EnglishFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/gb.png')} resizeMode="stretch" />
);
EnglishFlag.propTypes = flagPropTypes;

export const KiribatiFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/gil.png')} resizeMode="stretch" />
);
KiribatiFlag.propTypes = flagPropTypes;

export const FrenchFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/fr.png')} resizeMode="stretch" />
);
FrenchFlag.propTypes = flagPropTypes;

export const TetumFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/tl.png')} resizeMode="stretch" />
);
TetumFlag.propTypes = flagPropTypes;

export const LaosFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/la.png')} resizeMode="stretch" />
);
LaosFlag.propTypes = flagPropTypes;
