import { selectSpecificEntityState } from './index';

export const selectEditingVaccinePrescriptionId = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { creating } = VaccinePrescriptionState;
  const { id } = creating;
  return id;
};

export const selectEditingVaccinePrescription = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { creating } = VaccinePrescriptionState;
  return creating;
};
