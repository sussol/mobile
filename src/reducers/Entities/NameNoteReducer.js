import { NAME_NOTE_ACTIONS } from '../../actions/Entities';

const initialState = () => ({
  creatingById: {},
  editingById: {},
  creatingId: '',
  editingId: '',
});

export const NameNoteReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case NAME_NOTE_ACTIONS.CREATE: {
      const { creatingById } = state;
      const { payload } = action;
      const { nameNote } = payload;
      const { id } = nameNote;

      return { ...state, creatingById: { ...creatingById, [id]: payload }, creatingId: id };
    }

    case NAME_NOTE_ACTIONS.EDIT: {
      const { creatingById, editingById } = state;
      const { payload } = action;
      const { nameNote } = payload;
      const { id } = nameNote;

      return {
        ...state,
        editingById: { ...editingById, [id]: payload },
        creatingById: { ...creatingById, [id]: payload },
        editingId: id,
      };
    }

    case NAME_NOTE_ACTIONS.SAVE_EDITING: {
      const { editingById } = state;
      const { payload } = action;
      const { nameNote } = payload;
      const { id } = nameNote;

      const newEditingById = { ...editingById, [id]: nameNote };

      return { ...state, editingById: newEditingById, editingId: '' };
    }

    case NAME_NOTE_ACTIONS.SAVE_NEW: {
      const { creatingById } = state;
      const { payload } = action;
      const { nameNote } = payload;
      const { id } = nameNote;

      const newCreatingById = { ...creatingById, [id]: nameNote, creatingId: '' };

      return { ...state, creatingById: newCreatingById };
    }

    case NAME_NOTE_ACTIONS.RESET: {
      return initialState();
    }

    case NAME_NOTE_ACTIONS.UPDATE: {
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
