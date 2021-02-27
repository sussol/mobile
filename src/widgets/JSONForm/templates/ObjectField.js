export const ObjectField = props => {
  console.log('-------------------------------------------');
  console.log('ObjectField - props', props);
  console.log('-------------------------------------------');
  return props.properties.map(element => element.content);
};
