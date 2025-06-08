import React, { useState } from 'react';
import { GraduationCap, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { eegProcessor } from '../services/eegProcessor';
import { eegClassifier } from '../services/classifier';
import AccessibleButton from './AccessibleButton';

const TrainingButton: React.FC = () => {
  const { state, startTraining, dispatch } = useApp();
  const [trainingStep, setTrainingStep] = useState(0);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const totalSteps = 5;

  const handleStartTraining = async () => {
    startTraining();
    setTrainingStep(1);
    setTrainingData([]);
    await performTrainingStep(1);
  };

  const performTrainingStep = async (step: number) => {
    try {
      console.log(`Training step ${step}/${totalSteps}`);
      
      // Start EEG collection for this training sample
      eegProcessor.startCollection();
      
      // Wait for user to perform the start symbol (simulate 3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stop collection and get data
      const rawData = eegProcessor.stopCollection();
      const segmentData = eegProcessor.processRecording(rawData);
      
      // Store training data
      const newTrainingData = [...trainingData, segmentData.segments[0]];
      setTrainingData(newTrainingData);
      
      if (step < totalSteps) {
        setTrainingStep(step + 1);
        // Wait a moment before next step
        setTimeout(() => performTrainingStep(step + 1), 2000);
      } else {
        // Complete training
        await completeTraining(newTrainingData);
      }
    } catch (error) {
      console.error('Training step error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Training failed. Please try again.' });
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_TRAINING', payload: false });
    }
  };

  const completeTraining = async (finalTrainingData: any[]) => {
    try {
      console.log('Completing start symbol training...');
      
      // Train the start symbol model
      await eegClassifier.trainStartSymbol(finalTrainingData);
      
      // Update state
      dispatch({ type: 'SET_STATUS', payload: 'awaiting_symbol' });
      dispatch({ type: 'SET_TRAINING', payload: false });
      dispatch({ type: 'SET_EEG_DRIVEN', payload: true });
      
      console.log('Training completed successfully');
    } catch (error) {
      console.error('Training completion error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete training. Please try again.' });
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_TRAINING', payload: false });
    }
  };

  const getTrainingText = () => {
    if (state.status === 'training') {
      return `Training Step ${trainingStep}/${totalSteps}`;
    }
    if (state.status === 'awaiting_symbol') {
      return 'Awaiting Start Symbol';
    }
    return 'Train Start Symbol';
  };

  const getTrainingIcon = () => {
    if (state.status === 'awaiting_symbol') {
      return <CheckCircle className="w-6 h-6" />;
    }
    return <GraduationCap className="w-6 h-6" />;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <AccessibleButton
        onClick={handleStartTraining}
        variant="secondary"
        size="medium"
        loading={state.status === 'training'}
        disabled={state.status === 'start_record' || state.status === 'processing'}
        className="flex items-center space-x-3"
        aria-label={getTrainingText()}
      >
        {getTrainingIcon()}
        <span>{getTrainingText()}</span>
      </AccessibleButton>

      {state.status === 'training' && (
        <div className="text-center space-y-4">
          <div className="bg-muted rounded-lg p-4 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Training Your Start Symbol</h3>
            <p className="text-muted-foreground mb-4">
              Perform your unique start action when prompted. This could be:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Imagine saying "START"</li>
              <li>Think of clenching your right fist</li>
              <li>Visualize raising your left hand</li>
              <li>Any consistent mental action</li>
            </ul>
          </div>
          
          <div className="bg-primary/10 rounded-lg p-6">
            <div className="text-2xl font-bold text-primary mb-2">
              Step {trainingStep} of {totalSteps}
            </div>
            <div className="text-lg">Perform your start symbol NOW</div>
            <div className="mt-4 w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(trainingStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {state.status === 'awaiting_symbol' && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800">Training Complete!</h3>
            <p className="text-green-700">
              Your start symbol has been trained. The system is now monitoring for your start symbol.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
            <div className="text-lg font-semibold text-blue-800 mb-2">
              EEG-Driven Mode Active
            </div>
            <p className="text-blue-700">
              Perform your trained start symbol to begin recording automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingButton;