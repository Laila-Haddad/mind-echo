import React, { useState } from 'react';
import { GraduationCap, CheckCircle, Play } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { eegProcessor } from '../services/eegProcessor';
import { eegClassifier } from '../services/eegClassifier';
import AccessibleButton from './AccessibleButton';
import { Card } from './ui/card';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

const TrainingButton: React.FC = () => {
  const { state, startTraining, dispatch } = useApp();
  const { t } = useTranslation();
  const [trainingStep, setTrainingStep] = useState(0); // Renamed to indicate overall training state
  const [stepCountdown, setStepCountdown] = useState(0);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const { toast } = useToast();


  const handleStartTraining = async () => {
    startTraining();
    setTrainingStep(1); // Indicate training has started (step 1 of 1)
    setTrainingData([]);
    await performTrainingStep(); // Call without step parameter
  };

  // Modified to handle a single training step
  const performTrainingStep = async () => {
    try {
      console.log(`Starting single training step`);

      // Start 10-second countdown
      setStepCountdown(10);
      const countdownInterval = setInterval(() => {
        setStepCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start EEG collection for this training sample
      eegProcessor.startCollection();

      // Wait for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Stop collection and get data
      const rawData = eegProcessor.stopCollection();
      const segmentData = eegProcessor.processRecording(rawData);

      // Store training data (only one segment expected for single step)
      const singleTrainingData = [segmentData.segments[0]];
      setTrainingData(singleTrainingData);

      // Complete training after the single step
      await completeTraining(singleTrainingData);

    } catch (error) {
      console.error('Training step error:', error);
      toast({
        title: t('status.error'),
        description: t('status.training-failed'),
        variant: "destructive",
      });
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_TRAINING', payload: false });
      setTrainingStep(0);
    }
  };

  const completeTraining = async (finalTrainingData: any[]) => {
    try {

      await eegClassifier.trainStartSymbol(finalTrainingData);

      // Update state
      dispatch({ type: 'SET_STATUS', payload: 'awaiting_symbol' });
      dispatch({ type: 'SET_TRAINING', payload: false });
      dispatch({ type: 'SET_EEG_DRIVEN', payload: true });

      setTrainingStep(0);

      console.log('Training completed successfully');
    } catch (error) {

      toast({
        title: t('status.error'),
        description: t('status.training-failed') ,
        variant: "destructive",
      });

      dispatch({ type: 'SET_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_TRAINING', payload: false });
      setTrainingStep(0);
    }
  };

  if (state.status === 'awaiting_symbol') {
    return (
      <div className="text-center space-y-4">
        <div className="bg-accent/20 border border-accent rounded-lg p-6 max-w-md mx-auto">
          <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">{t('training.complete.title')}</h3>
          <p className="text-muted-foreground">{t('training.complete.description')}</p>
        </div>

        <div className="bg-primary/20 border border-primary rounded-lg p-4 max-w-md mx-auto">
          <div className="text-lg font-semibold text-foreground mb-2">
            {t('training.active.title')}
          </div>
          <p className="text-muted-foreground">{t('training.active.description')}</p>
        </div>
      </div>
    );
  }

  if (state.status !== 'training') {
    return (
      <Card className="text-center space-y-6 mx-9 p-4 gap-0 bg-muted flex flex-col justify-center items-center">
        <h3 className="text-xl font-semibold text-foreground">{t('training.title')}</h3>
        <p className="text-muted-foreground">{t('training.description')}</p>
        <ul className="text-md text-muted-foreground list-none list-inside space-y-1">
          <li>{t('training.options.1')}</li>
          <li>{t('training.options.2')}</li>
          <li>{t('training.options.3')}</li>
          <li>{t('training.options.4')}</li>
        </ul>
        <p className="text-foreground font-medium">{t('training.instruction')}</p>
        <AccessibleButton
          onClick={handleStartTraining}
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

  if (state.status === 'training') {
    return (
      <div className="text-center space-y-6">
        <div className="bg-primary/20 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-3xl font-bold text-primary mb-4">
            {t('training.progress.title')}
          </div>

          {stepCountdown > 0 ? (
            <>
              <div className="text-6xl font-bold text-secondary mb-4">
                {stepCountdown}
              </div>
              <p className="text-secondary mt-2">
                {t('training.progress.countdown', { count: stepCountdown })}
              </p>
            </>
          ) : (
            <div className="text-lg text-foreground">
              {t('training.progress.processing')}
            </div>
          )}

          <div className="mt-6 w-full bg-background rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: stepCountdown === 0 ? '100%' : '0%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrainingButton;