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
export class User extends Realm.Object {}

export { Abbreviation } from './Abbreviation';
export { Currency } from './Currency';
export { IndicatorAttribute } from './IndicatorAttribute';
export { IndicatorValue } from './IndicatorValue';
export { InsurancePolicy } from './InsurancePolicy';
export { InsuranceProvider } from './InsuranceProvider';
export { Item } from './Item';
export { ItemBatch } from './ItemBatch';
export { ItemDirection } from './ItemDirection';
export { ItemStoreJoin } from './ItemStoreJoin';
export { Location } from './Location';
export { LocationMovement } from './LocationMovement';
export { LocationType } from './LocationType';
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
export { Prescriber } from './Prescriber';
export { Preference } from './Preference';
export { ProgramIndicator } from './ProgramIndicator';
export { SensorLog } from './SensorLog';
export { Report } from './Report';
export { Requisition } from './Requisition';
export { RequisitionItem } from './RequisitionItem';
export { Sensor } from './Sensor';
export { Stocktake } from './Stocktake';
export { StocktakeBatch } from './StocktakeBatch';
export { StocktakeItem } from './StocktakeItem';
export { TemperatureBreach } from './TemperatureBreach';
export { TemperatureBreachConfiguration } from './TemperatureBreachConfiguration';
export { TemperatureLog } from './TemperatureLog';
export { Transaction } from './Transaction';
export { TransactionBatch } from './TransactionBatch';
export { TransactionItem } from './TransactionItem';
export { Unit } from './Unit';
export { VaccineVialMonitorStatus } from './VaccineVialMonitorStatus';
export { VaccineVialMonitorStatusLog } from './VaccineVialMonitorStatusLog';
export { NameTag } from './NameTag';
export { NameTagJoin } from './NameTagJoin';
