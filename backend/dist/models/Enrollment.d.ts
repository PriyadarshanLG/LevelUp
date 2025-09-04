import mongoose, { Document } from 'mongoose';
interface IVideoProgress {
    videoId: string;
    isCompleted: boolean;
    watchedDuration: number;
    lastWatchedAt: Date;
    completedAt?: Date;
}
interface IQuizAttempt {
    quizId: string;
    attemptNumber: number;
    answers: Record<string, any>;
    score: {
        earnedPoints: number;
        totalPoints: number;
        percentage: number;
        passed: boolean;
    };
    startedAt: Date;
    completedAt: Date;
    timeSpent: number;
}
export interface IEnrollment extends Document {
    _id: any;
    userId: string;
    courseId: string;
    status: 'active' | 'completed' | 'paused' | 'dropped';
    progress: {
        videosCompleted: number;
        totalVideos: number;
        quizzesPassed: number;
        totalQuizzes: number;
        overallPercentage: number;
    };
    videoProgress: IVideoProgress[];
    quizAttempts: IQuizAttempt[];
    enrolledAt: Date;
    completedAt?: Date;
    certificateIssued: boolean;
    lastAccessedAt: Date;
    totalWatchTime: number;
    createdAt: Date;
    updatedAt: Date;
    updateVideoProgress(videoId: string, watchedDuration: number, isCompleted?: boolean): Promise<IEnrollment>;
    addQuizAttempt(attempt: IQuizAttempt): Promise<IEnrollment>;
    updateOverallProgress(): void;
    getBestQuizScore(quizId: string): IQuizAttempt | null;
    canAttemptQuiz(quizId: string, maxAttempts: number): boolean;
}
declare const _default: mongoose.Model<IEnrollment, {}, {}, {}, mongoose.Document<unknown, {}, IEnrollment, {}, {}> & IEnrollment & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
