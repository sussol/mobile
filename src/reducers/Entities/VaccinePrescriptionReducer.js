import { VACCINE_PRESCRIPTION_ACTIONS } from '../../actions/Entities';
import { UIDatabase } from '../../database';

const initialState = () => ({
  creating: undefined,
  selectedVaccines: [],
  vaccines: UIDatabase.objects('Vaccine'),
});

export const VaccinePrescriptionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/BACK': {
      // reset if heading back
      return initialState();
    }

    case VACCINE_PRESCRIPTION_ACTIONS.CREATE: {
      const { payload } = action;
      const { prescription } = payload;

      return { ...state, creating: prescription };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.SAVE: {
      const { payload } = action;
      const { prescription } = payload;

      return { ...state, creating: prescription.toJSON() };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINE: {
      const { payload } = action;
      const { vaccine } = payload;

      return { ...state, selectedVaccines: [vaccine] };
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
