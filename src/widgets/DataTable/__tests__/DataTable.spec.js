jest.unmock('../DataTable');
jest.unmock('enzyme');
jest.unmock('sinon');

import DataTable from '../DataTable';
import React from 'react-native'; // should be from realm, but this should suffice
import { shallow } from 'enzyme';
import { ListView } from 'realm/react-native';
describe('DataTable', () => {
  it('renders a ListView', () => {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    dataSource.cloneWithRows(['row1', 'row2']);
    const wrapper = shallow(
      <DataTable
        dataSource={dataSource}
        renderRow={jest.fn()}
      />
    );
    expect(wrapper.find(ListView).length).toEqual(1);
  });
});
