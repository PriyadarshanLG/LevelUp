import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: any;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
    isEmailVerified: boolean;
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
    profession?: string;
    organization?: string;
    bio?: string;
    location?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        website?: string;
    };
    interests?: string[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
