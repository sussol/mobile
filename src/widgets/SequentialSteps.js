/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { WARM_GREY, SUSSOL_ORANGE } from '../globalStyles';

export default class SequentialSteps extends React.PureComponent {
  renderStepIcon = ({ isCurrentStep, isLessThanCurrentStep, step }) => {
    const { error } = step;
    return (
      <View style={{ minWidth: 40 }}>
        {isCurrentStep && error && <Ionicons name="ios-close" color="red" size={30} />}
        {isLessThanCurrentStep && !error && (
          <Ionicons name="md-checkmark" color="green" size={30} />
        )}
        {isCurrentStep && !error && (
          <Ionicons name="md-arrow-round-forward" color={SUSSOL_ORANGE} size={30} />
        )}
      </View>
    );
  };

  renderInputField = ({ canEdit, step }) => {
    const { textContent, text } = localStyles;
    const { name, placeholder } = step;
    const textStyle = { ...text, color: canEdit ? 'white' : WARM_GREY, marginBottom: 10 };
    const containerStyle = { borderBottomColor: 'white', borderBottomWidth: 1, ...textContent };
    return (
      <View style={containerStyle}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={textStyle}>
          {name || placeholder}
        </Text>
      </View>
    );
  };

  renderTextField = ({ canEdit, step }) => {
    const { text, textContent } = localStyles;
    const { placeholder, name, errorText, error } = step;
    const style = { ...text, color: canEdit ? 'white' : WARM_GREY };
    return (
      <View style={textContent}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={style}>
          {(error && errorText) || name || placeholder}
        </Text>
      </View>
    );
  };

  renderEditIcon = ({ canEdit, isInput, error }) => (
    <View style={localStyles.icon}>
      {isInput && !error && (
        <FontAwesome name="pencil" size={20} color={canEdit ? 'white' : WARM_GREY} />
      )}
      {!isInput && !error && (
        <Ionicons name="ios-arrow-down" size={20} color={canEdit ? 'white' : WARM_GREY} />
      )}
    </View>
  );

  renderRow = step => {
    const { onPress, currentStep, steps, type } = this.props;
    const { key, stepNumber, error } = step;
    const { content } = localStyles;

    const isCurrentStep = stepNumber === currentStep;
    const isLessThanCurrentStep = stepNumber < currentStep;
    const isLastStep = currentStep === steps.length - 1;
    const isInput = type === 'input';
    const onPressFunc =
      (isCurrentStep || isLessThanCurrentStep) && !error
        ? () => onPress({ key, stepNumber, isLastStep })
        : null;

    const args = {
      canEdit: isLessThanCurrentStep || isCurrentStep,
      isCurrentStep,
      isLessThanCurrentStep,
      isLastStep,
      isInput,
      step,
      error,
    };

    return (
      <TouchableOpacity onPress={onPressFunc} key={key}>
        <View style={content}>
          {this.renderStepIcon(args)}
          {isInput ? this.renderInputField(args) : this.renderTextField(args)}
          {this.renderEditIcon(args)}
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { steps } = this.props;
    return <View>{steps.map(step => this.renderRow(step))}</View>;
  }
}

const localStyles = StyleSheet.create({
  content: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 15,
    marginVertical: 10,
  },
  textContent: { display: 'flex', alignItems: 'flex-start', paddingLeft: 10 },
  text: { fontSize: 20, width: 300 },
  icon: { marginTop: 4, minWidth: 60, display: 'flex', alignItems: 'flex-end' },
});

SequentialSteps.defaultProps = {
  type: 'select',
};
SequentialSteps.propTypes = {
  onPress: PropTypes.func.isRequired,
  steps: PropTypes.array.isRequired,
  type: PropTypes.string,
  currentStep: PropTypes.number.isRequired,
};
