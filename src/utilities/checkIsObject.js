/**
 * Check if the given parameter is an Object type {} and
 * return a boolean.
 *
 * @param   {object}  object  The object to check.
 *
 */

export const checkIsObject = object =>
  !!(object && typeof object === 'object' && object.constructor === Object);
