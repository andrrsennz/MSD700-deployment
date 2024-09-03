import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the shape of the global state
interface GlobalState {
    // Add your state properties here
    user: string | null;
}

// Initial global state
const initialState: GlobalState = {
    user: null,
};

// Define actions for your global state
type Action = { type: 'SET_USER'; payload: string | null };

// Create a reducer function to handle state updates
function globalStateReducer(state: GlobalState, action: Action): GlobalState {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
            };
        default:
            return state;
    }
}

// Create the context
const GlobalStateContext = createContext<{ state: GlobalState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// Create a provider component
export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(globalStateReducer, initialState);

    return (
        <GlobalStateContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

// Create a custom hook to use the global state
export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (!context) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
};
