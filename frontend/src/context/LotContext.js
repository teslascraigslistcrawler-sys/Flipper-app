import React, { createContext, useContext, useReducer, useCallback } from 'react';

const LotContext = createContext(null);

const initialState = {
  items: [],
};

function lotReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item = {
        ...action.payload,
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        addedAt: new Date().toISOString(),
      };
      return { ...state, items: [item, ...state.items] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'CLEAR_LOT':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function LotProvider({ children }) {
  const [state, dispatch] = useReducer(lotReducer, initialState);

  const addItem = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const clearLot = useCallback(() => {
    dispatch({ type: 'CLEAR_LOT' });
  }, []);

  const totalInvested = state.items.reduce((sum, i) => sum + (i.buyPrice || 0), 0);
  const totalEstimatedValue = state.items.reduce((sum, i) => sum + (i.valueEstimateMid || 0), 0);
  const totalProfit = state.items.reduce((sum, i) => sum + (i.profit || 0), 0);

  return (
    <LotContext.Provider value={{
      items: state.items,
      itemCount: state.items.length,
      addItem,
      removeItem,
      clearLot,
      totalInvested,
      totalEstimatedValue,
      totalProfit,
    }}>
      {children}
    </LotContext.Provider>
  );
}

export function useLot() {
  const ctx = useContext(LotContext);
  if (!ctx) throw new Error('useLot must be used within LotProvider');
  return ctx;
}
