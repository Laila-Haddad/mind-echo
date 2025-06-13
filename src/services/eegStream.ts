import { EEGSample } from "./eegProcessor";

class EEGStream {
    ws = null;
    isConnected = false;
    sampleListeners : ((sample: EEGSample) => void)[] = [];
    statusListeners = [];
    
    constructor() {
      this.ws = null;
      this.isConnected = false;
      this.sampleListeners = [];
      this.statusListeners = [];
    }

    errorListeners: ((errMsg: string) => void)[] = [];

    connect(url = 'ws://127.0.0.1:6868') {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        return; 
      }
      this.ws = new window.WebSocket(url);
  
      this.ws.onopen = () => {
        this.isConnected = true;
        this.statusListeners.forEach(fn => fn(true));
        const authorizeMsg = JSON.stringify({
          jsonrpc: "2.0", method: "authorize", params: {}, id: 1
        });
        this.ws.send(authorizeMsg);
      };
  
      this.ws.onerror = (event) => {
        this.isConnected = false;
        this.statusListeners.forEach(fn => fn(false));
        this.errorListeners.forEach(fn => fn("Failed to connect to EEG device. Please check the connection and try again."));
      };
      
      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.statusListeners.forEach(fn => fn(false));
        if (!this.isConnected) {
          this.errorListeners.forEach(fn => fn("Connection to EEG device closed or refused. Make sure the device server is running."));
        }
      };
  
      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
  
          if (data.result && data.result.cortexToken) {
            this.ws.send(JSON.stringify({
              jsonrpc: "2.0", method: "createSession",
              params: { }, id: 2
            }));
          } else if (data.result && data.result.id) { 
            
            this.ws.send(JSON.stringify({
              jsonrpc: "2.0", method: "subscribe",
              params: {
                session: data.result.id,
                streams: ["eeg"]
              }, id: 3
            }));
          } else if (data.eeg) {
            const sample = {
              timestamp: data.time || Date.now(),
              channels: data.eeg,
              quality: 100 
            };
            this.sampleListeners.forEach(fn => fn(sample));
          }
  
        } catch (e) {
        }
      };
    }
    isDeviceConnected() {
      return !!this.ws && this.isConnected;
    }

    onSample(cb: (sample: EEGSample) => void) {
      this.sampleListeners.push(cb);
    }
  
    offSample(cb: (sample: EEGSample) => void) {
      this.sampleListeners = this.sampleListeners.filter(fn => fn !== cb);
    }
    onStatus(callback) {
      this.statusListeners.push(callback);
    }
    onError(callback: (errMsg: string) => void) {
        this.errorListeners.push(callback);
    }
    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.isConnected = false;
    }
  }
  
  export const eegStream = new EEGStream();