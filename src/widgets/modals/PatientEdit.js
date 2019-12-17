import React from 'react';
import { ScrollView, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ValidationTextInput } from '../ValidationTextInput';
import { PageButton } from '../PageButton';

import globalStyles, { WHITE, SUSSOL_ORANGE } from '../../globalStyles/index';

import { PatientActions } from '../../actions/PatientActions';

/**
 * Component to be wrapped by `ModalContainer` acting as a form for adding or
 * editing details of a patient.
 *
 */
export const PatientEditComponent = ({
  canSave,
  setDateOfBirthValidity,
  setAddressOneValidity,
  setAddressTwoValidity,
  setPatientCodeValidity,
  setCountryValidity,
  setFirstName,
  setLastName,
  setCode,
  setDateOfBirth,
  setEmail,
  setPhone,
  setAddressOne,
  setAddressTwo,
  setCountry,
  firstName,
  lastName,
  code,
  dateOfBirth,
  email,
  phone,
  addressOne,
  addressTwo,
  country,
  savePatient,
}) => {
  const { flexOne, flexTen, flexRow, buttonsRow, whiteBackground } = localStyles;
  const { saveButton, saveButtonTextStyle, cancelButton, cancelButtonTextStyle } = localStyles;

  const validateCode = React.useCallback(input => input.length < 20, []);
  const validateCountry = React.useCallback(input => input.length < 50, []);
  const validateAddress = React.useCallback(input => input.length < 50, []);
  const validateDateOfBirth = React.useCallback(input => {
    // Ensure the entered value is castable to a date and is less than
    // the current date.
    const dateTime = new Date(input).getTime();
    const dateTimeNow = new Date().getTime();
    if (input === '') return true;

    const inputIsAValidDate = !Number.isNaN(dateTime);
    const inputIsLessThanNow = dateTime < dateTimeNow;
    const inputHasAForwardSlash = input.includes('/');

    return inputIsAValidDate && inputIsLessThanNow && inputHasAForwardSlash;
  });

  return (
    <View style={flexOne}>
      <ScrollView style={whiteBackground}>
        <View style={flexRow}>
          <View style={flexOne} />
          <View style={flexTen}>
            <ValidationTextInput
              value={firstName}
              label="First Name"
              isRequired
              onSubmitEditing={setFirstName}
            />
            <ValidationTextInput
              value={lastName}
              isRequired
              label="Last Name"
              onSubmitEditing={setLastName}
            />
            <ValidationTextInput
              value={code}
              onValidate={validateCode}
              invalidMessage="Must be less than 20 characters"
              onChangeValidState={setPatientCodeValidity}
              isRequired
              label="Code"
              onSubmitEditing={setCode}
            />
            <ValidationTextInput
              value={dateOfBirth}
              label="Date of birth"
              onValidate={validateDateOfBirth}
              invalidMessage="Must be a valid date in the form DD/MM/YYYY"
              onChangeValidState={setDateOfBirthValidity}
              onSubmitEditing={setDateOfBirth}
            />
            <ValidationTextInput value={email} label="Email" onSubmitEditing={setEmail} />
            <ValidationTextInput value={phone} label="Phone" onSubmitEditing={setPhone} />
            <ValidationTextInput
              value={addressOne}
              label="Address 1"
              invalidMessage="Must be less than 50 characters"
              onValidate={validateAddress}
              onChangeValidState={setAddressOneValidity}
              onSubmitEditing={setAddressOne}
            />
            <ValidationTextInput
              value={addressTwo}
              label="Address 2"
              invalidMessage="Must be less than 50 characters"
              onValidate={validateAddress}
              onChangeValidState={setAddressTwoValidity}
              onSubmitEditing={setAddressTwo}
            />
            <ValidationTextInput
              value={country}
              label="Country"
              invalidMessage="Must be less than 20 characters"
              onValidate={validateCountry}
              onChangeValidState={setCountryValidity}
              onSubmitEditing={setCountry}
            />
          </View>
          <View style={flexOne} />
        </View>
      </ScrollView>
      <View style={buttonsRow}>
        <PageButton
          style={saveButton}
          isDisabled={!canSave}
          textStyle={saveButtonTextStyle}
          text="Save"
          onPress={savePatient}
        />
        <PageButton style={cancelButton} textStyle={cancelButtonTextStyle} text="Cancel" />
      </View>
    </View>
  );
};

