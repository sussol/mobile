/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A Report.
 *
 * @property  {string}            id
 * @property  {string}            type
 * @property  {string}            title
 * @property  {string}            _data
 */

export class Report extends Realm.Object {
  /**
   * Get data.
   *
   * @return  {Object}
   */
  get data() {
    return JSON.parse(this._data);
  }

  /**
   * Set data.
   *
   * @param  {dataObject}  dataObject
   */
  set data(dataObject) {
    this._data = JSON.stringify(dataObject);
  }
}

Report.schema = {
  name: 'Report',
  primaryKey: 'id',
  properties: {
    id: 'string',
    type: 'string',
    title: 'string',
    _data: 'string',
  },
};

export default Report;
