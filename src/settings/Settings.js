/**
 * Maintains storage of application settings
 */
export class Settings {
  constructor(database) {
    this.database = database;
  }

  set(key, value) {
    this.database.write(() => {
      this.database.update('Setting', {
        key: key,
        value: value,
      });
    });
  }

  get(key) {
    const results = this.database.objects('Setting').filtered('key = $0', key);
    if (results) return results[0];
    return ''; // Return empty string if no setting with the given key
  }
}
