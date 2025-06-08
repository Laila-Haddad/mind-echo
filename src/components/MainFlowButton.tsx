import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Brain, Speaker } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { eegProcessor } from '../services/eegProcessor';
import { eegClassifier } from '../services/classifier';
import { llmService } from '../services/llmService';
import { ttsService } from '../services/ttsService';
import AccessibleButton from './AccessibleButton';

const MainFlowButton: React.FC = () => {
  const { state, startRecording, stopRecording, dispatch } = useApp();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (state.isRecording && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [state.isRecording, countdown]);

  useEffect(() => {
    if (state.status === 'start_record') {
      setCountdown(2);
      eegProcessor.startCollection();
    }
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'processing') {
      processEEGData();
    }
  }, [state.status]);

  const processEEGData = async () => {
    try {
      dispatch({ type: 'SET_PROGRESS', payload: 10 });
      
      // Stop EEG collection and get data
      const rawData = eegProcessor.stopCollection();
      console.log(`Collected ${rawData.length} EEG samples`);
      
      dispatch({ type: 'SET_PROGRESS', payload: 30 });
      
      // Process into segments
      const segmentData = eegProcessor.processRecording(rawData);
      
      dispatch({ type: 'SET_PROGRESS', payload: 50 });
      
      // Classify segments to get character sequence
      const characterSequence = await eegClassifier.processAllSegments(segmentData);
      console.log('Classified character sequence:', characterSequence);
      
      dispatch({ type: 'SET_PROGRESS', payload: 70 });
      
      // Send to LLM for correction
      const llmResponse = await llmService.correctText(characterSequence);
      console.log('LLM corrected text:', llmResponse.correctedText);
      
      dispatch({ type: 'SET_PROGRESS', payload: 90 });
      
      // Update state with processed text
      dispatch({ type: 'SET_PROCESSED_TEXT', payload: llmResponse.correctedText });
      dispatch({ type: 'SET_STATUS', payload: 'data_processed' });
      dispatch({ type: 'SET_PROGRESS', payload: 100 });
      
    } catch (error) {
      console.error('Error processing EEG data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to process EEG data. Please try again.' });
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
    }
  };

  const handleButtonClick = () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  };

  const getButtonText = () => {
    if (state.status === 'processing') {
      return 'Processing EEG Data...';
    }
    if (state.isRecording) {
      return countdown > 0 ? `Recording in ${countdown}s` : 'Stop Recording';
    }
    return 'Start Recording';
  };

  const getButtonIcon = () => {
    if (state.status === 'processing') {
      return <Brain className="w-8 h-8" />;
    }
    return state.isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <AccessibleButton
        onClick={handleButtonClick}
        loading={state.status === 'processing'}
        disabled={state.status === 'training'}
        className="flex items-center space-x-4"
        aria-label={getButtonText()}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </AccessibleButton>

      {state.status === 'processing' && (
        <div className="w-full max-w-md">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Processing</span>
              <span>{state.progress}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {countdown > 0 && state.isRecording && (
        <div className="text-center">
          <div className="text-6xl font-bold text-primary animate-pulse">
            {countdown}
          </div>
          <p className="text-muted-foreground mt-2">Get ready to focus...</p>
        </div>
      )}
    </div>
  );
};

export default MainFlowButton;