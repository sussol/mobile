/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import LocalizedStrings from 'react-native-localization';
import gb from './jsonFiles/gb.json';

export const authStrings = new LocalizedStrings({
  gb: {
    logging_in: gb.authStrings.logging_in,
    login: gb.authStrings.login,
    password: gb.authStrings.password,
    repeat_password: gb.authStrings.repeat_password,
    user_name: gb.authStrings.user_name,
    email: gb.authStrings.email,
    invalid_username_or_password: gb.authStrings.invalid_username_or_password,
    warning_sync_edit: gb.authStrings.warning_sync_edit,
  },
  fr: {
    logging_in: 'Connexion en cours',
    login: 'Se connecter',
    password: 'Mot de passe',
    user_name: 'Identifiant',
    invalid_username_or_password: 'Identifiant ou mot de passe invalide',
  },
  gil: {
    logging_in: 'Taninga bwa e na uki',
    login: 'Kaukia',
    password: 'Am ka-ukuki',
    user_name: 'Aram ae kinaaki ikai',
  },
  tl: {
    logging_in: 'Rejistu hela...',
    login: 'Rejistu',
    password: 'Liafuan-pase',
    user_name: 'Naran',
  },
  la: {
    logging_in: 'ກຳ​ລັງ​ເຂົ້າ​ລະ​ບົບ',
    login: 'ເຂົ້າ​ລະ​ບົບ',
    password: 'ລະຫັດຜ່ານ',
    user_name: 'ຊື່​ຜູ້​ນຳ​ໃຊ້',
  },
});

export default authStrings;
