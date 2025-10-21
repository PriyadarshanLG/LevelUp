import mongoose, { Document } from 'mongoose';
export interface ICourse extends Document {
    _id: any;
    title: string;
    description: string;
    shortDescription: string;
    instructor: {
        id: string;
        name: string;
        email: string;
    };
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    price: number;
    thumbnail: string;
    previewVideo?: string;
    tags: string[];
    isPublished: boolean;
    enrollmentCount: number;
    rating: {
        average: number;
        count: number;
    };
    requirements: string[];
    learningOutcomes: string[];
    importantTopics: string[];
    timeManagement: string[];
    tipsAndTricks: string[];
    weeklyAssignments: {
        week: number;
        title: string;
        description: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICourse, {}, {}, {}, mongoose.Document<unknown, {}, ICourse, {}, {}> & ICourse & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
