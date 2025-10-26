import { doc, setDoc, getDoc, updateDoc, arrayUnion, orderBy, query, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { formatDate } from "./utils";
import { v4 as uuidv4 } from 'uuid';
import { FilledReviewSchema, Project, ProjectImage,ReviewGiven, ReviewSchema } from "@/types";
import { KARMA_CONFIG } from "./karmaConfig";


export interface ProjectDatabaseData {
  founderId: string;
  name: string;
  description: string;
  link: string;
  imageUrl: string;
  images?: ProjectImage[];
  createdAt: string;
  reviewSchema: ReviewSchema[];
  reviewsReceived: string[];
  status: 'draft' | 'published';
}
export const initializeUserInDb = async (email: string, userId: string, displayName: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    
    // Check if user document already exists
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      // User already exists, don't overwrite their data
      console.log("User already exists, not overwriting data");
      return;
    } else {
      console.log("User document does not exist, creating new user");
    }
        
      const userData = {
      email,
      displayName,
      uploadedProjects: [],
      reviewsGiven: [],
      createdAt: formatDate(),
      karmaPoints: KARMA_CONFIG.STARTING_KARMA,
    };
    await setDoc(userRef, userData);
    
  } catch (error) {
    throw Error(`Error initializing user: ${error}`);
  }
}

export const createProjectInDb = async (
  userId: string, 
  projectData: {
    name: string;
    description: string;
    link: string;
    reviewSchema: ReviewSchema[];
    imageUrl?: string;
    images?: ProjectImage[];
    status?: 'draft' | 'published';
  }
): Promise<void> => {
  try {
    const projectId = uuidv4();
    
    // Filter out empty choices from review schema
    const cleanedReviewSchema = projectData.reviewSchema.map(question => {
      if (question.type === 'short-answer') {
        return question; // Short answer questions don't have choices
      }
      
      // For single-choice and multiple-choice, filter out empty choices
      if (question.choices) {
        const filteredChoices = question.choices.filter(choice => choice.trim() !== '');
        return {
          ...question,
          choices: filteredChoices
        };
      }
      
      return question;
    });
    
    // Determine the imageUrl (primary image if available, otherwise use legacy imageUrl)
    let imageUrl = projectData.imageUrl || '';
    if (projectData.images && projectData.images.length > 0) {
      const primaryImage = projectData.images.find(img => img.isPrimary);
      if (primaryImage) {
        imageUrl = primaryImage.url;
      } else {
        imageUrl = projectData.images[0].url;
      }
    }

    // Build project object, only including images if defined
    const project: any = {
      founderId: userId,
      name: projectData.name,
      description: projectData.description,
      link: projectData.link,
      imageUrl: imageUrl, // Primary image URL for backward compatibility
      createdAt: formatDate(),
      reviewSchema: cleanedReviewSchema,
      reviewsReceived: [],
      status: projectData.status || 'draft' // Default to draft
    };
    
    // Only include images field if it has a value
    if (projectData.images && projectData.images.length > 0) {
      project.images = projectData.images;
    }
    
    // Create project document in projects collection
    const projectRef = doc(db, "projects", projectId);
    await setDoc(projectRef, project);
    // Add project to user's uploaded projects
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      uploadedProjects: arrayUnion(projectId)
    });
  } catch (error) {
    throw Error(`Error creating project: ${error}`);
  }
}

export const getAllProjectsFromDb = async (): Promise<Project[]> => {
  const projectsRef = collection(db, "projects");
  const q = query(projectsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const projects: Project[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    projects.push({
      id: doc.id,
      founderId: data.founderId || "",
      name: data.name || "",
      description: data.description || "",
      link: data.link || "",
      imageUrl: data.imageUrl || "",
      images: data.images || undefined,
      createdAt: data.createdAt || "",
      reviewSchema: data.reviewSchema || [],
      reviewsReceived: data.reviewsReceived || [],
      status: data.status || 'draft'
    });
  });
  return projects;
}

export const createReviewInDb = async (
  reviewerId: string,
  projectId: string,
  filledReviewSchema: FilledReviewSchema[]
): Promise<ReviewGiven> => {
  try {
    const reviewId = uuidv4();
    
    // Create the review object
    const review: ReviewGiven = {
      id: reviewId,
      reviewerId,
      projectId,
      filledReviewSchema,
      createdAt: formatDate(),
      reviewQuality: 0 // Will be calculated later based on review quality
    };
    
    // Create review document in reviews collection
    const reviewRef = doc(db, "reviews", reviewId);
    await setDoc(reviewRef, review);
    
    // Add review ID to project's reviewsReceived array
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      reviewsReceived: arrayUnion(reviewId)
    });
    
    // Add review ID to user's reviewsGiven array
    const userRef = doc(db, "users", reviewerId);
    await updateDoc(userRef, {
      reviewsGiven: arrayUnion(reviewId)
    });
    
    return review;
  } catch (error) {
    throw Error(`Error creating review: ${error}`);
  }
}

