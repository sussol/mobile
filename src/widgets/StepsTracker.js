import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { PropTypes } from 'prop-types';

import { SUSSOL_ORANGE, GREY, APP_FONT_FAMILY } from '../globalStyles';

const { height, width } = Dimensions.get('window');

const getLocalStyles = (step, numberOfSteps, currentStep) => {
  const denominator = numberOfSteps * 3;
  return {
    stepContainer: {
      borderRadius: height / (numberOfSteps * 2),
      borderWidth: 8,
      borderColor: step > currentStep ? GREY : SUSSOL_ORANGE,
      width: width / denominator,
      height: height / (numberOfSteps * 2),
      justifyContent: 'center',
      alignItems: 'center',
      [step === currentStep ? 'backgroundColor' : '']: SUSSOL_ORANGE,
    },
    stepText: {
      color: step > currentStep ? GREY : (step === currentStep && 'white') || SUSSOL_ORANGE,
      fontSize: 200 / numberOfSteps,
      fontFamily: APP_FONT_FAMILY,
    },
    stepSeperator: {
      borderColor: step > currentStep ? GREY : SUSSOL_ORANGE,
      borderWidth: 4,
      height: 0,
      width: width / denominator,
      alignSelf: 'center',
      justifyContent: 'center',
    },
    titleText: {
      color: GREY,
      fontSize: 25,
      fontFamily: APP_FONT_FAMILY,
    },
    container: { flexDirection: 'column', alignItems: 'center' },
  };
};

const StepNumber = ({ step, numberOfSteps, currentStep, title, onPress }) => {
  const { stepContainer, stepText, stepSeperator, titleText, container } = getLocalStyles(
    step,
    numberOfSteps,
    currentStep
  );
  const enabledStep = currentStep >= step;
  const Container = enabledStep ? TouchableOpacity : View;
  const wrappedOnPress = () => onPress(step - 1);
  return (
    <Container onPress={wrappedOnPress} style={container}>
      <Text style={titleText}>{step === currentStep ? title : ' '}</Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={stepSeperator} />
        <View style={stepContainer}>
          <Text style={stepText}>{step + 1}</Text>
        </View>
        <View style={stepSeperator} />
      </View>
    </Container>
  );
};

StepNumber.propTypes = {
  step: PropTypes.number.isRequired,
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

export const StepsTracker = ({ numberOfSteps, currentStep, title, onPress }) => (
  <View style={{ flexDirection: 'row' }}>
    {Array.from({ length: numberOfSteps }).map((_, i) => (
      <StepNumber
        onPress={onPress}
        step={i}
        numberOfSteps={numberOfSteps}
        currentStep={currentStep}
        title={title}
      />
    ))}
  </View>
);

StepsTracker.propTypes = {
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};
