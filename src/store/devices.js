import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
  name: 'devices',
  initialState: {
    items: {},
    selectedId: null,
    selectionSource: null,
    devicesOpen: null, // null means uninitialized (will fallback to desktop media query on first load)
  },
  reducers: {
    refresh(state, action) {
      state.items = {};
      action.payload.forEach((item) => (state.items[item.id] = item));
    },
    update(state, action) {
      action.payload.forEach((item) => (state.items[item.id] = item));
    },
    selectId(state, action) {
      state.selectTime = Date.now();
      if (action.payload && typeof action.payload === 'object' && 'id' in action.payload) {
        state.selectedId = action.payload.id;
        state.selectionSource = action.payload.source || null;
      } else {
        state.selectedId = action.payload;
        state.selectionSource = null;
      }
    },
    remove(state, action) {
      delete state.items[action.payload];
    },
    setDevicesOpen(state, action) {
      state.devicesOpen = action.payload;
    },
  },
});

export { actions as devicesActions };
export { reducer as devicesReducer };
