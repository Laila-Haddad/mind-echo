import React, { useEffect, useState } from "react";
import { eegStream } from "@/services/eegStream";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import AccessibleButton from "./AccessibleButton";
import { Brain } from "lucide-react";

const steps = [
  "eeg_connection.step1",
  "eeg_connection.step2",
  "eeg_connection.step3",
  "eeg_connection.step4",
];

export default function EEGConnectPanel({setDisplay}) {
  const [connected, setConnected] = useState(eegStream.isDeviceConnected());
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    eegStream.onStatus(setConnected);
  }, []);

  useEffect(() => {
  if (connected) {
    setDisplay(true)
      toast({
        title: t("eeg_connection.toast_connected_title"),
        description: t("eeg_connection.toast_connected_desc"),
      });
    }
  }, [connected, t, toast]);

  useEffect(() => {
    function handleError(errMsg: string) {
      toast({
        title: t("eeg_connection.toast_error_title"),
        description: t("eeg_connection.toast_error_desc") || errMsg,
        variant: "destructive",
      });
    }
    eegStream.onError(handleError);
    return () => {
    };
  }, [toast, t]);

  const handleConnect = () => {
        eegStream.connect();
    toast({
      title: t("eeg_connection.toast_connecting_title"),
      description: t("eeg_connection.toast_connecting_desc"),
    });}
  

  return (
    <div className="w-full max-w-xl mx-auto bg-muted border border-border rounded-lg p-8 shadow-lg space-y-6">
      <h2 className="text-xl font-semibold text-center text-primary mb-2">
        {t("eeg_connection.title")}
      </h2>
      <ul className="list-none list-inside space-y-2 text-base text-muted-foreground">
        {steps.map((key, idx) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
      <div className="text-center ">
        <AccessibleButton
          onClick={handleConnect}
          disabled={connected}
          aria-label={t("eeg_connection.connect_btn_aria")}
          variant="secondary"
          size="large"
          className={`
            rounded-md 
            flex
            gap-1
            m-auto
            text-white 
            text-[1.08rem] 
            font-medium 
            transition-colors 
            duration-200 
            border-none
            ${
              connected
                ? "bg-slate-800 cursor-default hover:bg-slate-800"
                : "bg-secondary cursor-pointer"
            }
            `}
        >
          <Brain className="w-6 h-6" />
          <span className="!m-0">
            {connected
              ? t("eeg_connection.connected")
              : t("eeg_connection.connect")}
          </span>
        </AccessibleButton>
      </div>
    </div>
  );
}
