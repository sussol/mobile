import { createContext, useContext } from 'react';

export const JSONFormContext = createContext({ josh: 1 });

export const useJSONFormOptions = () => useContext(JSONFormContext);
