/* eslint-disable no-unused-expressions */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PageButton } from './PageButton';
import { FormTextInput } from './FormInputs/FromTextInput';
import { FormDateInput } from './FormInputs/FormDateInput';
import { FormToggle } from './FormInputs/FormToggle';
import { FormDropdown } from './FormInputs/FormDropdown';
import { FormSlider } from './FormInputs/FormSlider';

import globalStyles, { SUSSOL_ORANGE, WHITE } from '../globalStyles';
import { modalStrings, generalStrings } from '../localization';
import { selectCanSaveForm, selectCompletedForm } from '../selectors/form';
import { FormActions } from '../actions/FormActions';

/**
 * Component which will manage and control a set of user inputs of a form.
 * The configuration for the inputs comes from `formInputConfigs.js` where
 * the configs are defined for common inputs to create a form semi-declaritively.
 *
 * Uses the `Form` object within redux state to help manage state.
 *
 * @param {func}  onCancel        Callback passed from a parent to control the cancel button.
 * @param {func}  onUpdateForm    Takes the field/value and updates state within redux.
 * @param {func}  onCancelPressed Resets the form state in redux and calls the onClose callback.
 * @param {bool}  canSaveForm     Indicator that all fields are valid and required fields are filled
 * @param {func}  completedForm   Object containing key:value pairs of valid inputs from the form.
 * @param {func}  initialiseForm  Dispatcher to initialise the redux state with the correct config.
 * @param {func}  onSave          Callback to invoke on saving the form, passing back completedForm.
 * @param {bool}  isDisabled      Indicator whether this Form is disabled.
 * @param {Array} inputConfig     Configuration array of input config objects.
 *                                See { getFormInputConfig } from src/utilities/formInputConfigs.
 */
const FormControlComponent = ({
  onUpdateForm,
  onCancelPressed,
  canSaveForm,
  completedForm,
  initialiseForm,
  onSave,
  inputConfig,
  isDisabled,
}) => {
  const [refs, setRefs] = React.useState([]);
  React.useEffect(() => {
    initialiseForm(inputConfig);
    setRefs({ length: inputConfig.length });
  }, []);

  const onSaveCompletedForm = React.useCallback(() => onSave(completedForm), [
    onSave,
    completedForm,
  ]);

  const nextFocus = (index, key) => value => {
    onUpdateForm(key, value);
    refs[index + 1]?.current?.focus?.();
  };

  const formInputs = () =>
    inputConfig.map(
      (
        {
          type,
          key,
          isRequired,
          validator,
          initialValue,
          label,
          invalidMessage,
          isEditable,
          ...rest
        },
        index
      ) => {
        refs[index] = React.useRef();
        switch (type) {
          case 'text': {
            return (
              <FormTextInput
                ref={refs[index]}
                onSubmit={nextFocus(index, key)}
                key={key}
                value={initialValue}
                isRequired={isRequired}
                onValidate={validator}
                onChangeText={value => onUpdateForm(key, value)}
                label={label}
                invalidMessage={invalidMessage}
                isDisabled={!isEditable || isDisabled}
              />
            );
          }
          case 'date': {
            return (
              <FormDateInput
                ref={refs[index]}
                key={key}
                isRequired={isRequired}
                label={label}
                value={initialValue}
                onChangeDate={value => onUpdateForm(key, value)}
                onValidate={validator}
                invalidMessage={invalidMessage}
                onSubmit={nextFocus(index, key)}
                isDisabled={isDisabled}
              />
            );
          }
          case 'dropdown': {
            const { options, optionKey } = rest;
            return (
              <FormDropdown
                key={key}
                isRequired={isRequired}
                label={label}
                value={completedForm?.[key] ?? initialValue}
                onValueChange={value => onUpdateForm(key, value)}
                options={options}
                optionKey={optionKey}
                isDisabled={!isEditable || isDisabled}
              />
            );
          }
          case 'toggle': {
            const { options, optionLabels } = rest;
            return (
              <FormToggle
                options={options}
                optionLabels={optionLabels}
                value={completedForm?.[key] ?? initialValue}
                onValueChange={value => onUpdateForm(key, value)}
                key={key}
                label={label}
                isRequired={isRequired}
                isDisabled={isDisabled}
              />
            );
          }
          case 'slider': {
            const { maximumValue, minimumValue, step } = rest;
            return (
              <FormSlider
                ref={refs[index]}
                maxmimumValue={maximumValue}
                minimumValue={minimumValue}
                step={step}
                value={completedForm?.[key] ?? initialValue}
                onValueChange={value => onUpdateForm(key, value)}
                key={key}
                label={label}
                isRequired={isRequired}
                isDisabled={isDisabled}
              />
            );
          }
          default:
            return null;
        }
      }
    );

  return (
    <View style={localStyles.flexOne}>
      <ScrollView style={localStyles.whiteBackground}>
        <View style={localStyles.flexRow}>
          <View style={localStyles.flexOne} />
          <View style={localStyles.flexTen}>{formInputs()}</View>
          <View style={localStyles.flexOne} />
        </View>
      </ScrollView>
      <View style={localStyles.buttonsRow}>
        <PageButton
          onPress={onSaveCompletedForm}
          style={localStyles.saveButton}
          isDisabled={!canSaveForm || isDisabled}
          textStyle={localStyles.saveButtonTextStyle}
          text={generalStrings.save}
        />
        <PageButton
          style={localStyles.cancelButton}
          onPress={onCancelPressed}
          textStyle={localStyles.cancelButtonTextStyle}
          text={modalStrings.cancel}
        />
      </View>
    </View>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { onCancel } = ownProps;

  const initialiseForm = config => dispatch(FormActions.initialiseForm(config));
  const onUpdateForm = (key, value) => dispatch(FormActions.updateForm(key, value));
  const onCancelPressed = () => {
    dispatch(FormActions.resetForm());
    onCancel();
  };
  return { initialiseForm, onUpdateForm, onCancelPressed };
};

const mapStateToProps = state => {
  const canSaveForm = selectCanSaveForm(state);
  const completedForm = selectCompletedForm(state);
  return { canSaveForm, completedForm };
};

FormControlComponent.defaultProps = {
  completedForm: null,
  isDisabled: false,
};

FormControlComponent.propTypes = {
  canSaveForm: PropTypes.bool.isRequired,
  completedForm: PropTypes.object,
  initialiseForm: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  inputConfig: PropTypes.array.isRequired,
  onCancelPressed: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

export const FormControl = connect(mapStateToProps, mapDispatchToProps)(FormControlComponent);

const localStyles = StyleSheet.create({
  saveButton: {
    ...globalStyles.button,
    backgroundColor: SUSSOL_ORANGE,
    alignSelf: 'center',
  },
  saveButtonTextStyle: {
    ...globalStyles.buttonText,
    color: 'white',
    fontSize: 14,
  },
  cancelButton: {
    ...globalStyles.button,

    alignSelf: 'center',
  },
  cancelButtonTextStyle: {
    ...globalStyles.buttonText,
    color: SUSSOL_ORANGE,
    fontSize: 14,
  },
  flexOne: { flex: 1 },
  flexTen: { flex: 10 },
  flexRow: { flex: 1, flexDirection: 'row' },
  buttonsRow: { marginTop: 10, flexDirection: 'row-reverse' },
  whiteBackground: { backgroundColor: WHITE },
});
