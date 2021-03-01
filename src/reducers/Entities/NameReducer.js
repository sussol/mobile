import { NAME_ACTIONS } from '../../actions/Entities';

const initialState = () => ({
  editing: undefined,
});

export const NameReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case NAME_ACTIONS.CREATE: {
      const { payload } = action;
      const { name } = payload;

      return { ...state, editing: name };
    }

    case NAME_ACTIONS.SAVE: {
      const { payload } = action;
      const { name } = payload;

      return { ...state, editing: name.toJSON() };
    }

    case NAME_ACTIONS.RESET: {
      return initialState();
    }

    case NAME_ACTIONS.UPDATE: {
      const { editing: oldName } = state;
      const { payload } = action;
      const { field, value } = payload;

      const newName = { ...oldName, [field]: value };

      return { ...state, editing: newName };
    }
    default: {
      return state;
    }
  }
};
