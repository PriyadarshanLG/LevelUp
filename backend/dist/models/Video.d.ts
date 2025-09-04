import mongoose, { Document } from 'mongoose';
export interface IVideo extends Document {
    _id: any;
    courseId: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    isPreview: boolean;
    thumbnail: string;
    resources: {
        title: string;
        url: string;
        type: 'pdf' | 'link' | 'download';
    }[];
    transcription?: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IVideo, {}, {}, {}, mongoose.Document<unknown, {}, IVideo, {}, {}> & IVideo & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
