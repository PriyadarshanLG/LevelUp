export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin' | 'instructor';
  isEmailVerified: boolean;
  // Profile fields
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phoneNumber?: string;
  country?: string;
  hobbies?: string[];
  institution?: string;
  position?: 'Student' | 'Faculty' | 'Intern' | 'Employee' | 'Freelancer';
  department?: string;
  yearOfStudy?: string;
  experienceLevel?: string;
  fieldOfInterest?: string[];
  preferredLearningMode?: 'Video' | 'Text' | 'Interactive';
  preferredLanguage?: string;
  careerGoal?: string;
  bio?: string;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  interests?: string[];
  isProfileComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
}