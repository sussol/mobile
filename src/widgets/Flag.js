/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { KiribatiFlag, EnglishFlag, LaosFlag, TetumFlag, FrenchFlag } from './images';

const LANGUAGE_TO_FLAG = {
  fr: FrenchFlag,
  tl: TetumFlag,
  gb: EnglishFlag,
  gil: KiribatiFlag,
  la: LaosFlag,
};

export const Flag = ({ style, flag }) => {
  const FlagImage = LANGUAGE_TO_FLAG[flag];
  return <FlagImage style={style} />;
};

Flag.defaultProps = { style: { width: 55, height: 33 } };
Flag.propTypes = { style: PropTypes.object, flag: PropTypes.string.isRequired };
