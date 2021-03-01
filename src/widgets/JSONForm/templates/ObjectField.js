export const ObjectField = props => {
  const { properties } = props;
  return properties.map(element => element.content);
};
