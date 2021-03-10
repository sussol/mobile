import { NAME_ACTIONS } from '../../actions/Entities';
import { WIZARD_ACTIONS } from '../../actions/WizardActions';

const initialState = () => ({
  editing: undefined,
  isAscending: true,
  searchParameters: {
    firstName: '', // string
    lastName: '', // string
    dateOfBirth: undefined, // Date
  },
  sortKey: 'firstName',
});

export const NameReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case WIZARD_ACTIONS.SWITCH_TAB: {
      const { payload } = action;
      const { tab } = payload;

      if (tab === 0) return initialState();

      return state;
    }

    case NAME_ACTIONS.RESET:
    case 'Navigation/BACK': {
      // reset if heading back
      return initialState();
    }

    case NAME_ACTIONS.CREATE: {
      const { payload } = action;
      const { name } = payload;

      return { ...state, editing: name };
    }

    case NAME_ACTIONS.SELECT: {
      const { payload } = action;
      const { name } = payload;

      return { ...state, editing: name.toJSON() };
    }

    case NAME_ACTIONS.UPDATE: {
      const { editing: oldName } = state;
      const { payload } = action;
      const { field, value } = payload;

      const newName = { ...oldName, [field]: value };

      return { ...state, editing: newName };
    }

    case NAME_ACTIONS.FILTER: {
      const { searchParameters: oldParameters } = state;
      const { payload } = action;
      const { key, value } = payload;
      const searchParameters = { ...oldParameters, [key]: value };

      return { ...state, searchParameters };
    }

    case NAME_ACTIONS.SORT: {
      const { payload } = action;
      const { sortKey } = payload;

      return { ...state, sortKey };
    }
    default: {
      return state;
    }
  }
};
