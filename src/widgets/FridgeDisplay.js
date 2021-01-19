/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import { PaperSection } from './PaperSection';
import { IconButton } from './IconButton';
import { ChevronRightIcon, CogIcon, DownloadIcon, LightbulbIcon } from './icons';
import { TextWithIcon } from './Typography/index';
import { BLACK, WHITE } from '../globalStyles/index';

export const FridgeHeader = () => (
  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
    <TextWithIcon
      left
      size="ms"
      margin={20}
      textStyle={{ textTransform: 'uppercase' }}
      containerStyle={{ flex: 4 }}
      Icon={<View style={{ borderRadius: 10, height: 20, backgroundColor: 'green', width: 20 }} />}
    >
      Some text
    </TextWithIcon>
    <View style={{ justifyContent: 'space-between', flex: 1, flexDirection: 'row' }}>
      <IconButton Icon={<DownloadIcon />} />
      <IconButton Icon={<LightbulbIcon />} />
      <IconButton Icon={<CogIcon color={BLACK} />} />
    </View>
  </View>
);

export const FridgeDisplay = () => {
  return (
    <PaperSection
      height={120}
      Header={<FridgeHeader />}
      contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
    >
      <TextWithIcon
        left
        margin={20}
        size="ms"
        containerStyle={{ flex: 1 }}
        Icon={<View style={{ borderRadius: 10, height: 20, backgroundColor: WHITE, width: 20 }} />}
      >
        Fridge
      </TextWithIcon>

      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextWithIcon
          left
          margin={20}
          size="ms"
          containerStyle={1}
          Icon={
            <View style={{ borderRadius: 10, height: 20, backgroundColor: WHITE, width: 20 }} />
          }
        >
          Fridge
        </TextWithIcon>
        <TextWithIcon
          left
          margin={20}
          size="ms"
          containerStyle={1}
          Icon={
            <View style={{ borderRadius: 10, height: 20, backgroundColor: WHITE, width: 20 }} />
          }
        >
          Fridge
        </TextWithIcon>
        <TextWithIcon
          left
          margin={20}
          size="ms"
          containerStyle={1}
          Icon={
            <View style={{ borderRadius: 10, height: 20, backgroundColor: WHITE, width: 20 }} />
          }
        >
          Fridge
        </TextWithIcon>
        <TextWithIcon
          left
          margin={20}
          size="ms"
          containerStyle={1}
          Icon={
            <View style={{ borderRadius: 10, height: 20, backgroundColor: WHITE, width: 20 }} />
          }
        >
          Fridge
        </TextWithIcon>
        <IconButton Icon={<ChevronRightIcon color={BLACK} />} />
      </View>
    </PaperSection>
  );
};
