// store/stateLidar.ts

import { createSlice } from '@reduxjs/toolkit';

export interface MapSelectedState {
    value: Number;
}

const initialState: MapSelectedState = {
    value: -1,
};

const mapSelected = createSlice({
    name: 'mapSelected',
    initialState,
    reducers: {
        changeStatus: (state, action) => {
            state.value = action.payload;
        },
        setStatus: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const { changeStatus, setStatus } = mapSelected.actions;

export default mapSelected.reducer;
