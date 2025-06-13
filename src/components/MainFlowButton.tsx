import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Brain } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { eegProcessor } from '../services/eegProcessor';
import { eegClassifier } from '../services/eegClassifier';
import { llmService } from '../services/llmService';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

const MainFlowButton: React.FC = () => {
  const { state, startRecording, stopRecording, dispatch } = useApp();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(0);
  const [letterCountdown, setLetterCountdown] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (state.isRecording && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setLetterCountdown(2);
            setCurrentLetter(1);
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
    let letterInterval: NodeJS.Timeout;
    
    if (state.isRecording && countdown === 0 && letterCountdown > 0) {
      letterInterval = setInterval(() => {
        setLetterCountdown(prev => {
          if (prev <= 1) {
              setCurrentLetter(curr => curr + 1);
              return 2; 
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (letterInterval) {
        clearInterval(letterInterval);
      }
    };
  }, [state.isRecording, countdown, letterCountdown, currentLetter, stopRecording]);

  useEffect(() => {
    if (state.status === 'start_record') {
      setCountdown(2);
      setLetterCountdown(0);
      setCurrentLetter(1);
      setTimeout(() => {
        eegProcessor.startCollection();
      }, 2000);
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
      
      const rawData = eegProcessor.stopCollection();
      console.log(`Collected ${rawData.length} EEG samples`);
      
      dispatch({ type: 'SET_PROGRESS', payload: 30 });
      
      const segmentData = eegProcessor.processRecording(rawData);
      
      dispatch({ type: 'SET_PROGRESS', payload: 50 });
      
      const characterSequence = await eegClassifier.processAllSegments(segmentData);
      console.log('Classified character sequence:', characterSequence);
      
      dispatch({ type: 'SET_PROGRESS', payload: 70 });
      
      const llmResponse = await llmService.correctText(characterSequence);
      console.log('LLM corrected text:', llmResponse.correctedText);
      
      dispatch({ type: 'SET_PROGRESS', payload: 90 });
      
      dispatch({ type: 'SET_PROCESSED_TEXT', payload: llmResponse.correctedText });
      dispatch({ type: 'SET_STATUS', payload: 'data_processed' });
      dispatch({ type: 'SET_PROGRESS', payload: 100 });
      
    } catch (error) {
      console.error('Error processing EEG data:', error);
      toast({
        title: t('status.error'),
        description: t('status.training-failed') ,
        variant: "destructive",
      });

      dispatch({ type: 'SET_STATUS', payload: 'idle' });
    }
  };

  const handleButtonClick = () => {
    if (state.isRecording) {
      stopRecording();
      setLetterCountdown(0);
      setCurrentLetter(1);
    } else {
      startRecording();
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  };

  const getButtonText = () => {
    if (state.status === 'processing') {
      return t('buttons.processing');
    }
    if (state.isRecording) {
      return countdown > 0 ? t('buttons.get_ready') : t('buttons.stop_recording');
    }
    return t('buttons.start_recording');
  };

  const getButtonIcon = () => {
    if (state.status === 'processing') {
      return <Brain className="w-12 h-12" />;
    }
    return state.isRecording ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />;
  };

  const isButtonDisabled = countdown > 0 || state.status === 'processing' || state.status === 'training';
  const isAnimated = state.isRecording && countdown === 0 && letterCountdown > 0;

  return (
    <div className="flex flex-col items-center space-y-8">
      <button
        onClick={handleButtonClick}
        disabled={isButtonDisabled}
        className={`
          w-52 h-52 rounded-full 
          bg-primary hover:bg-primary/90 
          text-primary-foreground font-bold text-xl
          shadow-lg border-4 border-primary-foreground/20
          transition-all 
          focus:outline-none focus:ring-8 focus:ring-primary/40
          disabled:opacity-50 
          flex flex-col items-center justify-center space-y-2
          ${isAnimated ? 'animate-pulse' : ''}
          ${!isButtonDisabled ? 'hover:scale-105 active:scale-95' : ''}
        `}
        aria-label={getButtonText()}
      >
        {getButtonIcon()}
        <span className="text-center leading-tight">{getButtonText()}</span>
      </button>

      {state.status === 'processing' && (
        <div className="w-full max-w-md">
          <div className="bg-muted/20 rounded-lg p-4">
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
          <div className="text-8xl font-bold text-primary animate-pulse">
            {countdown}
          </div>
          <p className="text-muted-foreground mt-4 text-xl">{t('recording.get_ready')}</p>
        </div>
      )}

      {letterCountdown > 0 && state.isRecording && countdown === 0 && (
        <div className="text-center">
          <div className="text-8xl font-bold text-secondary">
            {letterCountdown}
          </div>
          <p className="text-foreground mt-4 text-2xl font-semibold">
            {t('recording.focus_instruction')}
          </p>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('recording.letters_recorded', { count: currentLetter - 1 })}
          </p>
        </div>
      )}
    </div>
  );
};

export default MainFlowButton;