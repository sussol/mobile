/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';
import moment from 'moment';

export class TemperatureBreach extends Realm.Object {
  get colour() {
    return this.temperatureBreachConfiguration.colour ?? null;
  }

  get maximumTemperature() {
    return this.temperatureLogs.max('temperature');
  }

  get minimumTemperature() {
    return this.temperatureLogs.min('temperature');
  }

  get temperatureExposure() {
    const { maximumTemperature, minimumTemperature } = this;

    return { maximumTemperature, minimumTemperature };
  }

  get locationString() {
    return this.location?.description;
  }

  get temperature() {
    return this.temperatureLogs?.[0]?.temperature ?? 0;
  }

  get timestamp() {
    return this.temperatureLogs?.[0]?.timestamp ?? new Date(null);
  }

  get duration() {
    return moment.duration(
      moment(this.endTimestamp ?? new Date()).diff(moment(this.startTimestamp))
    );
  }

  affectedBatches(database) {
    return this.location.batchesAtTime(database, this.endTimestamp);
  }

  numberOfAffectedBatches(database) {
    return this.affectedBatches(database)?.length ?? 0;
  }

  affectedQuantity(database) {
    const affectedBatches = this.affectedBatches(database);

    if (!affectedBatches?.length) return 0;

    const itemBatchQuery = affectedBatches.map(({ id }) => `itemBatch.id == "${id}"`).join(' OR ');
    const transactionBatches = database.objects('TransactionBatch').filtered(itemBatchQuery);

    const incomingStock = transactionBatches.filtered(
      'transaction.confirmDate < $0 && (transaction.type == $1 || transaction.type == $2)',
      this.endTimestamp ?? new Date(),
      'supplier_invoice',
      'customer_credit'
    );

    const outgoingStock = transactionBatches.filtered(
      'transaction.confirmDate < $0 && (transaction.type == $1 || transaction.type == $2)',
      this.endTimestamp ?? new Date(),
      'customer_invoice',
      'supplier_credit'
    );

    return incomingStock.sum('numberOfPacks') ?? 0 - outgoingStock.sum('numberOfPacks') ?? 0;
  }

  willContinueBreach(temperatureLog) {
    const { minimumTemperature, maximumTemperature } = this.temperatureBreachConfiguration;
    const { temperature } = temperatureLog;

    return temperature >= minimumTemperature && temperature <= maximumTemperature;
  }
}

TemperatureBreach.schema = {
  name: 'TemperatureBreach',
  primaryKey: 'id',
  properties: {
    id: 'string',
    temperatureLogs: { type: 'linkingObjects', objectType: 'TemperatureLog', property: 'breach' },
    startTimestamp: { type: 'date', optional: true },
    endTimestamp: { type: 'date', optional: true },
    location: { type: 'Location', optional: true },
    temperatureBreachConfiguration: { type: 'TemperatureBreachConfiguration', optional: false },
  },
};

export default TemperatureBreach;
