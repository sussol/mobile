export function getStoreId(database) {
  const results = database.objects('Setting').filtered('key == StoreID');
  if (results) return results[0];
  return ''; // Return empty string if no store ID stored (shouldn't happen)
}
