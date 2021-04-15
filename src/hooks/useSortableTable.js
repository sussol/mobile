import { useState } from 'react';

export const useSortableTable = (initialSortKey, initialIsAscending = true) => {
  const [{ sortKey, isAscending }, setState] = useState({
    sortKey: initialSortKey,
    isAscending: initialIsAscending,
  });

  const sortBy = newSortKey => {
    setState(state => {
      const newIsAsending = newSortKey === state.sortKey ? !state.isAscending : state.isAscending;

      return { sortKey: newSortKey, isAscending: newIsAsending };
    });
  };

  return { sortKey, isAscending, sortBy };
};
