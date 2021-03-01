import { selectSpecificEntityState } from './index';

export const selectNewVaccinePrescription = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { newId, byId } = VaccinePrescriptionState;
  return byId[newId];
};

export const selectNewVaccinePrescriptionId = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { newId } = VaccinePrescriptionState;
  return newId;
};

export const selectEditingVaccinePrescription = state => {
  const VaccinePrescriptionState = selectSpecificEntityState(state, 'vaccinePrescription');
  const { editingId, byId } = VaccinePrescriptionState;
  return byId[editingId];
};
