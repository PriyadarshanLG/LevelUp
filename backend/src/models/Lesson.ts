import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  classroom: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  videoUrl?: string;
  notes?: string; // PDF file path
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    classroom: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String, // File path for PDF
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
lessonSchema.index({ classroom: 1, order: 1 });

export default mongoose.model<ILesson>('Lesson', lessonSchema);
