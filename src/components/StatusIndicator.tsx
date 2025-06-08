import React from 'react';
import { Brain, Mic, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const StatusIndicator: React.FC = () => {
  const { state } = useApp();

  const getStatusInfo = () => {
    switch (state.status) {
      case 'idle':
        return {
          icon: <Brain className="w-6 h-6" />,
          text: 'Ready',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
      case 'start_record':
        return {
          icon: <Mic className="w-6 h-6 animate-pulse" />,
          text: 'Recording EEG',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          text: 'Processing Data',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'data_processed':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          text: 'Complete',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'training':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          text: 'Training Model',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        };
      case 'awaiting_symbol':
        return {
          icon: <Brain className="w-6 h-6 animate-pulse" />,
          text: 'Awaiting Start Symbol',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        };
      default:
        return {
          icon: <Brain className="w-6 h-6" />,
          text: 'Unknown',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${statusInfo.bgColor} border rounded-lg px-4 py-2 shadow-lg`}>
        <div className={`flex items-center space-x-2 ${statusInfo.color}`}>
          {statusInfo.icon}
          <span className="font-medium">{statusInfo.text}</span>
        </div>
      </div>

      {/* Error indicator */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow-lg mt-2">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{state.error}</p>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
