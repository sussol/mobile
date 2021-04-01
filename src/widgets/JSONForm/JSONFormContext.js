import { createContext, useContext } from 'react';

export const JSONFormContext = createContext({});

export const useJSONFormOptions = () => useContext(JSONFormContext);
