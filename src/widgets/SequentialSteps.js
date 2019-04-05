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

/**
 * Component which renders either a pressable text field for
 * triggering an AutoCompleteSelector modal, or an input field
 * for a TextEditor modal. Primary use for within the ByProgramModal,
 * but will display a selection of choices for the user to step through
 * sequentially, disabling all steps after the current step in the
 * sequence. An error is used as a fallback for callers to disable
 * a step in the sequence and display an error message.
 *
 * @prop {Func} onPress       onPress handler for each step object, returns {key, field, isLastStep}
 * @prop {array} steps        An array of step objects, example below*
 * @prop {number} currentStep The index of the current step in the sequence
 * @
 *
 */
export default class SequentialSteps extends React.PureComponent {
  renderStepIcon = ({ isCurrentStep, isLessThanCurrentStep, step, complete }) => {
    const { error } = step;
    return (
      <View style={{ minWidth: 40 }}>
        {isCurrentStep && error && <Ionicons name="ios-close" color="red" size={30} />}
        {((isLessThanCurrentStep && !error) || complete) && (
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
    const { onPress, steps, currentStepKey } = this.props;
    const { key, error, type } = step;
    const { content } = localStyles;

    const isInput = type === 'input';
    const isCurrentStep = key === currentStepKey;
    const complete = currentStepKey === 'complete';

    const isLessThanCurrentStep =
      steps.findIndex(s => s.key === key) < steps.findIndex(s => s.key === currentStepKey);
    const onPressFunc =
      ((isCurrentStep || isLessThanCurrentStep) && !error) || complete
        ? () => onPress({ key })
        : null;

    const args = {
      canEdit: isLessThanCurrentStep || isCurrentStep || complete,
      isCurrentStep,
      isLessThanCurrentStep,
      isInput,
      complete,
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

SequentialSteps.propTypes = {
  onPress: PropTypes.func.isRequired,
  steps: PropTypes.array.isRequired,
  currentStepKey: PropTypes.string.isRequired,
};

/**
 * Steps array example
 * [{
 *    name: 'PNLS_ARV',
 *    placeholder: 'Select a program',
 *    stepNumber: 0,
 *    key: 'program',
 *    error: true,
 *    errorText: 'No programs available',
 * }
 * ...
 * ]
 */
