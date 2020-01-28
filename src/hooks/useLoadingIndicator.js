/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { LoadingIndicatorContext } from '../context/LoadingIndicatorContext';

/**
 * Simple custom hook to return the runWithLoadingIndicator function.
 */
export const useLoadingIndicator = () => React.useContext(LoadingIndicatorContext);
