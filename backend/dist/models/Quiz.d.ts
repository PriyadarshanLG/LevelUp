import mongoose, { Document, Types } from 'mongoose';
export declare enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    TRUE_FALSE = "true_false",
    SINGLE_CHOICE = "single_choice",
    FILL_IN_BLANK = "fill_in_blank"
}
export interface IQuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}
export interface IQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options: IQuestionOption[];
    correctAnswers: string[];
    explanation?: string;
    points: number;
    order: number;
}
export interface IQuizAttempt {
    userId: Types.ObjectId;
    answers: {
        questionId: string;
        selectedOptions: string[];
        textAnswer?: string;
    }[];
    score: number;
    maxScore: number;
    percentage: number;
    timeSpent: number;
    completedAt: Date;
    passed: boolean;
}
export interface IQuiz extends Document {
    _id: Types.ObjectId;
    courseId: Types.ObjectId;
    title: string;
    description: string;
    instructions: string[];
    timeLimit: number;
    passingScore: number;
    maxAttempts: number;
    randomizeQuestions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    questions: IQuestion[];
    totalPoints: number;
    isPublished: boolean;
    order: number;
    createdBy: Types.ObjectId;
    attempts: IQuizAttempt[];
    averageScore: number;
    totalAttempts: number;
    passRate: number;
    timestamps: {
        createdAt: Date;
        updatedAt: Date;
    };
    calculateStats(): void;
    getUserBestAttempt(userId: Types.ObjectId): IQuizAttempt | null;
    canUserAttempt(userId: Types.ObjectId): boolean;
    getRandomizedQuestions(): IQuestion[];
}
declare const Quiz: mongoose.Model<IQuiz, {}, {}, {}, mongoose.Document<unknown, {}, IQuiz, {}, {}> & IQuiz & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Quiz;
