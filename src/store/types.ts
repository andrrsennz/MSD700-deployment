// store/index.ts or store/types.ts
import { combineReducers } from '@reduxjs/toolkit';
import emergencyButtonReducer, { EmergencyButtonState } from './stateEmeregencyButton'; // Adjust import path as needed

export interface RootState {
  emergencyState: EmergencyButtonState;
  // Add more slices as your app grows
}

// Combine all reducers into a single root reducer
export const rootReducer = combineReducers({
  emergencyState: emergencyButtonReducer,
  // Add more reducers as needed
});
