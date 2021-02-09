import { DOWNLOAD_ACTIONS } from '../../actions/Bluetooth/SensorDownloadActions';
import { SENSOR_ACTIONS } from '../../actions/Entities/SensorActions';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';

// Extracts the required fields of a realm instance into a plain JS object
// which is more suitable to store in redux as immutable updates are simpler.
const getPlainSensor = sensor => ({
  id: sensor.id,
  macAddress: sensor.macAddress,
  name: sensor.name,
  batteryLevel: sensor.batteryLevel,
  locationID: sensor.location?.id,
  breachConfigIDs: sensor?.breachConfigs?.map(({ id }) => id),
  isActive: sensor.isActive,
  logInterval: sensor.logInterval,
  logDelay: new Date(sensor.logDelay).getTime(),
  currentTemperature: sensor?.currentTemperature ?? null,
  mostRecentBreachTime: sensor?.mostRecentBreachTime?.getTime(),
  isInHotBreach: sensor?.isInHotBreach,
  isInColdBreach: sensor?.isInColdBreach,
});

const initialState = () => ({
  byId: UIDatabase.objects('Sensor').reduce(
    (acc, sensor) => ({
      ...acc,
      [sensor.id]: getPlainSensor(sensor),
    }),
    {}
  ),
  newId: '',
  editingId: '',
});

export const SensorReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { params, routeName } = action;

      if (routeName !== ROUTES.SENSOR_EDIT) return state;
      const { sensor } = params;
      const { id } = sensor;

      return { ...state, editingId: id };
    }

    case DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_SUCCESS: {
      const { payload } = action;
      const { sensor } = payload;
      const { id, currentTemperature } = sensor;
      const { byId } = state;
      const oldSensor = byId[id];

      const newSensor = { ...oldSensor, currentTemperature };
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

    case SENSOR_ACTIONS.SAVE_NEW: {
      const { byId } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { id } = sensor;

      const newById = { ...byId, [id]: sensor };

      return { ...state, byId: newById, newId: '' };
    }

    case SENSOR_ACTIONS.SAVE_EDITING: {
      const { byId } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { id } = sensor;

      // Only use plain objects.
      const newById = { ...byId, [id]: getPlainSensor(sensor) };

      return { ...state, byId: newById, editingId: '' };
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
