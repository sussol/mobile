/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

/**
 * Tests navigation.
 */

jest.unmock('../OfflineMobileApp');
jest.unmock('../pages');
jest.unmock('enzyme');

import OfflineMobileApp from '../OfflineMobileApp';
import {
  MenuPage,
  StockPage,
  StocktakesPage,
  StocktakeEditPage,
} from '../pages';
import React, { NavigationExperimental } from 'react-native';
import { shallow } from 'enzyme';

describe('OfflineMobileApp', () => {
  it('starts at the menu page', () => {
    const wrapper = shallow(<OfflineMobileApp />);
    expect(wrapper.find(<MenuPage />)).length.toBe(1);
  });

  it('passes navigateTo to pages', () => {
    const wrapper = shallow(<OfflineMobileApp />);
    const menuPage = wrapper.find(<MenuPage />);
    expect(menuPage.prop('navigateTo')).toBeDefined();
  });

  it('can navigate to a new page', () => {
    const wrapper = shallow(<OfflineMobileApp />);
    const menuPage = wrapper.find(<MenuPage />);
    menuPage.prop('navigateTo')('stock', 'Stock');
    expect(wrapper.find(<MenuPage />)).length.toBe(0);
    expect(wrapper.find(<StockPage />)).length.toBe(1);
  });

  it('can navigate three pages deep then pop back to the menu', () => {
    const wrapper = shallow(<OfflineMobileApp />);
    let featurePage = wrapper.find(<MenuPage />);
    featurePage.prop('navigateTo')('stock', 'Stock');
    featurePage = wrapper.find(<StockPage />);
    featurePage.prop('navigateTo')('stocktakes', 'Stocktakes');
    featurePage = wrapper.find(<StocktakesPage />);
    featurePage.prop('navigateTo')('stocktakeEditor', 'Edit');
    expect(wrapper.find(<StocktakeEditPage />)).length.toBe(1);
    expect(wrapper.find(<StocktakesPage />)).length.toBe(0);
    expect(wrapper.find(<StockPage />)).length.toBe(0);
    expect(wrapper.find(<MenuPage />)).length.toBe(0);

    const backButton = wrapper.find(<NavigationExperimental.Header.BackButton />);
    backButton.simulate('press');
    backButton.simulate('press');
    backButton.simulate('press');
    expect(wrapper.find(<StocktakeEditPage />)).length.toBe(0);
    expect(wrapper.find(<StocktakesPage />)).length.toBe(0);
    expect(wrapper.find(<StockPage />)).length.toBe(0);
    expect(wrapper.find(<MenuPage />)).length.toBe(1);
  });

  it('pages can be given an arbitrary title', () => {
    const wrapper = shallow(<OfflineMobileApp />);
    const menuPage = wrapper.find(<MenuPage />);
    const title = 'Arbitrary Title';
    menuPage.prop('navigateTo')('stock', title);
    expect(wrapper.contains(
      <NavigationExperimental.Header.Title>
        {title}
      </NavigationExperimental.Header.Title>)).toBe(true);
  });

  it('still renders pages with a blank title', () => {
  });

  it('still renders pages with no title', () => {
  });

  it('still renders pages with a null title', () => {
  });

  it('does not crash if passed a page key it does not know', () => {
  });

  it('does not crash if passed a null page key', () => {
  });

  it('does not crash if passed a null title', () => {
  });
});
