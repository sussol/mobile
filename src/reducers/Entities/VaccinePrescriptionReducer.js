import { VACCINE_PRESCRIPTION_ACTIONS } from '../../actions/Entities';
import { UIDatabase } from '../../database';

const initialState = () => ({
  creating: undefined,
  hasRefused: false,
  selectedVaccines: [],
  selectedBatches: [],
  vaccines: UIDatabase.objects('Vaccine'),
});

export const VaccinePrescriptionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case VACCINE_PRESCRIPTION_ACTIONS.RESET:
    case 'Navigation/BACK': {
      // reset if heading back
      return initialState();
    }

    case VACCINE_PRESCRIPTION_ACTIONS.CREATE: {
      const { payload } = action;
      const { prescription } = payload;

      return { ...state, creating: prescription };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINE: {
      const { payload } = action;
      const { vaccine } = payload;
      const { batches } = vaccine;
      const selectedBatches = [];
      // select the recommended batch
      if (batches?.length) {
        const batchesByExpiry = batches.sorted('expiryDate');
        const openVials = batchesByExpiry.filter(b => !Number.isInteger(b.numberOfPacks));

        const selectedBatch = openVials.length ? openVials[0] : batchesByExpiry[0];
        selectedBatches.push(selectedBatch);
      }

      return { ...state, selectedVaccines: [vaccine], selectedBatches };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.SELECT_BATCH: {
      const { payload } = action;
      const { itemBatch } = payload;

      return { ...state, selectedBatches: [itemBatch] };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.UPDATE: {
      const { creating: oldPrescription } = state;
      const { payload } = action;
      const { field, value } = payload;

      const newPrescription = { ...oldPrescription, [field]: value };

      return { ...state, creating: newPrescription };
    }

    case VACCINE_PRESCRIPTION_ACTIONS.REFUSE_VACCINATION: {
      const { payload } = action;
      const { value } = payload;

      return { ...state, hasRefused: value };
    }

    default: {
      return state;
    }
  }
};
