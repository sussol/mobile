/* @flow weak */

/**
 * OfflineMobile Android Index
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, {
  Component,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

class NavButton extends Component {
  render() {
    return (
      <TouchableHighlight
        style={styles.button}
        underlayColor="#B5B5B5"
        onPress={this.props.onPress}>
        <Text style={styles.buttonText}>{this.props.text}</Text>
      </TouchableHighlight>
    );
  }
}

export class CustomerInvoicesPage extends Component {

  render() {
    return (
      <View>
        <NavButton
          text='Stock'
          onPress={
            ()=>{
              this.props.navigator.push({id: 'stock'});
            }}
        />
        <NavButton
          text='Stocktakes'
          onPress={
            ()=>{
              this.props.navigator.push({id: 'stocktakes'});
            }}
        />
        <NavButton
          text='Orders'
          onPress={
            ()=>{
              this.props.navigator.push({id: 'orders'});
            }}
        />
        <NavButton
          text='Customer Invoices'
          onPress={
            ()=>{
              this.props.navigator.push({id: 'customerInvoices'});
            }}
        />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CDCDCD',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
  }
});

// TODO Add proptype validation
