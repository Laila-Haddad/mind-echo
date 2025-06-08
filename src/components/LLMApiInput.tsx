import React, { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { llmService } from '../services/llmService';
import { useToast } from '../hooks/use-toast';
import AccessibleButton from './AccessibleButton';

const LLMApiInput: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSet, setIsSet] = useState(llmService.hasApiKey());
  const { toast } = useToast();

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }

    llmService.setApiKey(apiKey.trim());
    setIsSet(true);
    setApiKey('');
    
    toast({
      title: "Success",
      description: "LLM API key has been set successfully.",
    });
  };

  const handleClearApiKey = () => {
    llmService.setApiKey('');
    setIsSet(false);
    setApiKey('');
    
    toast({
      title: "Success",
      description: "LLM API key has been cleared.",
    });
  };

  if (isSet) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center space-x-2 text-green-600 mb-2">
          <Key className="w-5 h-5" />
          <span className="font-medium">LLM API Connected</span>
        </div>
        <p className="text-green-700 text-sm mb-3">
          Your API key is set and ready to enhance text accuracy.
        </p>
        <AccessibleButton
          onClick={handleClearApiKey}
          variant="secondary"
          size="small"
        >
          Clear API Key
        </AccessibleButton>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-center space-x-2 text-yellow-600 mb-2">
        <Key className="w-5 h-5" />
        <span className="font-medium">LLM API Key (Optional)</span>
      </div>
      <p className="text-yellow-700 text-sm mb-4">
        Enter your OpenAI API key to improve text correction and completion. 
        The app will work with basic corrections without an API key.
      </p>
      
      <div className="space-y-3">
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            aria-label="OpenAI API Key"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        <AccessibleButton
          onClick={handleSetApiKey}
          variant="secondary"
          size="small"
          disabled={!apiKey.trim()}
          className="w-full"
        >
          Set API Key
        </AccessibleButton>
      </div>
    </div>
  );
};

export default LLMApiInput;