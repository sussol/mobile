/* eslint-disable no-underscore-dangle */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import checkIsObject from '../utilities';
/**
 * Dashboard Report.
 *
 * @property  {string}  id      Unique identifier for each Report
 * @property  {string}  type    Defines if the chart is PieChart, BarChart, LineChart or Table.
 * @property  {string}  title   Title of the Report
 * @property  {string}  _data   Data for the chart defined by the type (see above)
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
    this._data = checkIsObject(dataObject) ? JSON.stringify(dataObject) : JSON.stringify({});
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
