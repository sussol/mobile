import Realm from 'realm';

export class Address extends Realm.Object {}
export class Item extends Realm.Object {}
export { ItemLine } from './ItemLine';
export class ItemDepartment extends Realm.Object {}
export class ItemCategory extends Realm.Object {}
export { Transaction } from './Transaction';
export class TransactionCategory extends Realm.Object {}
export { TransactionLine } from './TransactionLine';
export class MasterList extends Realm.Object {}
export class MasterListLine extends Realm.Object {}
export class Name extends Realm.Object {}
export class Requisition extends Realm.Object {}
export class RequisitionLine extends Realm.Object {}
export class Setting extends Realm.Object {}
export class SyncOut extends Realm.Object {}
export class Stocktake extends Realm.Object {}
export class StocktakeLine extends Realm.Object {}
export class User extends Realm.Object {}
