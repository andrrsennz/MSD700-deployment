// store/types.ts
import { combineReducers } from "@reduxjs/toolkit";
import emergencyButtonReducer, {
  EmergencyButtonState,
} from "./stateEmeregencyButton";
import lidarButtonReducer, { LidarState } from "./stateLidar"; // Adjust import path as needed
import mapSelectedReducer, { MapSelectedState } from "./stateMapSelected";

export interface RootState {
  emergencyState: EmergencyButtonState;
  lidarState: LidarState;
  mapSelected: MapSelectedState;
  // Add more slices as your app grows
}

// Combine all reducers into a single root reducer
export const rootReducer = combineReducers({
  emergencyState: emergencyButtonReducer,
  lidarState: lidarButtonReducer,
  mapSelected: mapSelectedReducer,
  // Add more reducers as needed
});
