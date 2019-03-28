/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Generic helper methods to handle usage of MasterLists which
 * are programs and program based requisitions and stock takes.
 */

/**
 * Finds if the currently logged in store is a store which uses programs.
 * If true then: there exists a master list which is a program, which has
 * a store tag in programSettings which also exists in the tags for this
 * store.
 * @param  {Object}  settings
 * @param  {Realm}   database
 * @return {boolean} indicator of the currently logged in store using programs
 */
const thisStoreUsesPrograms = (settings, database) => {
  const thisStoresTags = settings.get('ThisStoreTags');
  const programs = database.objects('MasterList').filtered('isProgram = $0', true);
  const hasAProgram = programs.find(program => program.canUseProgram(thisStoresTags));
  return !!hasAProgram;
};

/**
 * Finds all MasterList objects which are programs usable by this store.
 * @param  {Object} settings
 * @param  {Realm}  database
 * @return {array}  MasterLists which are programs usable by this store.
 */
const getAllPrograms = (settings, database) => {
  const thisStoresTags = settings.get('ThisStoreTags');
  const programs = database.objects('MasterList').filtered('isProgram = $0', true);
  if (!programs) return null;
  return programs.filter(program => program.canUseProgram(thisStoresTags));
};

/**
 * Finds all periods which are available for use for the current
 * store given the program, periodSchedule and orderType.
 * @param  {Realm}              database
 * @param  {Object/MasterList}  program             An object consisting of a programID
 * @param  {string}             periodScheduleName  the name of a periodSchedule
 * @param  {Object}             orderType           an order Type object
 * @return {array}
 */
const getAllPeriodsForProgram = (database, program, periodScheduleName, orderType) =>
  database
    .objects('PeriodSchedule')
    .filtered('name = $0', periodScheduleName)[0]
    .getPeriodsForOrderType(program, orderType);

export { thisStoreUsesPrograms, getAllPrograms, getAllPeriodsForProgram };
