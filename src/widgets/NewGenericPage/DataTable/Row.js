import React from 'react';
import { View, StyleSheet } from 'react-native';

const Row = React.memo(({ rowData, rowState, rowKey, renderCells }) => {
  console.log(`Row: ${rowData}`);
  return <View style={defaultStyles.row}>{renderCells(rowData, rowState, rowKey)}</View>;
});

const defaultStyles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default Row;

// // Destructure the rowData realm object into regular object
// const [rowData, setRowData] = useState({ ...realmObject });

// // Add listener that updates state based on changes to the live realm object given to
// // this Row component
// useEffect(() => {
//   const refreshRow = () => setRowData({ ...realmObject });
//   realmObject.addListener(refreshRow);
//   return () => realmObject.removeListener(refreshRow);
// }, [realmObject]);
