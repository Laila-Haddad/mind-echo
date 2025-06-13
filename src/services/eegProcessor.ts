import { eegStream } from "./eegStream";

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


  
  private sampleListener: ((sample: EEGSample) => void) | null = null; 

  startCollection(): void {
    console.log('Starting EEG data collection...');
    this.isCollecting = true;
    this.collectedData = [];
  
    if (this.sampleListener) {
      eegStream.offSample(this.sampleListener);
    }
  
    this.sampleListener = (sample: EEGSample) => {
      if (this.isCollecting) this.collectedData.push(sample);
    };
    eegStream.onSample(this.sampleListener);
  }
  
  stopCollection(): EEGSample[] {
    this.isCollecting = false;
    if (this.sampleListener) {
      eegStream.offSample(this.sampleListener);
      this.sampleListener = null;
    }
    return [...this.collectedData];
  }
  
  clear(): void {
    this.collectedData = [];
  }

  segmentIntoTwoSecond(data: EEGSample[]): EEGSegment[] {
    const segments: EEGSegment[] = [];
    const samplesPerSegment = this.sampleRate * 2; 
    
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

  createOverlappingSubSegments(segment: EEGSegment): EEGSegment[] {
    const subSegments: EEGSegment[] = [];
    const samplesPerSubSegment = Math.floor(this.sampleRate * 0.25); 
    const slideWindow = 4;
    
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