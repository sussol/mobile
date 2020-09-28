/* eslint-disable import/prefer-default-export */

/**
 * Initializer for state/resetter
 */

export const initialState = ({ transactionType }) => ({
  program: null,
  supplier: null,
  period: null,
  orderType: null,
  name: '',
  currentKey: '',
  isProgramBased: true,
  isModalOpen: false,
  steps: STEPS[transactionType][getType({ isProgramBased: true })],
  transactionType,
});

/**
 * Action constants for ByProgramReducer
 */
const actions = {
  SELECT_PROGRAM: 'selectProgram',
  SELECT_SUPPLIER: 'selectSupplier',
  SELECT_CUSTOMER: 'selectCustomer',
  SELECT_ORDER_TYPE: 'selectOrderType',
  SELECT_PERIOD: 'selectPeriod',
  SET_TOGGLE: 'setToggle',
  SET_MODAL_OPEN: 'setModalOpen',
  SET_MODAL_CLOSED: 'setModalClosed',
  SET_STORE_TAGS: 'setStoreTags',
  SET_STEPS: 'setSteps',
  SET_NAME: 'setName',
};

const STEPS = {
  requisition: {
    program: ['supplier', 'program', 'orderType', 'period'],
    general: ['supplier'],
  },
  customerRequisition: {
    program: ['customer', 'program', 'orderType', 'period'],
    general: ['customer'],
  },
  stocktake: {
    program: ['program', 'name'],
    general: ['name'],
  },
};

const TYPES = {
  PROGRAM: 'program',
  GENERAL: 'general',
};

const getType = ({ isProgramBased }) => (isProgramBased ? TYPES.PROGRAM : TYPES.GENERAL);

/**
 * Action Creators for ByProgramReducer
 */

export const setSteps = value => ({
  type: actions.SET_STEPS,
  value,
});

export const selectProgram = value => ({
  type: actions.SELECT_PROGRAM,
  value,
});

export const selectSupplier = value => ({
  type: actions.SELECT_SUPPLIER,
  value,
});

export const selectCustomer = value => ({
  type: actions.SELECT_CUSTOMER,
  value,
});

export const selectOrderType = value => ({
  type: actions.SELECT_ORDER_TYPE,
  value,
});

export const selectPeriod = value => ({
  type: actions.SELECT_PERIOD,
  value,
});

export const setName = value => ({
  type: actions.SET_NAME,
  value,
});

export const setModalOpen = value => ({
  type: actions.SET_MODAL_OPEN,
  value,
});

export const setModalClosed = () => ({
  type: actions.SET_MODAL_CLOSED,
});

export const setToggle = value => ({
  type: actions.SET_TOGGLE,
  value,
});

export const setStoreTags = value => ({
  type: actions.SET_STORE_TAGS,
  value,
});

/**
 * Reducer to handle the state management of
 * ByProgramModal
 */
export const byProgramReducer = (state, action) => {
  const { type, value } = action;
  switch (type) {
    case actions.SELECT_PROGRAM:
      return {
        ...state,
        program: value,
        orderType: null,
        period: null,
        name: '',
        isModalOpen: false,
        complete: false,
      };
    case actions.SELECT_CUSTOMER:
      return {
        ...state,
        customer: value,
        program: null,
        orderType: null,
        period: null,
        name: '',
        isModalOpen: false,
        complete: false,
      };
    case actions.SELECT_SUPPLIER:
      return {
        ...state,
        supplier: value,
        program: null,
        orderType: null,
        period: null,
        name: '',
        isModalOpen: false,
        complete: false,
      };

    case actions.SELECT_ORDER_TYPE:
      return {
        ...state,
        orderType: value,
        period: null,
        name: '',
        isModalOpen: false,
        complete: false,
      };
    case actions.SELECT_PERIOD:
      return {
        ...state,
        period: value,
        name: '',
        isModalOpen: false,
        complete: true,
      };
    case actions.SET_NAME:
      return {
        ...state,
        isModalOpen: false,
        complete: true,
        name: value,
      };
    case actions.SET_MODAL_DATA:
      return {
        ...state,
        modalData: value,
      };
    case actions.SET_TOGGLE: {
      const { isProgramBased, transactionType } = state;
      const newIsProgramBased = !isProgramBased;
      const steps = STEPS[transactionType][getType({ isProgramBased: newIsProgramBased })];
      return {
        ...state,
        program: null,
        supplier: null,
        orderType: null,
        period: null,
        name: '',
        isProgramBased: newIsProgramBased,
        steps,
        complete: false,
        currentKey: null,
      };
    }
    case actions.SET_MODAL_OPEN: {
      const { selection, key: currentKey } = value;
      return {
        ...state,
        isModalOpen: true,
        currentKey,
        modalData: selection,
      };
    }
    case actions.SET_MODAL_CLOSED:
      return {
        ...state,
        isModalOpen: false,
        currentKey: null,
      };
    case actions.SET_STORE_TAGS:
      return {
        ...state,
        storeTags: value,
      };
    default:
      return state;
  }
};
