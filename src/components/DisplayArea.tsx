import React from 'react';
import { Speaker, Copy, Share2, RotateCcw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ttsService } from '../services/ttsService';
import { useToast } from '../hooks/use-toast';
import AccessibleButton from './AccessibleButton';
import { useTranslation } from 'react-i18next';

const DisplayArea: React.FC = () => {
  const { state, resetApp } = useApp();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleReadAloud = async () => {
    try {
      if (ttsService.isSpeaking()) {
        ttsService.stop();
        return;
      }

      if (!ttsService.isSupported()) {
        toast({
          title: t('status.error'),
          description: t('display_area.errors.tts_not_supported'),
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
        title: t('status.data_processed'),
        description: t('display_area.success.text_read'),
      });
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: t('status.error'),
        description: t('display_area.errors.tts_failed'),
        variant: "destructive",
      });
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(state.processedText);
      toast({
        title: t('status.data_processed'),
        description: t('display_area.success.text_copied'),
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: t('status.error'),
        description: t('display_area.errors.copy_failed'),
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('app.name'),
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
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-card-foreground mb-4 text-center">
          {t('display_area.generated_text')}
        </h2>
        <div 
          className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center text-secondary font-medium min-h-[120px] flex items-center justify-center"
          role="main"
          aria-label={t('display_area.aria.generated_text')}
        >
          "{state.processedText}"
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <AccessibleButton
          onClick={handleReadAloud}
          variant="primary"
          size="medium"
          className="flex items-center space-x-2 gap-2"
          aria-label={ttsService.isSpeaking() ? t('display_area.aria.stop_button') : t('display_area.aria.read_button')}
        >
          <Speaker className="w-5 h-5" />
          <span className='!m-0'>{ttsService.isSpeaking() ? t('display_area.stop_reading') : t('display_area.read_aloud')}</span>
        </AccessibleButton>

        <AccessibleButton
          onClick={handleCopyText}
          variant="secondary"
          size="medium"
          className="flex items-center space-x-2 gap-2"
          aria-label={t('display_area.aria.copy_button')}
        >
          <Copy className="w-5 h-5" />
          <span className='!m-0'>{t('display_area.copy_text')}</span>
        </AccessibleButton>

        <AccessibleButton
          onClick={handleShare}
          variant="secondary"
          size="medium"
          className="flex items-center space-x-2 gap-2"
          aria-label={t('display_area.aria.share_button')}
        >
          <Share2 className="w-5 h-5" />
          <span className='!m-0'>{t('display_area.share')}</span>
        </AccessibleButton>

        <AccessibleButton
          onClick={resetApp}
          variant="secondary"
          size="medium"
          className="flex items-center space-x-2 gap-2"
          aria-label={t('display_area.aria.new_recording_button')}
        >
          <RotateCcw className="w-5 h-5" />
          <span className='!m-0'>{t('display_area.new_recording')}</span>
        </AccessibleButton>
      </div>
    </div>
  );
};

export default DisplayArea;