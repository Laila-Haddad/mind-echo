import React from 'react';
import { Speaker, Copy, Share2, RotateCcw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ttsService } from '../services/ttsService';
import { useToast } from '../hooks/use-toast';
import AccessibleButton from './AccessibleButton';

const DisplayArea: React.FC = () => {
  const { state, resetApp } = useApp();
  const { toast } = useToast();

  const handleReadAloud = async () => {
    try {
      if (ttsService.isSpeaking()) {
        ttsService.stop();
        return;
      }

      if (!ttsService.isSupported()) {
        toast({
          title: "Error",
          description: "Text-to-speech is not supported in this browser.",
          variant: "destructive",
        });
        return;
      }

      await ttsService.speak(state.processedText, {
        rate: 0.8,
        pitch: 1,
        volume: 1,
      });

      toast({
        title: "Success",
        description: "Text has been read aloud.",
      });
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: "Error",
        description: "Failed to read text aloud. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(state.processedText);
      toast({
        title: "Success",
        description: "Text copied to clipboard.",
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: "Error",
        description: "Failed to copy text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EEG-Generated Text',
          text: state.processedText,
        });
      } catch (error) {
        console.error('Share error:', error);
        handleCopyText(); // Fallback to copy
      }
    } else {
      handleCopyText(); // Fallback to copy
    }
  };

  if (state.status !== 'data_processed' || !state.processedText) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main text display */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-card-foreground mb-4 text-center">
          Generated Text
        </h2>
        <div 
          className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center text-card-foreground font-medium min-h-[120px] flex items-center justify-center"
          role="main"
          aria-label="Generated text from EEG signals"
        >
          "{state.processedText}"
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <AccessibleButton
          onClick={handleReadAloud}
          variant="primary"
          size="medium"
          className="flex items-center space-x-2"
          aria-label={ttsService.isSpeaking() ? "Stop reading" : "Read text aloud"}
        >
          <Speaker className="w-5 h-5" />
          <span>{ttsService.isSpeaking() ? 'Stop' : 'Read Aloud'}</span>
        </AccessibleButton>

        <AccessibleButton
          onClick={handleCopyText}
          variant="secondary"
          size="medium"
          className="flex items-center space-x-2"
          aria-label="Copy text to clipboard"
        >
          <Copy className="w-5 h-5" />
          <span>Copy Text</span>
        </AccessibleButton>

        <AccessibleButton
          onClick={handleShare}
          variant="secondary"
          size="medium"
          className="flex items-center space-x-2"
          aria-label="Share text"
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </AccessibleButton>

        <AccessibleButton
          onClick={resetApp}
          variant="secondary"
          size="medium"
          className="flex items-center space-x-2"
          aria-label="Start new recording"
        >
          <RotateCcw className="w-5 h-5" />
          <span>New Recording</span>
        </AccessibleButton>
      </div>
    </div>
  );
};

export default DisplayArea;