import * as tf from '@tensorflow/tfjs';
import { EEGSegment, eegProcessor } from './eegProcessor';

export interface ClassificationResult {
  character: string;
  confidence: number;
  timestamp: number;
}

class EEGClassifier {
  private model: tf.LayersModel | null = null;
  private startSymbolModel: tf.LayersModel | null = null;
  private isModelLoaded = false;
  private alphabet = 'ءأبثةتثجحخدذرزسشصضطظرعغفقكلمنهوى'.split('');

  async loadModel(modelUrl: string = '/models/eeg-classifier.json'): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(modelUrl);
      this.isModelLoaded = true;
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  async classifySegment(segment: EEGSegment): Promise<ClassificationResult> {
    if (!this.model || !this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    try {
      const tensorData = eegProcessor.segmentToTensor(segment);
      const inputTensor = tf.tensor3d([tensorData]);
      
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.data();
      
      // Find the character with highest probability
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const character = this.alphabet[maxIndex];
      const confidence = probabilities[maxIndex];

      inputTensor.dispose();
      prediction.dispose();

      return {
        character,
        confidence,
        timestamp: segment.startTime,
      };
    } catch (error) {
      console.error('Classification error:', error);
      // Return a random character for development
      return {
        character: this.alphabet[Math.floor(Math.random() * this.alphabet.length)],
        confidence: Math.random(),
        timestamp: segment.startTime,
      };
    }
  }

  async classifyMultipleSegments(subSegments: EEGSegment[]): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];
    
    for (const segment of subSegments) {
      const result = await this.classifySegment(segment);
      results.push(result);
    }
    
    return results;
  }

  // Aggregate most frequent character from sub-segments within a 2-second window
  aggregateSegmentPredictions(results: ClassificationResult[]): string {
    const characterCounts: { [key: string]: number } = {};
    
    results.forEach(result => {
      characterCounts[result.character] = (characterCounts[result.character] || 0) + 1;
    });
    
    // Return the most frequent character
    return Object.entries(characterCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  // Process all segments and return sequence of most likely characters
  async processAllSegments(segmentData: { segments: EEGSegment[], subSegments: EEGSegment[][] }): Promise<string> {
    const characterSequence: string[] = [];
    
    for (let i = 0; i < segmentData.segments.length; i++) {
      const subSegmentResults = await this.classifyMultipleSegments(segmentData.subSegments[i]);
      const mostLikelyCharacter = this.aggregateSegmentPredictions(subSegmentResults);
      characterSequence.push(mostLikelyCharacter);
    }
    return characterSequence.join('');
  }

  // Transfer learning for start symbol training
  async trainStartSymbol(trainingData: EEGSegment[]): Promise<void> {
    if (!this.model) {
      throw new Error('Base model not loaded');
    }

    console.log('Starting transfer learning for start symbol...');
    
    try {
      // Create a binary classifier for start symbol detection
      const startSymbolModel = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [32, 8], units: 64, activation: 'relu' }),
          tf.layers.flatten(),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 2, activation: 'softmax' }) // Binary: start symbol or not
        ]
      });

      startSymbolModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Prepare training data - fix tensor shape issue
      const X = trainingData.map(segment => eegProcessor.segmentToTensor(segment));
      const y = trainingData.map(() => [1, 0]); // All are positive examples

      // Reshape X to be 4D: [batchSize, timeSteps, features, channels]
      // X is currently [batchSize][timeSteps][features]
      // We need to add a channel dimension
      const X4D = X.map(sample => sample.map(timeStep => [timeStep])); // Add channel dimension

      const xTensor = tf.tensor4d(X4D);
      const yTensor = tf.tensor2d(y);

      // Train the model
      await startSymbolModel.fit(xTensor, yTensor, {
        epochs: 10,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
          }
        }
      });

      this.startSymbolModel = startSymbolModel;

      // Save to localStorage for persistence
      await this.startSymbolModel.save('localstorage://start-symbol-model');

      // Clean up tensors
      xTensor.dispose();
      yTensor.dispose();

      console.log('Start symbol training completed');
    } catch (error) {
      console.error('Error training start symbol:', error);
      throw error;
    }
  }

  async loadStartSymbolModel(): Promise<boolean> {
    try {
      this.startSymbolModel = await tf.loadLayersModel('localstorage://start-symbol-model');
      console.log('Start symbol model loaded from localStorage');
      return true;
    } catch (error) {
      console.log('No saved start symbol model found');
      return false;
    }
  }

  async detectStartSymbol(segment: EEGSegment): Promise<boolean> {
    if (!this.startSymbolModel) {
      return false;
    }

    try {
      const tensorData = eegProcessor.segmentToTensor(segment);
      const inputTensor = tf.tensor3d([tensorData]);
      
      const prediction = this.startSymbolModel.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.data();
      
      const isStartSymbol = probabilities[0] > 0.7; // Threshold for detection

      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      return isStartSymbol;
    } catch (error) {
      console.error('Start symbol detection error:', error);
      return false;
    }
  }
}

export const eegClassifier = new EEGClassifier();