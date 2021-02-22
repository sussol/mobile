import { DOWNLOAD_ACTIONS } from '../../actions/Bluetooth/SensorDownloadActions';
import { BREACH_ACTIONS } from '../../actions/BreachActions';
import { SENSOR_ACTIONS } from '../../actions/Entities/SensorActions';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';
import { SYNC_TRANSACTION_COMPLETE } from '../../sync/constants';

const getById = () =>
  UIDatabase.objects('Sensor').reduce(
    (acc, sensor) => ({
      ...acc,
      [sensor.id]: sensor.toJSON(),
    }),
    {}
  );

const initialState = () => ({
  byId: getById(),
  newId: '',
  editingId: '',
  replacedId: '',
});

export const SensorReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case SYNC_TRANSACTION_COMPLETE: {
      const newById = getById();
      return { ...state, byId: newById };
    }

    case 'Navigation/NAVIGATE': {
      const { params, routeName } = action;

      if (routeName !== ROUTES.SENSOR_EDIT) return state;
      const { sensor } = params;
      const { id } = sensor;

      return { ...state, editingId: id };
    }

    case BREACH_ACTIONS.CREATE_CONSECUTIVE_SUCCESS: {
      const { payload } = action;
      const { sensor } = payload;
      const { id } = sensor;

      const { byId } = state;

      const newSensor = sensor.toJSON();
      const newById = { ...byId, [id]: newSensor };

      return { ...state, byId: newById };
    }
    case DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_SUCCESS: {
      const { payload } = action;
      const { sensor } = payload;
      const { id } = sensor;
      const { byId } = state;

      const newSensor = sensor.toJSON();
      const newById = { ...byId, [id]: newSensor };

      return { ...state, byId: newById };
    }

    case SENSOR_ACTIONS.CREATE: {
      const { byId } = state;
      const { payload } = action;
      const { id } = payload;

      return { ...state, byId: { ...byId, [id]: payload }, newId: id };
    }

    case SENSOR_ACTIONS.RESET: {
      return initialState();
    }

    case SENSOR_ACTIONS.REPLACE: {
      const { payload } = action;
      const { macAddress, id } = payload;
      const { byId, editingId } = state;

      const oldSensor = byId[editingId];
      const newSensor = { ...oldSensor, macAddress, id };
      const newById = { ...byId, [id]: newSensor };

      return { ...state, byId: newById, replacedId: editingId, editingId: id };
    }

    case SENSOR_ACTIONS.SAVE_NEW: {
      const { byId } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { id } = sensor;

      const newById = { ...byId, [id]: sensor.toJSON() };

      return { ...state, byId: newById, newId: '' };
    }

    case SENSOR_ACTIONS.SAVE_EDITING: {
      const { byId } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { id } = sensor;

      const newById = { ...byId, [id]: sensor.toJSON() };

      return { ...state, byId: newById, editingId: '', replacedId: '' };
    }

    case SENSOR_ACTIONS.REMOVE: {
      const { payload } = action;
      const { id } = payload;
      const { byId } = state;
      const oldSensor = byId[id];

      const newSensor = { ...oldSensor, isActive: false };
      const newById = { ...byId, [id]: newSensor };

      return { ...state, byId: newById };
    }

    case SENSOR_ACTIONS.UPDATE: {
      const { byId } = state;
      const { payload } = action;
      const { id, field, value } = payload;

      if (field === 'name' && value?.length > 50) return state;
      if (field === 'code' && value?.length > 10) return state;

      const newSensorState = { ...byId[id], [field]: value };
      const newById = { ...byId, [id]: newSensorState };

      return { ...state, byId: newById };
    }

    default: {
      return state;
    }
  }
};
