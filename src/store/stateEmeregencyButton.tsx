// stateEmergencyButton.ts
import { createSlice } from '@reduxjs/toolkit';

export interface EmergencyButtonState {
    value: boolean;
}

const initialState: EmergencyButtonState = {
    value: false,
};

const emergencyButton = createSlice({
    name: 'emergencyButton',
    initialState,
    reducers: {
        changeStatus: (state) => {
            state.value = !state.value;
        },
    },
});

export const { changeStatus } = emergencyButton.actions;

export default emergencyButton.reducer;
