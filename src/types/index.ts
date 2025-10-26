export interface ReviewSchema {
  question: string;
  type: 'short-answer' | 'single-choice' | 'multiple-choice';
  choices?: string[];
}

export interface FilledReviewSchema extends ReviewSchema {
  answer: string | string[];
}

export interface ProductImage {
  url: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  founderId: string;
  name: string;
  description: string;
  link: string;
  imageUrl: string; // Legacy field for backward compatibility
  images?: ProductImage[]; // New field for multiple images
  createdAt: string;
  reviewSchema: ReviewSchema[];
  reviewsReceived: string[];
  status: 'draft' | 'published'; // New field for draft/publish status
  feedbackObjective?: string; // What feedback the founder is looking for (shown to reviewers)
}

export interface ReviewGiven {
  id: string;
  reviewerId: string;
  projectId: string;
  filledReviewSchema: FilledReviewSchema[];
  createdAt: string;
  reviewQuality: number;
}
