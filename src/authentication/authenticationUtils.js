import sha256 from 'sha256';

function hashPassword(password) {
  return sha256(password);
}

export default { hashPassword };
