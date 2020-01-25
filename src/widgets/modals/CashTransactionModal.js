/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { PencilIcon, ChevronDownIcon } from '../icons';

export const CashTransactionModal = () => (
  <View style={localStyles.modalContainerStyle}>
    <TouchableOpacity style={localStyles.containerStyle}>
      <View style={localStyles.textContainerStyle}>
        <Text style={localStyles.textStyle}>Select a name</Text>
      </View>
      <View style={localStyles.iconContainerStyle}>
        <ChevronDownIcon />
      </View>
    </TouchableOpacity>
    <TouchableOpacity style={localStyles.containerStyle}>
      <View style={localStyles.textContainerStyle}>
        <Text style={localStyles.textStyle}>Choose transaction type</Text>
      </View>
      <View style={localStyles.iconContainerStyle}>
        <ChevronDownIcon />
      </View>
    </TouchableOpacity>
    <TouchableOpacity style={localStyles.containerStyle}>
      <View style={localStyles.textContainerStyle}>
        <Text style={localStyles.textStyle}>Enter transaction amount</Text>
      </View>
      <View style={localStyles.iconContainerStyle}>
        <PencilIcon />
      </View>
    </TouchableOpacity>
    <TouchableOpacity style={localStyles.containerStyle}>
      <View style={localStyles.textContainerStyle}>
        <Text style={localStyles.textStyle}>Select reason</Text>
      </View>
      <View style={localStyles.iconContainerStyle}>
        <ChevronDownIcon />
      </View>
    </TouchableOpacity>
    <TouchableOpacity style={localStyles.containerStyle}>
      <View style={localStyles.textContainerStyle}>
        <Text style={localStyles.textStyle}>Enter description</Text>
      </View>
      <View style={localStyles.iconContainerStyle}>
        <PencilIcon />
      </View>
    </TouchableOpacity>
  </View>
);

const localStyles = StyleSheet.create({
  modalContainerStyle: {
    flexDirection: 'column',
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '10%',
  },
  textContainerStyle: { width: '30%', justifyContent: 'center' },
  iconContainerStyle: { width: '5%', justifyContent: 'flex-end', alignItems: 'flex-end' },
  textStyle: { color: 'white' },
});
