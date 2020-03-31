/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

export const VaccinePageComponent = () => <View />;

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({ dispatch });

export const VaccinePage = connect(mapStateToProps, mapDispatchToProps)(VaccinePageComponent);
