import React from 'react';
import { View, Text, Dimensions } from 'react-native';
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
  };
};

const StepNumber = ({ step, numberOfSteps, currentStep, title }) => {
  const { stepContainer, stepText, stepSeperator, titleText } = getLocalStyles(
    step,
    numberOfSteps,
    currentStep
  );
  return (
    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
      <Text style={titleText}>{step === currentStep ? title : ' '}</Text>
      <View style={{ flexDirection: 'row' }}>
        <View style={stepSeperator} />
        <View style={stepContainer}>
          <Text style={stepText}>{step}</Text>
        </View>
        <View style={stepSeperator} />
      </View>
    </View>
  );
};

StepNumber.propTypes = {
  step: PropTypes.number.isRequired,
  numberOfSteps: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export const StepsTracker = ({ numberOfSteps, currentStep, title }) => (
  <View style={{ flexDirection: 'row' }}>
    {Array.from({ length: numberOfSteps }).map((_, i) => (
      <StepNumber
        step={i + 1}
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
};
