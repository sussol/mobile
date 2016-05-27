export function integrateRecords(database, records) {
  records.forEach((record) => {
    
  });
}

/**
 * Returns the next batch of incoming sync records
 * @param  {string}  serverURL  The URL of the sync server
 * @param  {string}  thisSiteId The sync ID of this sync site
 * @param  {string}  serverId   The sync ID of the server
 * @param  {integer} numRecords The number of records to fetch
 * @return {Promise}            Resolves with the records, or passes up any error thrown
 */
export async function getIncomingRecords(serverURL, thisSiteId, serverId, numRecords) {
  return await fetch(
    `${serverURL}/sync/v2/queued_records
      ?from_site=${thisSiteId}
      &to_site=${serverId}
      &limit=${numRecords}`,
    {
      method: 'GET',
      headers: {
        Authorization: this.authenticator.getAuthHeader(),
      },
    })
    .then((response) => response.json());
}

/**
 * Returns the number of records left to pull
 * @param  {string} serverURL  The URL of the sync server
 * @param  {string} thisSiteId The sync ID of this sync site
 * @param  {string} serverId   The sync ID of the server
 * @return {Promise}           Resolves with the record count, or passes up any error thrown
 */
export async function getWaitingRecordCount(serverURL, thisSiteId, serverId) {
  return await fetch(
    `${serverURL}/sync/v2/queued_records/count
      ?from_site=${thisSiteId}
      &to_site=${serverId}`,
    {
      method: 'GET',
      headers: {
        Authorization: this.authenticator.getAuthHeader(),
      },
    })
    .then((response) => response.json())
    .then((responseJson) => responseJson.NumRecords);
}
