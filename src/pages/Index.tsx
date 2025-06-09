import React, { useEffect } from "react";
import { Brain } from "lucide-react";
import { AppProvider } from "../contexts/AppContext";
import { eegClassifier } from "../services/classifier";
import MainFlowButton from "../components/MainFlowButton";
import TrainingButton from "../components/TrainingButton";
import DisplayArea from "../components/DisplayArea";
import StatusIndicator from "../components/StatusIndicator";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const IndexContent: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // await eegClassifier.loadModel();
        await eegClassifier.loadStartSymbolModel();
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <header className="border-b border-border shadow-sm -m-8 z-50 fixed w-full bg-card">
        <div className="container mx-auto px-4 py-4">
          <div dir="ltr" className="flex items-center justify-center space-x-3">

            <Brain className="w-9 h-9 text-secondary" />
            <h1 className="text-3xl md:text-3xl text-secondary font-bold">
              {t('app.name')}
            </h1>
          </div>
        <LanguageSwitcher/>

        </div>
      </header>

      {/* Main content */}
      <main className="md:px-4 py-8 space-y-12 grid items-center justify-center">
        <section
          aria-label="Recording Controls"
          className="text-center space-y-8 mt-8"
        >
          <Card className="bg-gray-100 flex flex-col gap-4 border-border p-8 md:w-[70vw] min-h-[60vh]">
            <p className="text-center font-bold text-2xl text-md">
              {t('modes.manual.title')}
            </p>
            <p className="text-muted-foreground">
              {t('modes.manual.description')}
            </p>

            <MainFlowButton />
          </Card>
        </section>

        <DisplayArea />

        <p className="text-center text-muted-foreground font-bold text-lg">
          {t('instructions.alternative')}
        </p>

        <section
          aria-label="Recording Controls"
          className="text-center space-y-8 mt-6"
        >
          <Card className="bg-gray-100 flex flex-col gap-4 border-border p-4 pb-10 md:w-[70vw] min-h-[60vh]">
            <p className="text-center py-4 font-bold text-2xl text-md">
              {t('modes.eeg.title')}
            </p>
            <TrainingButton />
          </Card>
        </section>
      </main>

      <div aria-label="Instructions" className="-mx-8 bg-muted mt-10 h-fit p-24 pt-8">
        <h2 className="text-2xl font-bold text-primary mb-8 text-center">
          {t('instructions.title')}
        </h2>
        <div className="grid gap-16 md:grid-cols-2">
          <Card className="space-y-4 p-8 bg-white">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t('instructions.manual.title')}
              </h3>
              <ul className=" space-y-2 text-muted-foreground">
                <li>{t('instructions.manual.steps.1')}</li>
                <li>{t('instructions.manual.steps.2')}</li>
                <li>{t('instructions.manual.steps.3')}</li>
                <li>{t('instructions.manual.steps.4')}</li>
                <li>{t('instructions.manual.steps.5')}</li>
              </ul>
            </div>
          </Card>
          <Card className="space-y-4 p-8 bg-white">
            <h3 className="text-lg font-semibold text-foreground">
              {t('instructions.eeg.title')}
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>{t('instructions.eeg.steps.1')}</li>
              <li>{t('instructions.eeg.steps.2')}</li>
              <li>{t('instructions.eeg.steps.3')}</li>
              <li>{t('instructions.eeg.steps.4')}</li>
              <li>{t('instructions.eeg.steps.5')}</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Status indicator */}
      <StatusIndicator />

      {/* Footer */}
      <footer  className="border-t border-border -m-8 bg-secondary">
        <div className="container mx-auto px-10 py-6 text-center flex justify-between items-center">
          <div dir="ltr"  className="flex items-center w-fit justify-center space-x-3">
            <Brain className="w-8 h-8 text-white" />
            <h1 className="text-2xl md:text-2xl text-white font-bold">
              {t('app.name')}
            </h1>
          </div>
          <p className="text-white">
            {t('app.description')}
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
