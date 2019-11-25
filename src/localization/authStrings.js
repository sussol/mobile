/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import LocalizedStrings from 'react-native-localization';
import gb from './jsonFiles/gb.json';

export const authStrings = new LocalizedStrings({
  gb: gb.authStrings,
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
