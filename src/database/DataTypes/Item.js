import Realm from 'realm';
import { getTotal } from '../utilities';

export class Item extends Realm.Object {
  get totalQuantity() {
    return getTotal(this.lines, 'totalQuantity');
  }

  addLine(itemLine) {
    // If the line is already in the item, we don't want to add it again
    if (this.lines.find(currentItemLine => currentItemLine.id === itemLine.id)) return;
    this.lines.push(itemLine);
  }

  toString() {
    return `${this.code} - ${this.name}`;
  }
}
