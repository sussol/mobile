/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/* eslint-disable max-classes-per-file */
/* eslint-disable import/no-cycle */

import Realm from 'realm';

export class Address extends Realm.Object {}
export class ItemCategory extends Realm.Object {}
export class ItemDepartment extends Realm.Object {}
export class Setting extends Realm.Object {}
export class SyncOut extends Realm.Object {}
export class TransactionCategory extends Realm.Object {}

export { Item } from './Item';
export { InsurancePolicy } from './InsurancePolicy';
export { InsuranceProvider } from './InsuranceProvider';
export { ItemBatch } from './ItemBatch';
export { ItemStoreJoin } from './ItemStoreJoin';
export { IndicatorAttribute } from './IndicatorAttribute';
export { IndicatorValue } from './IndicatorValue';
export { MasterList } from './MasterList';
export { MasterListItem } from './MasterListItem';
export { MasterListNameJoin } from './MasterListNameJoin';
export { Message } from './Message';
export { Name } from './Name';
export { NameStoreJoin } from './NameStoreJoin';
export { NumberSequence } from './NumberSequence';
export { NumberToReuse } from './NumberToReuse';
export { Options } from './Options';
export { PaymentType } from './PaymentType';
export { Period } from './Period';
export { PeriodSchedule } from './PeriodSchedule';
export { Preference } from './Preference';
export { ProgramIndicator } from './ProgramIndicator';
export { Report } from './Report';
export { Requisition } from './Requisition';
export { RequisitionItem } from './RequisitionItem';
export { Stocktake } from './Stocktake';
export { StocktakeBatch } from './StocktakeBatch';
export { StocktakeItem } from './StocktakeItem';
export { Transaction } from './Transaction';
export { TransactionBatch } from './TransactionBatch';
export { TransactionItem } from './TransactionItem';
export { Unit } from './Unit';
export { User } from './User';
export { Prescriber } from './Prescriber';
export { Abbreviation } from './Abbreviation';
export { ItemDirection } from './ItemDirection';
export { Currency } from './Currency';
