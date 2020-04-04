/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-restricted-globals */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import RNFS from 'react-native-fs';

import { SETTINGS_KEYS } from '../settings';
import { PREFERENCE_TYPE_KEYS } from './utilities/constants';
import { formatDate, requestPermission, backupValidation } from '../utilities';

const { THIS_STORE_NAME_ID } = SETTINGS_KEYS;

const translateToCoreDatabaseType = type => {
  switch (type) {
    case 'CustomerInvoice':
    case 'Prescription':
    case 'SupplierInvoice':
    case 'Receipt':
    case 'CustomerCredit':
    case 'Payment':
    case 'CashTransaction':
    case 'SupplierTransaction':
      return 'Transaction';
    case 'CashTransactionName':
    case 'Customer':
    case 'Supplier':
    case 'InternalSupplier':
    case 'ExternalSupplier':
    case 'Patient':
      return 'Name';
    case 'CashTransactionReason':
      return 'Options';
    case 'RequestRequisition':
    case 'ResponseRequisition':
      return 'Requisition';
    case 'RequisitionReason':
    case 'NegativeAdjustmentReason':
    case 'PositiveAdjustmentReason':
      return 'Options';
    case 'Policy':
      return 'InsurancePolicy';
    case 'Provider':
      return 'InsuranceProvider';
    case 'PrescriptionCategory':
    case 'SupplierCreditCategory':
      return 'TransactionCategory';
    case 'Fridge':
      return 'Location';
    default:
      return type;
  }
};

const isBooleanData = data => {
  switch (data.toLowerCase()) {
    case 'true':
    case 'false':
      return true;
    default:
      return false;
  }
};

const isNumericData = data => !isNaN(data);

const isNonNegativeNumericData = data => isNumericData(data) && Number(data) >= 0;

const parseBooleanData = data => (isBooleanData(data) ? JSON.parse(data) : false);

const parseNumericData = data => (isNumericData(data) ? JSON.parse(data) : 0);

const parseNonNegativeNumericData = data => (isNonNegativeNumericData(data) ? JSON.parse(data) : 0);

const parseUntypedData = data => {
  try {
    return JSON.parse(data);
  } catch {
    return '';
  }
};

class UIDatabase {
  constructor(database) {
    this.database = database;
    this.EXPORT_DIRECTORY = '/Download/mSupplyMobile_data';
    this.DEFAULT_EXPORT_FILE = 'msupply-mobile-data';
  }

  ERRORS = {
    ERROR_IN_TRANSACTION: { code: 'ERROR_IN_TRANSACTION', message: 'Database is in a transaction' },
    ERROR_NO_PERMISSION: { code: 'ERROR_NO_PERMISSION', message: 'Storage permission not granted' },
    ERROR_UNKNOWN: { code: 'ERROR_UNKNOWN', message: 'Unkown error occurred' },
  };

  /**
   * Exports the realm file to '/Download/mSupplyMobile\ data' on device file system.
   * Ensures there is enough space, the realm exists and requests storage permission,
   * if required.
   */

