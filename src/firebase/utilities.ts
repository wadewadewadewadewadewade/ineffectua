import * as React from 'react';
import { AllTypes } from '../Types';

export function firebaseDocumentToArray<T>(items: {[index: string]: T}, optionalItem?: T) {
  const itemsAsArray = React.useMemo<Array<T>>(() => {
    const arr = new Array<T>();
    if (items) {
      const keys = Object.keys(items);
      for(let i=0;i<keys.length;i++) {
        const l: unknown = items[keys[i]];
        if (l) (l as AllTypes).key = keys[i]
        arr.push(l as T);
      }
    }
    if (optionalItem) {
      arr.push(optionalItem)
    }
    return arr;
  }, [items, optionalItem])
  return itemsAsArray
}
