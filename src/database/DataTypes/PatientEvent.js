import Realm from 'realm';

export class PatientEvent extends Realm.Object {}

PatientEvent.schema = {
  name: 'PatientEvent',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: { type: 'string', default: 'PlaceholderCode' },
    description: { type: 'string', default: 'PlaceholderDescription' },
    eventType: { type: 'string', default: 'PlaceholderEventType' },
    unit: { type: 'string', default: 'PlaceholderUnit' },
  },
};

export default PatientEvent;
