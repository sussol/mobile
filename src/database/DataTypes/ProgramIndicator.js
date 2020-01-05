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
export class ProgramIndicator extends Realm.Object {}

export default ProgramIndicator;

ProgramIndicator.schema = {
  name: 'ProgramIndicator',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: { type: 'string', default: 'placeholderCode' },
    program: { type: 'MasterList', optional: true },
    isActive: { type: 'bool', default: false },
  },
};
