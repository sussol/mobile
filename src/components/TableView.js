/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
  Text,
  View } from 'react-native';
import { ListView } from 'realm/react-native';

export class Row extends Component {

}

export class Cell extends Component {

}

export class EditableCell extends Component {

}

export class Expansion extends Component {

}

export class TableButton extends Component {

}

export default class TableView extends Component {
  renderRow(item) {
    let fields = this.props.rowFields;
    let fieldStyles = this.props.rowStyles;
    let row = [];

    for (var i = 0; i < fields.length; i++) {
      let fieldFunc = fields[i];
      let field = <View style={fieldStyles[i]}>
        {fieldFunc(item)}
      </View>;
      row.push(field);
    };


    return(
      <View style={styles.container}>
        <View style={styles.rowSeparator} />
        <View style={styles.row}>
          {row}
        </View>
      </View>
    );
  };

  render() {
    return(
      <View style={styles.verticalContainer}>
        <ListView
          style={styles.listview}
          dataSource={this.props.dataSource}
          renderRow={this.renderRow.bind(this)}
          showsVerticalScrollIndicator={true}
          scrollRenderAheadDistance={5000}
        />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  verticalContainer: {
    flex: 1,
  },
  listview: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
  rowSeparator: {
    height: 2,
    backgroundColor: '#98d7f1',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#d6f3ff',
  },
  fieldSeparator: {
    height: 35,
    width: 2,
    backgroundColor: '#98d7f1',
  },
});