  async exportData(filename = this.DEFAULT_EXPORT_FILE) {
    const { realm } = this.database;
    const { path: realmPath } = realm;
    const exportFolder = `${RNFS.ExternalStorageDirectoryPath}${this.EXPORT_DIRECTORY}`;
    // Replace all invalid characters in the android file system with an empty string.
    const copyFileName = `${filename}${formatDate(new Date(), 'dashes')}`.replace(
      /[~\\\\/|?*<:>"+]/g,
      ''
    );

    const permissionParameters = {
      permissionType: 'WRITE_EXTERNAL_STORAGE',
      message: 'Export database',
    };

    // Before requesting permissions, ensure there is enough space and the realm
    // file exists.
    const exportValidation = await backupValidation(realmPath);
    const { success } = exportValidation;
    if (!success) return exportValidation;
    // Request permissions for external storage before trying to backup the realm file.
    const { success: permissionSuccess } = await requestPermission(permissionParameters);
    // If permission was granted, ensure the realm is not in a transaction and backup
    // the realm file.
    if (!permissionSuccess) return { success: false, ...this.ERRORS.ERROR_NO_PERMISSION };
    if (realm.isInTransaction) return { success: false, ...this.ERRORS.ERROR_IN_TRANSACTION };

    // Finally try to create the backup/exported realm
    try {
      await RNFS.mkdir(exportFolder);
      await RNFS.copyFile(realmPath, `${exportFolder}/${copyFileName}.realm`);
    } catch (error) {
      return { success: false, ...this.ERRORS.ERROR_UNKNOWN, error };
    }

    return { success: true };
  }

  objects(type) {
    const results = this.database.objects(translateToCoreDatabaseType(type));
    const thisStoreNameIdSetting = this.database
      .objects('Setting')
      .filtered('key == $0', THIS_STORE_NAME_ID)[0];
    // |ownStoreIdSetting| will not exist if not initialised.
    const thisStoreNameId = thisStoreNameIdSetting && thisStoreNameIdSetting.value;

    switch (type) {
      case 'CustomerInvoice':
        // Only show invoices generated from requisitions once finalised.
        return results.filtered(
          'type == $0 AND (linkedRequisition == $1 OR status == $2)',
          'customer_invoice',
          null,
          'finalised'
        );
      case 'SupplierTransaction': {
        const queryString =
          // eslint-disable-next-line no-multi-str
          '((type == $0 AND mode == $2) OR (type == $1 AND status == $3))\
           AND otherParty.type != $4';
        return results.filtered(
          queryString,
          'supplier_invoice',
          'supplier_credit',
          'store',
          'finalised',
          'inventory_adjustment'
        );
      }
      case 'SupplierInvoice':
        return results.filtered(
          'type == $0 AND mode == $1 AND otherParty.type != $2',
          'supplier_invoice',
          'store',
          'inventory_adjustment'
        );
      case 'Receipt':
        return results.filtered('type == $0', 'receipt');
      case 'Payment':
        return results.filtered('type == $0', 'payment');
      case 'CashTransaction':
        return results.filtered('type == $0 OR type == $1', 'receipt', 'payment');
      case 'CashTransactionName':
        return results
          .filtered('isVisible == true && id != $0', thisStoreNameId)
          .filtered('isSupplier == true || isCustomer == true || isPatient == true');
      case 'CashTransactionReason':
        return results.filtered('type == $0', 'newCashOutTransaction');
      case 'CustomerCredit':
        return results.filtered('type == $0', 'customer_credit');
      case 'Policy':
        return results.filtered(
          'insuranceProvider.isActive == $0 && expiryDate > $1',
          true,
          new Date()
        );
      case 'Provider':
        return results.filtered('isActive == $0', true);
      case 'Customer':
        return results.filtered(
          'isVisible == true AND isCustomer == true AND id != $0 AND isPatient == false',
          thisStoreNameId
        );
      case 'Supplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND id != $0',
          thisStoreNameId
        );
      case 'Patient':
        return results.filtered(
          'isVisible == true AND isPatient == true AND id != $0',
          thisStoreNameId
        );
      case 'InternalSupplier':
        return results.filtered(
          'isVisible == true AND isSupplier == true AND type == "store" AND id != $0',
          thisStoreNameId
        );
      case 'ExternalSupplier':
        return results.filtered('isVisible == true AND isSupplier == true AND type == "facility"');
      case 'Item':
        return results.filtered('isVisible == true');
      case 'RequestRequisition':
        return results.filtered('type == "request"');
      case 'ResponseRequisition':
        return results.filtered('serialNumber != "-1" AND type == "response"');
      case 'NegativeAdjustmentReason':
        return results.filtered('type == $0 && isActive == true', 'negativeInventoryAdjustment');
      case 'PositiveAdjustmentReason':
        return results.filtered('type == $0 && isActive == true', 'positiveInventoryAdjustment');
      case 'Prescription':
        return results.filtered(
          'type == $0 AND otherParty.type == $1 AND (linkedRequisition == $2 OR status == $3)',
          'customer_invoice',
          'patient',
          null,
          'finalised'
        );
      case 'PrescriptionCategory':
        return results.filtered('type == $0', 'prescription');
      case 'SupplierCreditCategory':
        return results.filtered('type == $0', 'supplier_credit');
      case 'RequisitionReason':
        return results.filtered('type == $0 && isActive == true', 'requisitionLineVariance');
      case 'Fridge':
        return results.filtered("locationType.description == 'fridge'");
      default:
        return results;
    }
  }

  get(...args) {
    return this.database.get(...args);
  }

  addListener(...args) {
    return this.database.addListener(...args);
  }

  removeListener(...args) {
    return this.database.removeListener(...args);
  }

  alertListeners(...args) {
    return this.database.alertListeners(...args);
  }

  create(...args) {
    return this.database.create(...args);
  }

  getOrCreate(...args) {
    return this.database.getOrCreate(...args);
  }

  delete(...args) {
    return this.database.delete(...args);
  }

  deleteAll(...args) {
    return this.database.deleteAll(...args);
  }

  save(...args) {
    return this.database.save(...args);
  }

  update(...args) {
    return this.database.update(...args);
  }

  write(...args) {
    return this.database.write(...args);
  }

  /**
   * Get preference by key.
   *
   * If the preference is not found in the database, returns null.
   *
   * If the preference is found, returns object data cast to the
   * expected data type. If the data is not in the correct format,
   * returns a default value according to the preference type:
   *
   * - BOOL: false
   * - NUMERIC: 0
   * - NON_NEGATIVE_NUMERIC: 0
   *
   * If the data type is null or not recognised, returns the raw object
   * data as a string, or an empty string if the data is invalid JSON.
   *
   * @param {String} key
   * @return {Boolean|Number|String|Null}
   */
  getPreference(key) {
    const preference = this.database.get('Preference', key);
    if (!preference) return null;
    const { data, type } = preference;
    if (!data) return null;
    switch (type) {
      case PREFERENCE_TYPE_KEYS.BOOL:
        return parseBooleanData(data);
      case PREFERENCE_TYPE_KEYS.NUMERIC:
        return parseNumericData(data);
      case PREFERENCE_TYPE_KEYS.NON_NEGATIVE_NUMERIC:
        return parseNonNegativeNumericData(data);
      default:
        return parseUntypedData(data);
    }
  }

  getSetting(key) {
    const setting = this.database.get('Setting', key, 'key');
    return setting?.value ?? '';
  }
}

let UIDatabaseInstance;

export const getUIDatabaseInstance = database => {
  if (!UIDatabaseInstance) {
    UIDatabaseInstance = new UIDatabase(database);
  }
  return UIDatabaseInstance;
};

// Factory function for custom UIDatabase PropTypes.
const createUIDatabasePropType = isRequired => (props, propName, componentName) => {
  const { [propName]: prop } = props;

  if (prop == null) {
    if (isRequired) {
      return new TypeError(`Missing database prop in ${componentName}`);
    }
    return null;
  }

  if (prop instanceof UIDatabase) return null;
  return new TypeError(`Invalid database prop in ${componentName}`);
};

export const UIDatabaseType = createUIDatabasePropType(false);
UIDatabaseType.isRequired = createUIDatabasePropType(true);

export default getUIDatabaseInstance;
