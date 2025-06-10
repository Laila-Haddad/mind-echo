export interface EEGSample {
  timestamp: number;
  channels: number[];
  quality: number; 
}

export interface EEGSegment {
  samples: EEGSample[];
  startTime: number;
  endTime: number;
}

class EEGProcessor {
  private isCollecting = false;
  private collectedData: EEGSample[] = [];
  private sampleRate = 128;
  private intervalId: NodeJS.Timeout | null = null;

  private simulateEEGSample(): EEGSample {
    return {
      timestamp: Date.now(),
      channels: Array.from({ length: 14 }, () => Math.random() * 100 - 50),
      quality: Math.random() * 100,
    };
  }

  startCollection(): void {
    console.log('Starting EEG data collection...');
    this.isCollecting = true;
    this.collectedData = [];
    
    // Collect at 128 Hz (every ~7.8ms)
    this.intervalId = setInterval(() => {
      if (this.isCollecting) {
        const sample = this.simulateEEGSample();
        this.collectedData.push(sample);
      }
    }, 1000 / this.sampleRate);
  }

  stopCollection(): EEGSample[] {
    console.log('Stopping EEG data collection...');
    this.isCollecting = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    return [...this.collectedData];
  }

  // Split recording into 2-second segments
  segmentIntoTwoSecond(data: EEGSample[]): EEGSegment[] {
    const segments: EEGSegment[] = [];
    const samplesPerSegment = this.sampleRate * 2; // 256 samples per 2-second segment
    
    for (let i = 0; i < data.length; i += samplesPerSegment) {
      const segmentSamples = data.slice(i, i + samplesPerSegment);
      if (segmentSamples.length === samplesPerSegment) {
        segments.push({
          samples: segmentSamples,
          startTime: segmentSamples[0].timestamp,
          endTime: segmentSamples[segmentSamples.length - 1].timestamp,
        });
      }
    }
    
    console.log(`Created ${segments.length} two-second segments`);
    return segments;
  }

  // Split 2-second segments into 250ms overlapping sub-segments
  createOverlappingSubSegments(segment: EEGSegment): EEGSegment[] {
    const subSegments: EEGSegment[] = [];
    const samplesPerSubSegment = Math.floor(this.sampleRate * 0.25); // 32 samples per 250ms
    const slideWindow = 4; // 4 samples sliding window
    
    for (let i = 0; i <= segment.samples.length - samplesPerSubSegment; i += slideWindow) {
      const subSegmentSamples = segment.samples.slice(i, i + samplesPerSubSegment);
      subSegments.push({
        samples: subSegmentSamples,
        startTime: subSegmentSamples[0].timestamp,
        endTime: subSegmentSamples[subSegmentSamples.length - 1].timestamp,
      });
    }
    
    return subSegments;
  }

  // Process all segments and sub-segments
  processRecording(data: EEGSample[]): { segments: EEGSegment[], subSegments: EEGSegment[][] } {
    const twoSecondSegments = this.segmentIntoTwoSecond(data);
    const allSubSegments = twoSecondSegments.map(segment => 
      this.createOverlappingSubSegments(segment)
    );
    
    console.log(`Processed ${twoSecondSegments.length} segments with ${allSubSegments.flat().length} total sub-segments`);
    return {
      segments: twoSecondSegments,
      subSegments: allSubSegments,
    };
  }

  // Convert EEG segment to tensor format for TensorFlow.js
  segmentToTensor(segment: EEGSegment): number[][] {
    return segment.samples.map(sample => sample.channels);
  }

  isCollectingData(): boolean {
    return this.isCollecting;
  }

  getCurrentDataLength(): number {
    return this.collectedData.length;
  }
}

export const eegProcessor = new EEGProcessor();