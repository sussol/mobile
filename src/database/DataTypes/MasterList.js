import Realm from 'realm';

export class MasterList extends Realm.Object {
  addLine(masterListLine) {
    // If the line is already in the list, we don't want to add it again
    if (this.lines.find(currentLine => currentLine.id === masterListLine.id)) return;
    this.lines.push(masterListLine);
  }
}
