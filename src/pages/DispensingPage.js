/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';

import { Button } from 'react-native-ui-components';

import globalStyles, { SHADOW_BORDER, BACKGROUND_COLOR } from '../globalStyles';

const Dispensing = () => {
  const { menuButton, menuButtonText: buttonText } = globalStyles;
  const { flexOne, middleColumn, mainContainer, buttonContainer } = localStyles;

  const MenuButton = useCallback(
    props => <Button style={menuButton} textStyle={buttonText} {...props} />,
    []
  );

  return (
    <View style={mainContainer}>
      <View style={flexOne} />
      <View style={middleColumn}>
        <View style={flexOne} />
        <View style={buttonContainer}>
          <MenuButton text="Prescriptions" />
          <MenuButton text="Prescribers" />
          <MenuButton text="Patients" />
        </View>
        <View style={flexOne} />
      </View>
      <View style={flexOne} />
    </View>
  );
};

const localStyles = {
  flexOne: { flex: 1 },
  middleColumn: { flex: 0.75, flexDirection: 'column' },
  mainContainer: { backgroundColor: BACKGROUND_COLOR, flexDirection: 'row', flex: 1 },
  buttonContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SHADOW_BORDER,
    backgroundColor: 'white',
  },
};

export const DispensingPage = connect()(Dispensing);
