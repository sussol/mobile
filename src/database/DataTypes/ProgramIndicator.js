/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A program indicator functions as a many-to-one join and grouping mechanism for mapping sets of
 * indicator rows and columns to programs.
 *
 * @property  {string}      id
 * @property  {string}      code
 * @property  {MasterList}  program
 * @property  {boolean}     isActive
 */
export class ProgramIndicator extends Realm.Object {
  /**
   * Add an attribute to this indicator.
   *
   * @param {IndicatorAttribute} indicatorAttribute
   */
  addIndicatorAttribute(indicatorAttribute) {
    if (indicatorAttribute.isRow) {
      this.rows.push(indicatorAttribute);
    }
    if (indicatorAttribute.isColumn) {
      this.columns.push(indicatorAttribute);
    }
  }

  /**
   * Add an attribute to this indicator.
   *
   * @param {IndicatorAttribute} indicatorAttribute
   */
  addIndicatorAttributeIfUnique(indicatorAttribute) {
    const isUnique = !(
      this.rows.filtered('id == $0', indicatorAttribute.id).length > 0 ||
      this.columns.filtered('id == $0', indicatorAttribute.id).length > 0
    );
    if (isUnique) this.addIndicatorAttribute(indicatorAttribute);
  }
}

export default ProgramIndicator;

ProgramIndicator.schema = {
  name: 'ProgramIndicator',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: { type: 'string', default: 'placeholderCode' },
    program: { type: 'MasterList', optional: true },
    isActive: { type: 'bool', default: false },
    rows: { type: 'list', objectType: 'IndicatorAttribute' },
    columns: { type: 'list', objectType: 'IndicatorAttribute' },
  },
};
