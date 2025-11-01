import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoProgress extends Document {
  lesson: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  classroom: mongoose.Types.ObjectId;
  watchedDuration: number; // in seconds
  totalDuration: number; // in seconds
  progressPercentage: number; // 0-100
  isCompleted: boolean;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const videoProgressSchema = new Schema<IVideoProgress>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    watchedDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one progress record per student per lesson
videoProgressSchema.index({ lesson: 1, student: 1 }, { unique: true });

// Index for efficient classroom-based queries
videoProgressSchema.index({ classroom: 1, student: 1 });

export default mongoose.model<IVideoProgress>('VideoProgress', videoProgressSchema);
