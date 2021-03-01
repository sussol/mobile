import { VACCINE_PRESCRIPTION_ACTIONS } from '../../actions/Entities';

const initialState = () => ({
  creating: undefined,
});

export const VaccinePrescriptionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case VACCINE_PRESCRIPTION_ACTIONS.CREATE: {
      const { payload } = action;
      const { prescription } = payload;

      return { ...state, byId: { creating: prescription } };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.SAVE: {
      const { payload } = action;
      const { prescription } = payload;

      return { ...state, creating: prescription.toJSON() };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.RESET: {
      return initialState();
    }

    case VACCINE_PRESCRIPTION_ACTIONS.UPDATE: {
      const { creating: oldPrescription } = state;
      const { payload } = action;
      const { field, value } = payload;

      const newPrescription = { ...oldPrescription, [field]: value };

      return { ...state, creating: newPrescription };
    }
    default: {
      return state;
    }
  }
};
