import { NAME_NOTE_ACTIONS } from '../../actions/Entities';

const initialState = () => ({
  creating: {
    id: '',
    data: {},
    patientEventID: '',
    nameID: '',
    entryDate: 0,
  },
  isValid: false,
});

export const NameNoteReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case NAME_NOTE_ACTIONS.RESET:
    case 'Navigation/BACK': {
      // reset if heading back
      return initialState();
    }

    case NAME_NOTE_ACTIONS.SELECT: {
      const { payload } = action;
      const { nameNote, isValid } = payload;

      return {
        ...state,
        creating: nameNote,
        isValid,
      };
    }

    case NAME_NOTE_ACTIONS.UPDATE_DATA: {
      const { payload } = action;
      const { data, errors } = payload;
      const { creating } = state;
      const { data: currentData } = creating;

      const isValid = !(errors?.length > 0);
      const newData = { ...currentData, ...data };
      const newCreating = { ...creating, data: newData };

      return { ...state, creating: newCreating, isValid };
    }

    default: {
      return state;
    }
  }
};
