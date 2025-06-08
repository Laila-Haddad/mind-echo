import React, { useEffect } from 'react';
import { Brain } from 'lucide-react';
import { AppProvider } from '../contexts/AppContext';
import { eegClassifier } from '../services/classifier';
import MainFlowButton from '../components/MainFlowButton';
import TrainingButton from '../components/TrainingButton';
import DisplayArea from '../components/DisplayArea';
import StatusIndicator from '../components/StatusIndicator';
import LLMApiInput from '../components/LLMApiInput';

const IndexContent: React.FC = () => {
  useEffect(() => {
    // Initialize the EEG classifier model on app load
    const initializeApp = async () => {
      try {
        // await eegClassifier.loadModel();
        await eegClassifier.loadStartSymbolModel();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-card-foreground">
              EEG Text-to-Speech
            </h1>
          </div>
          <p className="text-center text-muted-foreground mt-2 text-lg">
            Transform your thoughts into speech using EEG signals
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* LLM API Input */}
        <section aria-label="API Configuration">
          <LLMApiInput />
        </section>

        {/* Main controls */}
        <section aria-label="Recording Controls" className="text-center space-y-8">
          <MainFlowButton />
          <div className="border-t border-border pt-8">
            <TrainingButton />
          </div>
        </section>

        {/* Results display */}
        <section aria-label="Generated Text Results">
          <DisplayArea />
        </section>

        {/* Instructions */}
        <section aria-label="Instructions" className="max-w-4xl mx-auto">
          <div className="bg-muted rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              How to Use
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Manual Recording</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Click "Start Recording" when ready</li>
                  <li>Focus on the letters you want to communicate</li>
                  <li>Click "Stop Recording" when finished</li>
                  <li>Wait for the system to process your thoughts</li>
                  <li>Listen to or share the generated text</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">EEG-Driven Mode</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Click "Train Start Symbol" first</li>
                  <li>Follow the training prompts (5 steps)</li>
                  <li>Perform your trained symbol to start recording</li>
                  <li>Think your message, then repeat the symbol to stop</li>
                  <li>The system will automatically process the result</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility note */}
        <section aria-label="Accessibility Information" className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Accessibility Features</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Large, high-contrast buttons for easy interaction</li>
              <li>• Keyboard navigation support</li>
              <li>• Screen reader friendly with ARIA labels</li>
              <li>• Clear visual feedback for all actions</li>
              <li>• Audio output with text-to-speech</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Status indicator */}
      <StatusIndicator />

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">
            EEG-based assistive communication technology
          </p>
        </div>
      </footer>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <IndexContent />
    </AppProvider>
  );
};

export default Index;