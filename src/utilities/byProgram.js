const thisStoreUsesPrograms = (settings, database) => {
  const thisStoresTags = settings.get('ThisStoreTags');
  const programs = database.objects('MasterList').filtered('isProgram = $0', true);
  const hasAProgram = programs.find(program => program.canUseProgram(thisStoresTags));
  return !!hasAProgram;
};

const getAllPrograms = (settings, database) => {
  const thisStoresTags = settings.get('ThisStoreTags');
  const programs = database.objects('MasterList').filtered('isProgram = $0', true);
  if (!programs) return null;
  return programs.filter(program => program.canUseProgram(thisStoresTags));
};

export { thisStoreUsesPrograms, getAllPrograms };
