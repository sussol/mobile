export const selectEntitiesState = state => {
  const { entities } = state;
  return entities;
};

export const selectSpecificEntityState = (state, entityName) => {
  const entities = selectEntitiesState(state) ?? {};
  const entityState = entities[entityName] ?? {};

  return entityState;
};
