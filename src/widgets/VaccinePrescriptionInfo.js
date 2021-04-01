/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import CheckBox from '@react-native-community/checkbox';
import { FlexRow } from './FlexRow';
import { selectFullName } from '../selectors/Entities/name';
import { Paper } from './Paper';
import { dispensingStrings, vaccineStrings } from '../localization/index';
import { FlexColumn } from './FlexColumn';
import { FlexView } from './FlexView';
import { APP_FONT_FAMILY, DARKER_GREY, SUSSOL_ORANGE } from '../globalStyles';
import { UIDatabase } from '../database/index';
import { DropDown } from './DropDown';
import { VaccinePrescriptionActions } from '../actions/Entities/index';
import {
  selectHasRefused,
  selectSelectedVaccinator,
} from '../selectors/Entities/vaccinePrescription';
import { Spacer } from './Spacer';

const WithLabel = ({ label, ...props }) => (
  <FlexColumn flex={0}>
    <FlexView flex={0}>
      <Text style={styles.labelText}>{label}</Text>
    </FlexView>
    <FlexView flex={0} justifyContent="flex-end" {...props} />
  </FlexColumn>
);

WithLabel.propTypes = {
  label: PropTypes.string.isRequired,
};

const VaccinatorDropDown = ({ value, onChange }) => {
  const medicineAdmins = UIDatabase.objects('MedicineAdministrator').sorted('lastName');
  const values = medicineAdmins.map(({ displayString }) => displayString);

  return (
    <DropDown
      style={styles.dropdown}
      values={values}
      onValueChange={(_, i) => onChange(medicineAdmins[i])}
      selectedValue={value?.displayString}
    />
  );
};

VaccinatorDropDown.defaultProps = {
  value: null,
};

VaccinatorDropDown.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

const VaccinePrescriptionInfoComponent = ({
  patientName,
  onSelectVaccinator,
  vaccinator,
  onRefuse,
  hasRefused,
}) => (
  <Paper
    headerText={vaccineStrings.vaccine_dispense_step_three_title}
    style={{ flex: 2 }}
    contentContainerStyle={{ flex: 1 }}
  >
    <FlexRow flex={1} justifyContent="center" alignItems="center">
      <FlexRow flex={1} alignItems="center">
        <WithLabel label={vaccineStrings.vaccinator}>
          <VaccinatorDropDown onChange={onSelectVaccinator} value={vaccinator} />
        </WithLabel>
      </FlexRow>

      <WithLabel label={dispensingStrings.patient}>
        <Text style={styles.valueText}>{patientName}</Text>
      </WithLabel>

      <Spacer space={50} />

      <FlexRow flex={0} alignItems="center" justifyContent="space-between">
        <Text style={styles.labelText}>{dispensingStrings.refused_vaccine}</Text>

        <CheckBox
          onValueChange={onRefuse}
          value={hasRefused}
          tintColors={{ true: SUSSOL_ORANGE, false: DARKER_GREY }}
        />
      </FlexRow>
    </FlexRow>
  </Paper>
);

const mapDispatchToProps = dispatch => {
  const onSelectVaccinator = vaccinator =>
    dispatch(VaccinePrescriptionActions.selectVaccinator(vaccinator));
  const onRefuse = value => dispatch(VaccinePrescriptionActions.setRefusal(value));

  return { onSelectVaccinator, onRefuse };
};

const mapStateToProps = state => {
  const patientName = selectFullName(state);
  const hasRefused = selectHasRefused(state);
  const vaccinator = selectSelectedVaccinator(state);

  return {
    patientName,
    vaccinator,
    hasRefused,
  };
};

VaccinePrescriptionInfoComponent.defaultProps = {
  vaccinator: null,
};

VaccinePrescriptionInfoComponent.propTypes = {
  patientName: PropTypes.string.isRequired,
  onSelectVaccinator: PropTypes.func.isRequired,
  vaccinator: PropTypes.object,
  onRefuse: PropTypes.func.isRequired,
  hasRefused: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  labelText: {
    fontSize: 12,
    color: DARKER_GREY,
    fontFamily: APP_FONT_FAMILY,
  },
  valueText: {
    marginTop: 5,
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
  },
  dropdown: { height: 20, marginTop: 0, marginBottom: 0, marginLeft: 0 },
});

export const VaccinePrescriptionInfo = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccinePrescriptionInfoComponent);
