/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * An abstract object which contains metadata describing an indicator row or column.
 *
 * @property  {string}            id
 * @property  {ProgramIndicator}  indicator
 * @property  {string}            description
 * @property  {string}            code
 * @property  {number}            index
 * @property  {boolean}           isRequired
 * @property  {string}            valueType
 * @property  {string}            defaultValue
 * @property  {string}            axis
 * @property  {boolean}           isActive
 */
export class IndicatorAttribute extends Realm.Object {
  /**
   * Get if an attribute is a row.
   */
  get isRow() {
    return this.axis === 'row';
  }

  /**
   * Get if an attribute is a column.
   */
  get isColumn() {
    return this.axis === 'column';
  }

  /**
   * Add a value to this indicator.
   *
   * @param {IndicatorValue} indicatorValue
   */
  addIndicatorValue(indicatorValue) {
    this.values.push(indicatorValue);
  }
}

export default IndicatorAttribute;

IndicatorAttribute.schema = {
  name: 'IndicatorAttribute',
  primaryKey: 'id',
  properties: {
    id: 'string',
    indicator: { type: 'ProgramIndicator', optional: true },
    description: { type: 'string', default: 'placeholderDescription' },
    code: { type: 'string', default: 'placeholderCode' },
    index: { type: 'int', default: 0 },
    isRequired: { type: 'bool', default: true },
    valueType: { type: 'string', default: 'string' },
    defaultValue: { type: 'string', default: '' },
    axis: { type: 'string', default: 'row' },
    isActive: { type: 'bool', default: false },
    values: { type: 'list', objectType: 'IndicatorValue' },
  },
};
