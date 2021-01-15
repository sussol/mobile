/* eslint-disable react/forbid-prop-types */
/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';

import { PaperSection } from './PaperSection';

import { APP_FONT_FAMILY, DARKER_GREY, BACKGROUND_COLOR } from '../globalStyles';

export const CardDetail = ({
  Content,
  Footer,
  headerText,
  width,
  height,
  innerPadding,
  headerStyle,
  headerContainerStyle,
  fullContentContainerStyle,
  contentContainerStyle,
  footerContainerStyle,
}) => {
  return (
    <PaperSection
      width={width}
      height={height}
      Header={<Text style={headerStyle}>{headerText}</Text>}
      innerPadding={innerPadding}
      headerContainerStyle={headerContainerStyle}
    >
      <View style={fullContentContainerStyle}>
        <View style={contentContainerStyle}>{Content}</View>
        <View style={footerContainerStyle}>{Footer}</View>
      </View>
    </PaperSection>
  );
};

CardDetail.defaultProps = {
  fullContentContainerStyle: { alignItems: 'center', justifyContent: 'center', height: 120 },
  contentContainerStyle: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  footerContainerStyle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerStyle: { fontFamily: APP_FONT_FAMILY, fontSize: 13, color: DARKER_GREY },
  headerContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
  width: 160,
  height: 160,
  innerPadding: 5,
  Content: null,
  Footer: null,
  headerText: '',
};

CardDetail.propTypes = {
  headerStyle: PropTypes.object,
  headerContainerStyle: PropTypes.object,
  fullContentContainerStyle: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  footerContainerStyle: PropTypes.object,
  innerPadding: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  Content: PropTypes.node,
  Footer: PropTypes.node,
  headerText: PropTypes.string,
};
