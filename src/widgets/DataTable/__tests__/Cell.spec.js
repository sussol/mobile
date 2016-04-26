jest.unmock('../Cell');
jest.unmock('react-native-mock/mock');
jest.unmock('enzyme');

import Cell from '../Cell';
import TestUtils from 'react-addons-test-utils';
import React, {
  Text,
  View,
} from 'react-native-mock/mock';

import { shallow } from 'enzyme';

describe('Cell', () => {
  it('renders a view', () => {
    const wrapper = shallow(
      <Cell />
    );
    expect(wrapper.find(View).length).toBe(1);
  });
});

// import { shallow } from 'enzyme';
// import { expect } from 'chai';
//
// const styles = StyleSheet.create({
//   text: {
//     fontSize: 20,
//     marginLeft: 20,
//     textAlign: 'left',
//   },
// });
//
// describe('Cell', () => {
//   it('renders a view', () => {
//     const wrapper = shallow(
//       <Cell style={styles.text} width={1} />
//     );
//     expect(wrapper.find(View)).to.have.length(1);
//   });
//
//   it('renders string in a <Text /> component', () => {
//     const wrapper = shallow(
//       <Cell style={styles.text} width={1}>
//         Test text is here.
//       </Cell>
//     );
//     expect(wrapper.contains(
//       <Text style={styles.text}>Test text is here.</Text>
//     )).to.equal(true);
//   });
//
//   it('renders an empty <Text /> component when it has no children', () => {
//     const wrapper = shallow(
//       <Cell style={styles.text} width={1} />
//     );
//     console.log(wrapper);
//     expect(wrapper.find(Text)).to.have.length(1);
//   });
// });
