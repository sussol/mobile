import { generateUUID } from 'react-native-database';

export class UtilService {
  createUuid = () => generateUUID();
}
