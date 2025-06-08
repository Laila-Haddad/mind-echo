import { AppStatus } from '../contexts/AppContext';

// Global application status manager
class AppStatusManager {
  private currentStatus: AppStatus = 'idle';
  private listeners: ((status: AppStatus) => void)[] = [];
  private processingData: any = null;

  setStatus(status: AppStatus): void {
    console.log(`Status change: ${this.currentStatus} -> ${status}`);
    this.currentStatus = status;
    this.notifyListeners();
  }

  getStatus(): AppStatus {
    return this.currentStatus;
  }

  addListener(callback: (status: AppStatus) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (status: AppStatus) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  setProcessingData(data: any): void {
    this.processingData = data;
  }

  getProcessingData(): any {
    return this.processingData;
  }

  clearProcessingData(): void {
    this.processingData = null;
  }

  reset(): void {
    this.currentStatus = 'idle';
    this.processingData = null;
    this.notifyListeners();
  }
}

export const appStatusManager = new AppStatusManager();
