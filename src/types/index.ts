export interface ReviewSchema {
  question: string;
  type: 'short-answer' | 'single-choice' | 'multiple-choice';
  choices?: string[];
}

export interface FilledReviewSchema extends ReviewSchema {
  answer: string | string[];
}

export interface ProjectImage {
  url: string;
  isPrimary: boolean;
}

export interface Project {
  id: string;
  founderId: string;
  name: string;
  description: string;
  link: string;
  imageUrl: string; // Legacy field for backward compatibility
  images?: ProjectImage[]; // New field for multiple images
  createdAt: string;
  reviewSchema: ReviewSchema[];
  reviewsReceived: string[];
}

export interface ReviewGiven {
  id: string;
  reviewerId: string;
  projectId: string;
  filledReviewSchema: FilledReviewSchema[];
  createdAt: string;
  reviewQuality: number;
}
