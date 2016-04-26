import EditableCell from '../EditableCell';
import React, {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

// import { shallow, render } from 'enzyme';
// import { expect } from 'chai';
//
// const styles = StyleSheet.create({
//   editableCell: {
//     fontSize: 20,
//     height: 45,
//     textAlign: 'right',
//     marginRight: 20,
//   },
// });
//
// describe('EditableCell', () => {
//   it('renders a view', () => {
//     const wrapper = shallow(
//       <EditableCell />
//     );
//     expect(wrapper.find(View)).to.be.length(1);
//   });
//   it('renders TextInput with value', () => {
//     const wrapper = shallow(
//       <EditableCell
//         style={styles.editableCell}
//         value={50}
//       />
//   );
//     console.log(wrapper.childAt(0));
//     expect(wrapper.find(TextInput)).to.be.length(1, 'really?');
//     expect(wrapper.children().prop('value')).to.contain('50');
//   });
// });
