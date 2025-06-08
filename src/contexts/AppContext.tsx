import React, { createContext, useContext, useReducer, useCallback } from 'react';

export type AppStatus = 'idle' | 'start_record' | 'processing' | 'data_processed' | 'training' | 'awaiting_symbol';

interface AppState {
  status: AppStatus;
  processedText: string;
  isRecording: boolean;
  isTraining: boolean;
  countdown: number;
  currentLetter: string;
  eegDriven: boolean;
  error: string | null;
  progress: number;
}

type AppAction =
  | { type: 'SET_STATUS'; payload: AppStatus }
  | { type: 'SET_PROCESSED_TEXT'; payload: string }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_TRAINING'; payload: boolean }
  | { type: 'SET_COUNTDOWN'; payload: number }
  | { type: 'SET_CURRENT_LETTER'; payload: string }
  | { type: 'SET_EEG_DRIVEN'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'RESET' };

const initialState: AppState = {
  status: 'idle',
  processedText: '',
  isRecording: false,
  isTraining: false,
  countdown: 0,
  currentLetter: '',
  eegDriven: false,
  error: null,
  progress: 0,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_PROCESSED_TEXT':
      return { ...state, processedText: action.payload };
    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };
    case 'SET_TRAINING':
      return { ...state, isTraining: action.payload };
    case 'SET_COUNTDOWN':
      return { ...state, countdown: action.payload };
    case 'SET_CURRENT_LETTER':
      return { ...state, currentLetter: action.payload };
    case 'SET_EEG_DRIVEN':
      return { ...state, eegDriven: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  startRecording: () => void;
  stopRecording: () => void;
  startTraining: () => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const startRecording = useCallback(() => {
    dispatch({ type: 'SET_RECORDING', payload: true });
    dispatch({ type: 'SET_STATUS', payload: 'start_record' });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const stopRecording = useCallback(() => {
    dispatch({ type: 'SET_RECORDING', payload: false });
    dispatch({ type: 'SET_STATUS', payload: 'processing' });
  }, []);

  const startTraining = useCallback(() => {
    dispatch({ type: 'SET_TRAINING', payload: true });
    dispatch({ type: 'SET_STATUS', payload: 'training' });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const resetApp = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      startRecording, 
      stopRecording, 
      startTraining, 
      resetApp 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};