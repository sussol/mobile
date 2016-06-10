import uuid from 'uuid';

// Generate and return a universally unique ID based on RFC4122 v1
export function generateUUID() {
  return uuid.v1().replace(/-/g, ''); // Strip canonical uuid of hyphens
}
