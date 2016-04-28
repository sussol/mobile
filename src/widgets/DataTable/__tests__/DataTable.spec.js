jest.unmock('../DataTable');
jest.unmock('enzyme');
jest.unmock('sinon');

import DataTable from '../DataTable';
import React, { ListView } from 'react-native'; // should be from realm, but this should suffice
import { shallow } from 'enzyme';
