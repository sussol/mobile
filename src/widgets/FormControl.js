/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View, ScrollView } from 'react-native';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ValidationTextInput } from './ValidationTextInput';
import { PageButton } from './PageButton';

import globalStyles, { SUSSOL_ORANGE, WHITE } from '../globalStyles/index';
import { modalStrings } from '../localization/index';
import { selectCanSaveForm, selectCompletedForm } from '../selectors/form';
import { FormActions } from '../actions/FormActions';

const FormControlComponent = ({
  onUpdateForm,
  canSaveForm,
  completedForm,
  initialiseForm,
  onSave,
  onCancel,
  inputConfig,
}) => {
  React.useEffect(() => {
    initialiseForm(inputConfig);
  }, []);

  const onSaveCompletedForm = React.useCallback(() => onSave(completedForm), [completedForm]);

  const formInputs = () =>
    inputConfig.map(({ key, isRequired, validator, initialValue, label, invalidMessage }) => (
      <ValidationTextInput
        key={key}
        value={initialValue}
        isRequired={isRequired}
        onValidate={validator}
        onChangeText={value => onUpdateForm(key, value)}
        label={label}
        invalidMessage={invalidMessage}
      />
    ));

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
          isDisabled={!canSaveForm}
          textStyle={localStyles.saveButtonTextStyle}
          text="Save"
        />
        <PageButton
          style={localStyles.cancelButton}
          onPress={onCancel}
          textStyle={localStyles.cancelButtonTextStyle}
          text={modalStrings.cancel}
        />
      </View>
    </View>
  );
};

const mapDispatchToProps = dispatch => {
  const initialiseForm = config => dispatch(FormActions.initialiseForm(config));
  const onUpdateForm = (field, value) =>
    dispatch({ type: 'Form/Update', payload: { field, value } });
  return { initialiseForm, onUpdateForm };
};

const mapStateToProps = state => {
  const canSaveForm = selectCanSaveForm(state);
  const completedForm = selectCompletedForm(state);

  return { canSaveForm, completedForm };
};

FormControlComponent.defaultProps = {
  completedForm: null,
};

FormControlComponent.propTypes = {
  canSaveForm: PropTypes.bool.isRequired,
  completedForm: PropTypes.object,
  initialiseForm: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onUpdateForm: PropTypes.func.isRequired,
  inputConfig: PropTypes.array.isRequired,
};

export const FormControl = connect(mapStateToProps, mapDispatchToProps)(FormControlComponent);

const localStyles = {
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
};
