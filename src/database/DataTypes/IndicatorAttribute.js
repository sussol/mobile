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
 * @property  {string}            valueDefault
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
}

export default IndicatorAttribute;

IndicatorAttribute.schema = {
  name: 'IndicatorAttribute',
  primaryKey: 'id',
  properties: {
    id: 'string',
    indicator: 'ProgramIndicator',
    description: { type: 'string', default: 'placeholderDescription' },
    code: { type: 'string', default: 'placeholderCode' },
    index: { type: 'int', default: 0 },
    isRequired: { type: 'bool', default: true },
    valueType: { type: 'string', default: 'string' },
    valueDefault: { type: 'string', default: 'string' },
    axis: { type: 'string', default: 'row' },
    isActive: { type: 'bool', default: false },
  },
};
