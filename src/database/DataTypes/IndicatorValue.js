/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import {
  INDICATOR_CODES,
  INDICATOR_COLUMN_CODES,
  INDICATOR_VALUE_TYPES,
} from '../utilities/constants';
import { parsePositiveInteger } from '../../utilities';

/**
 * An abstract object which contains metadata describing an indicator row or column.
 *
 * @property  {string}              id
 * @property  {string}              storeId
 * @property  {Period}              period
 * @property  {IndicatorAttribute}  column
 * @property  {IndicatorAttribute}  row
 * @property  {string}              value
 */
export class IndicatorValue extends Realm.Object {
  get indicator() {
    return this.row.indicator ?? this.column.indicator;
  }

  get value() {
    return this._value;
  }

  get valueType() {
    if (this.indicator.code === INDICATOR_CODES.REGIMEN) {
      return this.column.code === INDICATOR_COLUMN_CODES.REGIMEN_VALUE
        ? this.row.valueType
        : INDICATOR_VALUE_TYPES.STRING;
    }
    return this.column.valueType;
  }

  set value(value) {
    this._value =
      this.valueType === INDICATOR_VALUE_TYPES.STRING ? value : String(parsePositiveInteger(value));
  }
}

IndicatorValue.schema = {
  name: 'IndicatorValue',
  primaryKey: 'id',
  properties: {
    id: 'string',
    storeId: 'string',
    period: 'Period',
    column: 'IndicatorAttribute',
    row: 'IndicatorAttribute',
    _value: 'string',
  },
};
