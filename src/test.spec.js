import React, { TextInput, Text, View } from 'react-native';
import { expect } from 'chai';
import { shallow } from 'enzyme';



// describe('Text', () => {
//   it('to work nicely', () => {
//     const wrapper = shallow(<Text value={50} />);
//     console.log(wrapper);
//     expect(wrapper.prop('value')).to.equal(50);
//   });
// });
//
// describe('View', () => {
//   it('to work nicely', () => {
//     const wrapper = shallow(<View style={{ flex: 1 }} />);
//     expect(wrapper.prop('style')).to.equal({ flex: 1 });
//   });
// });
//
// describe('TextInput', () => {
//   it('to work nicely', () => {
//     const wrapper = shallow(<TextInput value={'50'} />);
//     const rendered = wrapper.render();
//     console.log('jerjejr' +typeof rendered);
//     // expect(rendered.find(TextInput)).to.be.length(1);
//     expect(rendered.prop('value')).to.equal(50);
//   });
// });
