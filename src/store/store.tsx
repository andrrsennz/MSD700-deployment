// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer, RootState } from "./types"; // Adjust import path as needed

export function makeStore() {
  return configureStore({
    reducer: rootReducer,
    // devTools: process.env.NODE_ENV !== "production",
  });
}

export const store = makeStore();
