/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import LocalizedStrings from 'react-native-localization';

export const syncStrings = new LocalizedStrings({
  gb: {
    last_sync: 'LAST SYNC',
    manual_sync: 'Manual Sync',
    sync_enabled: 'SYNC ENABLED',
    sync_error: 'SYNC ERROR',
    sync_in_progress: 'SYNC IN PROGRESS',
    checking_server_for_records: 'Checking server for records...',
    records_waiting: 'Records Waiting',
    sync_complete: 'Sync Complete',
    all_records_updated: 'All records updated.',
    loading_change_count: 'Loading change count...',
  },
  fr: {
    last_sync: 'Dernier SYNC',
    manual_sync: 'SYNC Manuel',
    sync_enabled: 'SYNC Activé',
    sync_error: 'Erreur Sync',
    sync_in_progress: 'SYNC en cours',
    checking_server_for_records: 'Vérifier le serveur pour des enregistrements',
    records_waiting: 'Enregistrements en attente',
    sync_complete: 'Sync complété',
    all_records_updated: 'Tous les enregistrements ont été mis à jour',
    loading_change_count: 'Chargement du nombre de changements',
  },
  // Add |checking_server_for_records|, |records_waiting|, |sync_complete|, |all_records_updated|,
  // |loading_change_count|
  gil: {
    last_sync: 'LAST SYNC',
    manual_sync: 'Manual Sync',
    sync_enabled: 'SYNC ENABLED',
    sync_error: 'SYNC ERROR',
    sync_in_progress: 'SYNC IN PROGRESS',
  },
  // Add |checking_server_for_records|, |records_waiting|, |sync_complete|, |all_records_updated|,
  // |loading_change_count|
  tl: {
    last_sync: 'SYNC FOIN DADAUN',
    manual_sync: 'Synk Manual',
    sync_enabled: 'HAMORIS SYNC',
    sync_error: 'SYNC SALA',
    sync_in_progress: "SYNC LA'O HELA",
  },
});

export default syncStrings;
