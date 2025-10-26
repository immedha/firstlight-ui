export interface ReviewSchema {
  question: string;
  type: 'short-answer' | 'single-choice' | 'multiple-choice';
  choices?: string[];
}

export interface FilledReviewSchema extends ReviewSchema {
  answer: string | string[];
}

export interface Project {
  id: string;
  founderId: string;
  founderName: string;
  name: string;
  description: string;
  link: string;
  imageUrl: string;
  createdAt: string;
  reviewSchema: ReviewSchema[];
  reviewsReceived: string[];
}

export interface ReviewGiven {
  id: string;
  reviewerName: string;
  projectId: string;
  filledReviewSchema: FilledReviewSchema[];
  createdAt: string;
  reviewQuality: number;
}
