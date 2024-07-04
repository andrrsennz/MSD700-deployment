// store/types.ts
import { combineReducers } from '@reduxjs/toolkit';
import emergencyButtonReducer, { EmergencyButtonState } from './stateEmeregencyButton';
import lidarButtonReducer, { LidarState } from './stateLidar'; // Adjust import path as needed

export interface RootState {
  emergencyState: EmergencyButtonState;
  lidarState: LidarState;
  // Add more slices as your app grows
}

// Combine all reducers into a single root reducer
export const rootReducer = combineReducers({
  emergencyState: emergencyButtonReducer,
  lidarState: lidarButtonReducer,
  // Add more reducers as needed
});