const mapDispatchToProps = dispatch => ({
  setDateOfBirthValidity: newValidity =>
    dispatch(PatientActions.setFieldValidity('dateOfBirth', newValidity)),
  setAddressOneValidity: newValidity =>
    dispatch(PatientActions.setFieldValidity('address1', newValidity)),
  setAddressTwoValidity: newValidity =>
    dispatch(PatientActions.setFieldValidity('address2', newValidity)),
  setPatientCodeValidity: newValidity =>
    dispatch(PatientActions.setFieldValidity('code', newValidity)),
  setCountryValidity: newValidity =>
    dispatch(PatientActions.setFieldValidity('country', newValidity)),
  setFirstName: newValue => dispatch(PatientActions.setFieldUpdate('firstName', newValue)),
  setLastName: newValue => dispatch(PatientActions.setFieldUpdate('lastName', newValue)),
  setCode: newValue => dispatch(PatientActions.setFieldUpdate('code', newValue)),
  setDateOfBirth: newValue => dispatch(PatientActions.setFieldUpdate('dateOfBirth', newValue)),
  setEmail: newValue => dispatch(PatientActions.setFieldUpdate('email', newValue)),
  setPhone: newValue => dispatch(PatientActions.setFieldUpdate('phone', newValue)),
  setAddressOne: newValue => dispatch(PatientActions.setFieldUpdate('address1', newValue)),
  setAddressTwo: newValue => dispatch(PatientActions.setFieldUpdate('address2', newValue)),
  setCountry: newValue => dispatch(PatientActions.setFieldUpdate('country', newValue)),
  savePatient: () => dispatch(PatientActions.patientUpdate()),
});

const mapStateToProps = state => {
  const { patient } = state;
  const {
    firstNameIsValid,
    lastNameIsValid,
    codeIsValid,
    dateOfBirthIsValid,
    phoneIsValid,
    countryIsValid,
    firstName,
    lastName,
    code,
    dateOfBirth,
    email,
    phone,
    addressOne,
    addressTwo,
    country,
  } = patient;

  const canSave =
    firstNameIsValid &&
    lastNameIsValid &&
    codeIsValid &&
    dateOfBirthIsValid &&
    phoneIsValid &&
    countryIsValid;

  return {
    firstName,
    lastName,
    code,
    dateOfBirth,
    email,
    phone,
    addressOne,
    addressTwo,
    country,
    canSave,
  };
};

PatientEditComponent.propTypes = {
  canSave: PropTypes.bool.isRequired,
  setDateOfBirthValidity: PropTypes.func.isRequired,
  setAddressOneValidity: PropTypes.func.isRequired,
  setAddressTwoValidity: PropTypes.func.isRequired,
  setPatientCodeValidity: PropTypes.func.isRequired,
  setCountryValidity: PropTypes.func.isRequired,
  setFirstName: PropTypes.func.isRequired,
  setLastName: PropTypes.func.isRequired,
  setCode: PropTypes.func.isRequired,
  setDateOfBirth: PropTypes.func.isRequired,
  setEmail: PropTypes.func.isRequired,
  setPhone: PropTypes.func.isRequired,
  setAddressOne: PropTypes.func.isRequired,
  setAddressTwo: PropTypes.func.isRequired,
  setCountry: PropTypes.func.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  dateOfBirth: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  addressOne: PropTypes.string.isRequired,
  addressTwo: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  savePatient: PropTypes.func.isRequired,
};

export const PatientEdit = connect(mapStateToProps, mapDispatchToProps)(PatientEditComponent);

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
