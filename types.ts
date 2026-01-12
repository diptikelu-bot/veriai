
export type ContentType = 'text' | 'image' | 'video';

export interface AnalysisHighlight {
  text: string;
  reason: string;
  type: 'ai' | 'human' | 'mixed';
}

export interface AnalysisResult {
  score: number; // 0 (Real/Human) to 100 (AI)
  verdict: string;
  summary: string;
  details: {
    complexity?: number;
    predictability?: number;
    artifactRating?: number;
    consistencyScore?: number;
    structure: string;
  };
  highlights: AnalysisHighlight[];
}

export enum DetectorStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
