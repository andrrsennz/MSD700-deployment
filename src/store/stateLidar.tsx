// store/stateLidar.ts

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    value: false,
};

const lidarSlice = createSlice({
    name: 'lidarState',
    initialState,
    reducers: {
        changeStatus: (state) => {
            state.value = !state.value;
        },
        setStatus: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const { changeStatus, setStatus } = lidarSlice.actions;

export default lidarSlice.reducer;
