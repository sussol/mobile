/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import PropTypes from 'prop-types';

import { ChevronDownIcon, BurgerMenuIcon } from './icons';
import { PopoverDropDown } from './PopoverDropDown';

import { SUSSOL_ORANGE, APP_FONT_FAMILY, GREY } from '../globalStyles/index';
import { FlexView } from './FlexView';

/**
 * Layout component rendering a DropdownPopover, a SimpleLabel and an optional
 * secondary Burger menu icon with onPress gesture handler.
 *
 * Renders in a 1/9 ratio.
 *
 * Uses important props from PopoverDropdown and SimpleLabel. See the individual
 * components for more detail.
 *
 * @prop {Text}   currentOptionText Text to display for the label text prop.
 * @prop {Array}  options           The options of the drop down. See PopoverDropdown.
 * @prop {Func}   onSelection       Callback when selecting a dropdown option.
 * @prop {String} dropdownTitle     The title of the drop down menu when opened.
 * @prop {Bool}   useSecondaryMenu  Indicator whether the secondary menu should show.
 * @prop {Number} iconSize          The size of the drop down icon.
 * @prop {String} placeholder       Placeholder string value, when no value has been chosen/entered.
 * @prop {Bool}   isDisabled        Indicator if this component should not be editable.
 */
export const DropdownRow = ({
  currentOptionText,
  options,
  onSelection,
  dropdownTitle,
  useSecondaryMenu,
  secondaryCallback,
  iconSize,
  placeholder,
  isDisabled,
}) => {
  const DropDownMenuIcon = React.useCallback(() => {
    const iconColor = options.length && !isDisabled ? SUSSOL_ORANGE : GREY;
    return <ChevronDownIcon color={iconColor} size={iconSize} />;
  }, []);

  const BurgerMenuButton = React.useCallback(
    () =>
      (
        <TouchableOpacity onPress={secondaryCallback}>
          <BurgerMenuIcon />
        </TouchableOpacity>
      )[useSecondaryMenu]
  );

  return (
    <View style={localStyles.containerStyle}>
      <FlexView flex={1}>
        <PopoverDropDown
          BaseComponent={DropDownMenuIcon}
          options={options}
          onSelection={onSelection}
          title={dropdownTitle}
          isDisabled={isDisabled}
        />
      </FlexView>
      <FlexView flex={9}>
        <TextInput
          editable={!isDisabled}
          onChangeText={onSelection}
          value={currentOptionText}
          underlineColorAndroid={SUSSOL_ORANGE}
          style={localStyles.textInputStyle}
          placeholder={placeholder}
        />
      </FlexView>
      {useSecondaryMenu && <BurgerMenuButton />}
    </View>
  );
};

const localStyles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconsContainerStyle: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    flex: 1,
  },
  textInputStyle: {
    flex: 1,
    fontFamily: APP_FONT_FAMILY,
  },
});

DropdownRow.defaultProps = {
  useSecondaryMenu: false,
  secondaryCallback: null,
  iconSize: 20,
  placeholder: '',
  currentOptionText: '',
  isDisabled: false,
};

DropdownRow.propTypes = {
  currentOptionText: PropTypes.string,
  options: PropTypes.array.isRequired,
  onSelection: PropTypes.func.isRequired,
  dropdownTitle: PropTypes.string.isRequired,
  useSecondaryMenu: PropTypes.bool,
  secondaryCallback: PropTypes.func,
  iconSize: PropTypes.number,
  placeholder: PropTypes.string,
  isDisabled: PropTypes.bool,
};
