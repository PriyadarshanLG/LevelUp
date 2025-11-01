import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  classroom: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  documentUrl?: string; // Assignment document/instructions
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignmentSubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  content?: string; // Typed submission
  documentUrl?: string; // Uploaded document
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    classroom: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
      index: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one submission per student per assignment
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
export const AssignmentSubmission = mongoose.model<IAssignmentSubmission>('AssignmentSubmission', assignmentSubmissionSchema);
