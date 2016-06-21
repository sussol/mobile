// /* @flow weak */
//
// /**
//  * OfflineMobile Android
//  * Sustainable Solutions (NZ) Ltd. 2016
//  */
//
// /**
//  * Tests navigation.
//  */
//
// jest.unmock('../Navigator');
// jest.unmock('enzyme');
//
// import { Navigator } from '../Navigator';
// import React from 'react';
// import {
//   TouchableHighlight,
// } from 'react-native';
// import { shallow, mount, render } from 'enzyme';
//
// /**
//  * Mocks
//  */
//
// class MenuPage extends React.Component {
//   render() {
//     return <TouchableHighlight><Text>Button</Text></TouchableHighlight>;
//   }
// }
// class StockPage extends React.Component {
//   render() {
//     return <TouchableHighlight><Text>Button</Text></TouchableHighlight>;
//   }
// }
// class StocktakesPage extends React.Component {
//   render() {
//     return <TouchableHighlight><Text>Button</Text></TouchableHighlight>;
//   }
// }
// class StocktakeEditPage extends React.Component {
//   render() {
//     return <TouchableHighlight><Text>Button</Text></TouchableHighlight>;
//   }
// }
//
// const renderScene = (props) => {
//   const navigateTo = (key, title) => {
//     props.onNavigate({ type: 'push', key, title });
//   };
//
//   switch (props.scene.navigationState.key) {
//     case 'menu':
//       return <MenuPage navigateTo={navigateTo} />;
//     case 'stock':
//       return <StockPage navigateTo={navigateTo} />;
//     case 'stocktakes':
//       return <StocktakesPage navigateTo={navigateTo} />;
//     case 'stocktakeEditor':
//       return <StocktakeEditPage navigateTo={navigateTo} />;
//     default:
//       return <MenuPage navigateTo={navigateTo} />;
//   }
// };
// renderScene.propTypes = {
//   scene: React.PropTypes.object,
//   onNavigate: React.PropTypes.func,
// };
//
// xdescribe('Navigator', () => {
//   it('starts at the menu page', () => {
//     const wrapper = shallow(<Navigator renderScene={() => {console.log('Called renderScene');}} />);
//     console.log(wrapper.debug());
//   });
//
//   it('passes navigateTo to pages', () => {
//     const wrapper = shallow(<Navigator />);
//     const menuPage = wrapper.find(<MenuPage />);
//     expect(menuPage.prop('navigateTo')).toBeDefined();
//   });
//
//   it('can navigate to a new page', () => {
//     const wrapper = shallow(<Navigator />);
//     const menuPage = wrapper.find(<MenuPage />);
//     menuPage.prop('navigateTo')('stock', 'Stock');
//     expect(wrapper.find(<MenuPage />)).length.toBe(0);
//     expect(wrapper.find(<StockPage />)).length.toBe(1);
//   });
//
//   it('can navigate three pages deep then pop back to the menu', () => {
//     const wrapper = shallow(<Navigator />);
//     let featurePage = wrapper.find(<MenuPage />);
//     featurePage.prop('navigateTo')('stock', 'Stock');
//     featurePage = wrapper.find(<StockPage />);
//     featurePage.prop('navigateTo')('stocktakes', 'Stocktakes');
//     featurePage = wrapper.find(<StocktakesPage />);
//     featurePage.prop('navigateTo')('stocktakeEditor', 'Edit');
//     expect(wrapper.find(<StocktakeEditPage />)).length.toBe(1);
//     expect(wrapper.find(<StocktakesPage />)).length.toBe(0);
//     expect(wrapper.find(<StockPage />)).length.toBe(0);
//     expect(wrapper.find(<MenuPage />)).length.toBe(0);
//
//     const backButton = wrapper.find(<NavigationExperimental.Header.BackButton />);
//     backButton.simulate('press');
//     backButton.simulate('press');
//     backButton.simulate('press');
//     expect(wrapper.find(<StocktakeEditPage />)).length.toBe(0);
//     expect(wrapper.find(<StocktakesPage />)).length.toBe(0);
//     expect(wrapper.find(<StockPage />)).length.toBe(0);
//     expect(wrapper.find(<MenuPage />)).length.toBe(1);
//   });
//
//   it('pages can be given an arbitrary title', () => {
//     const wrapper = shallow(<Navigator />);
//     const menuPage = wrapper.find(<MenuPage />);
//     const title = 'Arbitrary Title';
//     menuPage.prop('navigateTo')('stock', title);
//     expect(wrapper.contains(
//       <NavigationExperimental.Header.Title>
//         {title}
//       </NavigationExperimental.Header.Title>)).toBe(true);
//   });
//
//   it('still renders pages with a blank title', () => {
//   });
//
//   it('still renders pages with no title', () => {
//   });
//
//   it('still renders pages with a null title', () => {
//   });
//
//   it('does not crash if passed a page key it does not know', () => {
//   });
//
//   it('does not crash if passed a null page key', () => {
//   });
//
//   it('does not crash if passed a null title', () => {
//   });
// });
