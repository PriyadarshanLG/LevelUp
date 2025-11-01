import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  'public/uploads/thumbnails',
  'public/uploads/videos',
  'public/uploads/notes',
  'public/uploads/assignments',
  'public/uploads/submissions',
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/thumbnails');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'thumbnail-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/videos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage for notes (PDFs)
const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/notes');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'notes-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage for assignment documents
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/assignments');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage for assignment submissions
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/submissions');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filters
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'));
  }
};

const pdfFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'));
  }
};

const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only document files (PDF, DOC, DOCX, XLS, XLSX, TXT) are allowed!'));
  }
};

// Upload middleware instances
export const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

export const uploadNotes = multer({
  storage: notesStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadAssignment = multer({
  storage: assignmentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Combined upload for lesson (video + notes)
const lessonFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video field!'));
    }
  } else if (file.fieldname === 'notes') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for notes field!'));
    }
  } else {
    cb(null, false);
  }
};

const lessonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, 'public/uploads/videos');
    } else if (file.fieldname === 'notes') {
      cb(null, 'public/uploads/notes');
    } else {
      cb(null, 'public/uploads');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === 'video' ? 'video-' : 'notes-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadLesson = multer({
  storage: lessonStorage,
  fileFilter: lessonFileFilter,
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB max for videos
    files: 2 // video + notes
  },
});