export const getYourReviewsFromDb = async (userId: string, userProjectIds: string[]): Promise<ReviewGiven[]> => {
  try {
    const reviewsRef = collection(db, "reviews");
    
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);    
    const allReviews: ReviewGiven[] = [];
    const userGivenReviews: ReviewGiven[] = [];
    const userReceivedReviews: ReviewGiven[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const review = {
        id: doc.id,
        reviewerId: data.reviewerId || "",
        projectId: data.projectId || "",
        filledReviewSchema: data.filledReviewSchema || [],
        createdAt: data.createdAt || "",
        reviewQuality: data.reviewQuality || 0
      };
      
      // Check if user gave this review
      if (review.reviewerId === userId) {
        userGivenReviews.push(review);
        allReviews.push(review);
      }
      
      // Check if it's for user's project
      if (userProjectIds.includes(review.projectId)) {
        userReceivedReviews.push(review);
        // Only add if not already added (avoid duplicates)
        if (!allReviews.find(r => r.id === review.id)) {
          allReviews.push(review);
        }
      }
    });
    
    return allReviews;
  } catch (error) {
    throw Error(`Error fetching reviews: ${error}`);
  }
}

export const updateReviewQualityInDb = async (
  reviewId: string,
  reviewQuality: number
): Promise<ReviewGiven> => {
  try {
    // Update the review document directly
    const reviewRef = doc(db, "reviews", reviewId);
    const reviewDoc = await getDoc(reviewRef);
    if (!reviewDoc.exists()) {
      throw new Error("Review not found");
    }
    
    const reviewData = reviewDoc.data();
    const previousRating = reviewData.reviewQuality || 0;
    
    // Update the review
    await updateDoc(reviewRef, {
      reviewQuality: reviewQuality
    });
    
    // Update karma for the reviewer
    const reviewerId = reviewData.reviewerId;
    if (reviewerId) {
      // Get reviewer's current karma
      const reviewerRef = doc(db, "users", reviewerId);
      const reviewerDoc = await getDoc(reviewerRef);
      
      if (reviewerDoc.exists()) {
        const reviewerData = reviewerDoc.data();
        let currentKarma = reviewerData.karmaPoints || 0;
        
        // Remove karma from previous rating (if it existed)
        if (previousRating >= 4) currentKarma -= KARMA_CONFIG.REWARDS.EXCELLENT;
        else if (previousRating === 3) currentKarma -= KARMA_CONFIG.REWARDS.NEUTRAL;
        else if (previousRating <= 2 && previousRating > 0) currentKarma += Math.abs(KARMA_CONFIG.REWARDS.POOR);
        
        // Add karma for new rating
        const karmaChange = KARMA_CONFIG.getKarmaChange(reviewQuality);
        currentKarma += karmaChange;
        
        // Update karma
        await updateDoc(reviewerRef, {
          karmaPoints: currentKarma
        });
      }
    }
    
    const data = reviewDoc.data();
    const updatedReview: ReviewGiven = {
      id: reviewDoc.id,
      reviewerId: data.reviewerId || "",
      projectId: data.projectId || "",
      filledReviewSchema: data.filledReviewSchema || [],
      createdAt: data.createdAt || "",
      reviewQuality: reviewQuality
    };
    
    return updatedReview;
  } catch (error) {
    throw Error(`Error updating review quality: ${error}`);
  }
}

export const getUserDisplayNameById = async (userId: string): Promise<string> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.displayName || `User ${userId.slice(0, 8)}`;
    }
    
    return `User ${userId.slice(0, 8)}`;
  } catch (error) {
    console.error("Error fetching user display name:", error);
    return `User ${userId.slice(0, 8)}`;
  }
}

export const updateProjectInDb = async (
  projectId: string,
  projectData: {
    name: string;
    description: string;
    link: string;
    reviewSchema: ReviewSchema[];
    imageUrl?: string;
    images?: ProjectImage[];
  }
): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    const currentData = projectDoc.data();
    if (currentData.status === 'published') {
      throw new Error("Cannot edit published projects");
    }
    
    // Filter out empty choices from review schema
    const cleanedReviewSchema = projectData.reviewSchema.map(question => {
      if (question.type === 'short-answer') {
        return question;
      }
      
      if (question.choices) {
        const filteredChoices = question.choices.filter(choice => choice.trim() !== '');
        return {
          ...question,
          choices: filteredChoices
        };
      }
      
      return question;
    });
    
    // Determine the imageUrl
    let imageUrl = projectData.imageUrl || '';
    if (projectData.images && projectData.images.length > 0) {
      const primaryImage = projectData.images.find(img => img.isPrimary);
      if (primaryImage) {
        imageUrl = primaryImage.url;
      } else {
        imageUrl = projectData.images[0].url;
      }
    }
    
    // Build update object, only including images if defined
    const updateData: any = {
      name: projectData.name,
      description: projectData.description,
      link: projectData.link,
      reviewSchema: cleanedReviewSchema,
      imageUrl: imageUrl
    };
    
    // Only include images field if it has a value
    if (projectData.images && projectData.images.length > 0) {
      updateData.images = projectData.images;
    }
    
    await updateDoc(projectRef, updateData);
  } catch (error) {
    throw Error(`Error updating project: ${error}`);
  }
}

export const publishProjectInDb = async (projectId: string): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error("Project not found");
    }
    
    const currentData = projectDoc.data();
    if (currentData.status === 'published') {
      throw new Error("Project is already published");
    }
    
    await updateDoc(projectRef, {
      status: 'published'
    });
  } catch (error) {
    throw Error(`Error publishing project: ${error}`);
  }
}