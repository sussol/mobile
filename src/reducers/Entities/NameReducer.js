import { NAME_ACTIONS } from '../../actions/Entities';

const initialState = () => ({
  editing: undefined,
  isAscending: true,
  searchParameters: {
    firstName: '', // string
    lastName: '', // string
    dateOfBirth: undefined, // Date
  },
  sortKey: 'name',
});

export const NameReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
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
      const { payload } = action;
      const { searchParameters } = payload;

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
