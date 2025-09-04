import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: any;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
    isEmailVerified: boolean;
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
