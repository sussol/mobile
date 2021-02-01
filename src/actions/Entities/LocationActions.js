import { generateUUID } from 'react-native-database';

export const LOCATION_ACTIONS = {
  CREATE: 'LOCATION/create',
};

const createDefaultLocation = () => ({
  id: generateUUID(),
});

const create = () => ({
  type: LOCATION_ACTIONS.CREATE,
  payload: createDefaultLocation,
});

export const LocationActions = {
  create,
};
