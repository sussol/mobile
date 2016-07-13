import { RealmDatabase } from './RealmDatabase';

export class Database extends RealmDatabase {

  objects(type) {
    let results = super.objects(type);
    switch (type) {
      case 'Item':
        results = results.filtered('isVisible == true');
        break;
      default:
        break;
    }
    return results;
  }

}
