import mongoose, { Document } from 'mongoose';
interface IQuizQuestion {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points: number;
}
export interface IQuiz extends Document {
    _id: any;
    courseId: string;
    title: string;
    description: string;
    questions: IQuizQuestion[];
    timeLimit: number;
    passingScore: number;
    maxAttempts: number;
    isPublished: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, {}> & IQuiz & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
