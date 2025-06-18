import React, { useState, useCallback, useEffect } from 'react';
import { GraduationCap, CheckCircle, Play } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import AccessibleButton from './AccessibleButton';
import { Card } from './ui/card';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

const TRAINING_TIME = 10; // 10 seconds per letter
const REST_TIME = 10; // 10 seconds rest between letters
const PROCESSING_TIME = 4000; // 4 seconds for processing simulation

const TrainingButton: React.FC = () => {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const [currentPhase, setCurrentPhase] = useState<'initial' | 'training' | 'rest' | 'processing' | 'complete'>('initial');
  const [countdown, setCountdown] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('');
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const { toast } = useToast();

  // Arabic alphabet array
  const alphabet = 'ابتخشطرعقل'.split('');

  const getRandomLetter = useCallback(() => {
    const availableLetters = alphabet.filter(letter => !usedLetters.includes(letter));
    if (availableLetters.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    return availableLetters[randomIndex];
  }, [usedLetters, alphabet]);

  const handlePhaseComplete = useCallback(() => {
    if (currentPhase === 'training') {
      // Check if this was the last letter
      const availableLettersCount = alphabet.length - usedLetters.length;
      if (availableLettersCount === 0) {
        // No more letters, go straight to processing
        setCurrentPhase('processing');
        setTimeout(() => {
          setCurrentPhase('complete');
          dispatch({ type: 'SET_STATUS', payload: 'idle' });
        }, PROCESSING_TIME);
      } else {
        // More letters available, proceed to rest phase
        setCurrentPhase('rest');
        setCountdown(REST_TIME);
      }
    } else if (currentPhase === 'rest') {
      const nextLetter = getRandomLetter();
      // At this point, nextLetter should technically always exist because the check
      // for `availableLettersCount === 0` happens during the 'training' phase completion.
      // However, it's good to keep the `if (nextLetter)` check for robustness.
      if (nextLetter) {
        // Continue with next letter
        setCurrentPhase('training');
        setCurrentLetter(nextLetter);
        setUsedLetters(prev => [...prev, nextLetter]);
        setCountdown(TRAINING_TIME);
      } else {
        // This 'else' block should theoretically not be hit if the logic above is correct,
        // but as a fallback, it would mean all letters are complete.
        setCurrentPhase('processing');
        setTimeout(() => {
          setCurrentPhase('complete');
          dispatch({ type: 'SET_STATUS', payload: 'idle' });
        }, PROCESSING_TIME);
      }
    }
  }, [currentPhase, getRandomLetter, dispatch, alphabet.length, usedLetters.length]); // Added dependencies

  // useEffect to manage the countdown timer
  useEffect(() => {
    if (currentPhase === 'training' || currentPhase === 'rest') {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      // Cleanup function for setInterval
      return () => clearInterval(timer);
    }
  }, [currentPhase]);

  // useEffect to handle countdown reaching zero
  useEffect(() => {
    // Only call handlePhaseComplete if countdown is 0 or less
    // and we are in a phase that has a countdown (training or rest)
    if ((currentPhase === 'training' || currentPhase === 'rest') && countdown <= 0) {
      handlePhaseComplete();
    }
  }, [countdown, currentPhase, handlePhaseComplete]);

  const startTraining = () => {
    dispatch({ type: 'SET_STATUS', payload: 'training' });
    const newLetter = getRandomLetter();
    if (newLetter) {
      setCurrentLetter(newLetter);
      setUsedLetters(prev => [...prev, newLetter]);
      setCurrentPhase('training'); // Set phase AFTER letter is chosen
      setCountdown(TRAINING_TIME);
    } else {
        toast({
            title: t('training.error.no_letters'),
            description: t('training.error.no_letters_desc'),
            variant: 'destructive',
        });
        resetTraining();
    }
  };

  const resetTraining = () => {
    setCurrentPhase('initial');
    setUsedLetters([]);
    setCurrentLetter('');
    setCountdown(0);
    dispatch({ type: 'SET_STATUS', payload: 'idle' });
  };

  if (currentPhase === 'complete') {
    return (
      <div className="text-center space-y-4">
        <div className="bg-accent/20 border border-accent rounded-lg p-6 max-w-md mx-auto flex flex-col gap-4 items-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">{t('training.complete.title')}</h3>
          <p className="text-muted-foreground">{t('training.complete.description')}</p>
          <AccessibleButton
            onClick={resetTraining}
            variant="secondary"
            size="large"
            className="mt-4"
          >
            {t('display_area.new_recording')}
          </AccessibleButton>
        </div>
      </div>
    );
  }

  if (currentPhase === 'initial') {
    return (
      <Card className="text-center space-y-8 mx-9 p-8 gap-0 bg-muted flex flex-col justify-center items-center">
        <h3 className="text-xl font-semibold text-foreground">{t('training.title')}</h3>
        <p className="text-foreground font-medium">{t('training.description')}</p>
        <p className="text-muted-foreground ">{t('training.instruction')}</p>
        <AccessibleButton
          onClick={startTraining}
          variant="secondary"
          size="large"
          className="flex items-center space-x-3 w-fit gap-2"
        >
          <Play className="w-6 h-6" />
          <span className='!m-0'>{t('training.start_button')}</span>
        </AccessibleButton>
      </Card>
    );
  }

  if (currentPhase === 'processing') {
    return (
      <div className="text-center space-y-6">
        <div className="bg-primary/20 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-lg text-foreground">
            {t('training.progress.processing')}
          </div>
          <div className="mt-6 w-full bg-background rounded-full h-3">
            <div className="bg-primary h-3 rounded-full transition-all duration-300 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="bg-primary/20 rounded-lg p-8 max-w-md mx-auto">
        {currentPhase === 'training' ? (
          <>
            <div className="text-6xl font-bold py-6 text-primary mb-4">
              {currentLetter}
            </div>
            <p className="text-secondary mt-2">
              {t('recording.focus_instruction_10')}
            </p>
          </>
        ) : ( // currentPhase === 'rest'
          <>
            <div className="text-3xl font-bold  py-6 text-primary mb-4">
              {t('recording.focus_instruction_rest')}
            </div>
            <p className="text-secondary mt-2">
              {t('recording.get_ready_rest')}
            </p>
          </>
        )}
        <div className="text-6xl font-bold text-secondary my-4">
          {countdown}
        </div>
        <div className="mt-6 w-full bg-background rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${(countdown / (currentPhase === 'training' ? TRAINING_TIME : REST_TIME)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrainingButton;