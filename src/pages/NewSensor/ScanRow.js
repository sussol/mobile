import React from 'react';
import PropTypes from 'prop-types';
import { LightbulbIcon, ChevronRightIcon, FlexRow, IconButton, WifiIcon } from '../../widgets';
import { SUSSOL_ORANGE, WHITE, DARKER_GREY } from '../../globalStyles';
import { TextWithIcon } from '../../widgets/Typography';
import { vaccineStrings } from '../../localization';

export const RectangleButton = () => (
  <IconButton
    rectangle
    Icon={<LightbulbIcon />}
    label={vaccineStrings.blink}
    labelStyle={localStyles.rectangleButtonLabel}
    containerStyle={localStyles.rectangleButtonContainer}
  />
);

export const ScanRow = ({ macAddress }) => (
  <FlexRow style={{ height: 60 }} alignItems="center" justifyContent="flex-end">
    <RectangleButton />
    <TextWithIcon left size="ms" Icon={<WifiIcon />} containerStyle={{ marginLeft: 20 }}>
      {macAddress}
    </TextWithIcon>
    <IconButton
      right
      labelStyle={localStyles.connectText}
      label={vaccineStrings.connect}
      size="ms"
      Icon={<ChevronRightIcon color={DARKER_GREY} />}
    />
  </FlexRow>
);

const localStyles = {
  connectText: { fontSize: 14, color: DARKER_GREY, marginRight: 20, textTransform: 'capitalize' },
  rectangleButtonLabel: { color: WHITE, textTransform: 'uppercase' },
  rectangleButtonContainer: {
    width: 100,
    height: 30,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
  },
};

ScanRow.propTypes = { macAddress: PropTypes.string.isRequired };
