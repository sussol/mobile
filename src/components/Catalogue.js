/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Text,
  TextInput,
  Component,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import TableView, {
  Row,
  Cell,
  CellView,
  EditableCell,
  Expansion,
  ExpansionView,
  TableButton,
  Header,
  HeaderCell,
} from './TableView';

import realm from '../schema/Realm';
import { ListView } from 'realm/react-native';

export class Catalogue extends Component {

  constructor(props) {
    super(props);
    let dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      query:'item_name=@',
      id: (item) => item.id,
      dataSource: dataSource.cloneWithRows(dataSource),
      items: realm.objects('Item'),//.sorted('name'),
      loaded:false,
    };
    this.onSearchChange = this.onSearchChange.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  //  this.deleteButton = this.deleteButton.bind(this);
  //  this.getItemDepartmentName = this.getItemDepartmentName.bind(this);
  }

  componentDidMount() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.state.items),
      loaded: true,
    });
  }

  onSearchChange(event: Object) {
    let itemName = event.nativeEvent.text;
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this.state.items.filtered('name BEGINSWITH $0', itemName))
    });
  }

  // Field functions

  // itemCode(item) {
  //   return (
  //     <Text style={styles.text}>
  //       {item.code}
  //     </Text>
  //   );
  // }
  //
  // itemName(item) {
  //   return (
  //     <Text style={styles.text}>
  //       {item.name}
  //     </Text>
  //   );
  // }
  //
  // itemDefaultPackSize(item) {
  //   return (
  //     <Text style={styles.value}>
  //       {item.defaultPackSize}
  //     </Text>
  //   );
  // }
  //
  // // (Android) Check console with command in terminal: adb logcat *:S ReactNative:V ReactNativeJS:V
  // onHolyButtonPress(item) {
  //   console.log("Mathmatical holy press of the holy button" + item.name);
  // };
  //
  // button(item) {
  //   return (
  //     <TouchableHighlight onPress={() => this.onHolyButtonPress(item)} underlayColor="white">
  //       <View style={styles.button}>
  //         <Text style={styles.text}>
  //           Holy button
  //         </Text>
  //       </View>
  //     </TouchableHighlight>
  //   );
  // }

  header() {
    return (
      <Header>
        <HeaderCell style={styles.code}>Item Code</HeaderCell>
        <HeaderCell style={styles.name} sortable={true}>Item Name</HeaderCell>
        <HeaderCell style={styles.packSize}>Default Pack Size</HeaderCell>
      </Header>
    );
  }

  getItemDepartmentName(item) {
    let code = item.code;
    // console.log("item:      " + item)
    // console.log("code:      " + code)
    // console.log("typeofCode:   " + typeof code)
    if (code) {
      // console.log("code True: true")
      return item.department.name
    }
    // console.log("code True: false");
    return "Undefined"
  }

  deleteButton(item) {
    //todo implement this proper to learn integrating realm.
    console.log("Pressed deleteButton for item: " + item.name);
  }

  renderRow(item) {
    return (
      <Row expandable={true}>
        <CellView>
          <Cell style={styles.code} width={1}>{item.code}</Cell>
          <Cell style={styles.name} width={10}>{item.name}</Cell>
          {/*<TextInput style={styles.packSize} placegholder={'test'}/>*/}
          <EditableCell style={styles.packSize} width={10}>{item.defaultPackSize}</EditableCell>
        </CellView>
        <Expansion>
          <ExpansionView>
            <Text>Department: {this.getItemDepartmentName(item)}</Text>
            <Text>Description: {item.description}</Text>
          </ExpansionView>
          <TableButton onPress={() => this.deleteButton(item)}>
            <Text>Delete Item</Text>
          </TableButton>
        </Expansion>
      </Row>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Text Component outside of TableView</Text>
        <TableView
          dataSource={this.state.dataSource}
          header={this.header}
          renderRow={this.renderRow.bind(this)}
        />
      </View>
    );
  };
}

let { height, width } = Dimensions.get('window')

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: 'rgba(130, 171, 189, 0.7)',
  },
  code: {
    fontSize: 20,
    marginLeft: 20,
    marginBottom: 8,
    textAlign: 'left',
  },
  name: {
    fontSize: 20,
    marginLeft: 20,
    marginBottom: 8,
    textAlign: 'left',
  },
  packSize: {
    fontSize: 20,
    textAlign: 'right',
    marginRight: 20,
    marginBottom: 8,
    height: 30,
    width: 300,
    backgroundColor:'red',
  },
  TableView: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});
