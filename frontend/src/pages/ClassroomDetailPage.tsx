import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AppHeader from '../components/AppHeader';
import { 
  Book, Plus, Upload, FileText, Video, Trash2, Save, X,
  Users, Calendar, CheckCircle, ArrowLeft, BarChart3
} from 'lucide-react';

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  notes?: string;
  order: number;
  createdAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  documentUrl?: string;
  dueDate?: string;
  lesson?: { _id: string; title: string };
}

const ClassroomDetailPage = () => {
  const { classroomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [classroom, setClassroom] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'assignments'>('lessons');
  
  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    order: 0,
  });
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Assignment form state
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    lessonId: '',
  });
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  
  // Lesson-specific assignment form
  const [lessonAssignmentForm, setLessonAssignmentForm] = useState<string | null>(null);

  // Student submission form state
  const [submittingAssignment, setSubmittingAssignment] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Students list modal state
  const [showStudentsList, setShowStudentsList] = useState(false);

  // Treat the classroom owner and admins as teachers for UI actions
  const isTeacher = (user?.role === 'teacher') || (user?.role === 'admin') || (user?._id && classroom?.teacher?._id && user._id === classroom.teacher._id);

  useEffect(() => {
    fetchClassroomData();
  }, [classroomId]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      const [classroomRes, lessonsRes, assignmentsRes] = await Promise.all([
        api.get(`/classrooms/${classroomId}`),
        api.get(`/lessons/classroom/${classroomId}`),
        api.get(`/assignments/classroom/${classroomId}`),
      ]);
      
      setClassroom(classroomRes.data.classroom);
      setLessons(lessonsRes.data.lessons);
      setAssignments(assignmentsRes.data.assignments);
    } catch (error) {
      console.error('Error fetching classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('classroomId', classroomId!);
      formData.append('title', lessonForm.title);
      formData.append('description', lessonForm.description);
      
      // Only append videoUrl if no video file is uploaded
      if (!videoFile && lessonForm.videoUrl) {
        formData.append('videoUrl', lessonForm.videoUrl);
      }
      
      formData.append('order', lessonForm.order.toString());
      
      if (notesFile) {
        formData.append('notes', notesFile);
      }
      
      if (videoFile) {
        formData.append('video', videoFile);
      }

      await api.post('/lessons', formData);

      setLessonForm({ title: '', description: '', videoUrl: '', order: 0 });
      setNotesFile(null);
      setVideoFile(null);
      setShowLessonForm(false);
      fetchClassroomData();
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await api.delete(`/lessons/${lessonId}`);
      fetchClassroomData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('classroomId', classroomId!);
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      if (assignmentForm.dueDate) {
        formData.append('dueDate', assignmentForm.dueDate);
      }
      if (assignmentForm.lessonId) {
        formData.append('lessonId', assignmentForm.lessonId);
      }
      if (assignmentFile) {
        formData.append('document', assignmentFile);
      }

      await api.post('/assignments', formData);

      setAssignmentForm({ title: '', description: '', dueDate: '', lessonId: '' });
      setAssignmentFile(null);
      setShowAssignmentForm(false);
      fetchClassroomData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await api.delete(`/assignments/${assignmentId}`);
      fetchClassroomData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    }
  };

  const handleCreateLessonAssignment = async (e: React.FormEvent, lessonId: string) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('classroomId', classroomId!);
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      if (assignmentForm.dueDate) {
        formData.append('dueDate', assignmentForm.dueDate);
      }
      formData.append('lessonId', lessonId);
      if (assignmentFile) {
        formData.append('document', assignmentFile);
      }

      await api.post('/assignments', formData);

      setAssignmentForm({ title: '', description: '', dueDate: '', lessonId: '' });
      setAssignmentFile(null);
      setLessonAssignmentForm(null);
      fetchClassroomData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const getLessonAssignments = (lessonId: string) => {
    return assignments.filter(a => a.lesson?._id === lessonId);
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionFile && !submissionContent) {
      alert('Please upload a file or write a response');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (submissionContent) formData.append('content', submissionContent);
      if (submissionFile) formData.append('document', submissionFile);

      await api.post(`/assignments/${assignmentId}/submit`, formData);

      alert('Assignment submitted successfully!');
      setSubmittingAssignment(null);
      setSubmissionContent('');
      setSubmissionFile(null);
      fetchClassroomData();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading classroom...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Classroom not found</p>
            <Link 
              to={isTeacher ? "/my-classrooms" : "/student-classrooms"} 
              className="mt-4 text-indigo-600 hover:text-indigo-700"
            >
              Back to Classrooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(isTeacher ? '/my-classrooms' : '/student-classrooms')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Classrooms
          </button>
        </div>

        {/* Classroom Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{classroom.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{classroom.description}</p>
            </div>
            <div className="flex items-center gap-4">
              {isTeacher && (
                <button
                  onClick={() => navigate(`/classroom/${classroomId}/statistics`)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Statistics
                </button>
              )}
              <div className="text-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">PIN</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{classroom.pin}</p>
              </div>
              <button
                onClick={() => setShowStudentsList(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <Users className="w-5 h-5" />
                <span>{classroom.students?.length || 0} Students</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'lessons'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Book className="w-5 h-5" />
            Lessons
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'assignments'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            Assignments
          </button>
        </div>

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div>
            {isTeacher && (
              <div className="mb-6">
                {!showLessonForm ? (
                  <button
                    onClick={() => setShowLessonForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Lesson
                  </button>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Lesson</h3>
                      <button
                        onClick={() => {
                          setShowLessonForm(false);
                          setLessonForm({ title: '', description: '', videoUrl: '', order: 0 });
                          setNotesFile(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateLesson} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Lesson Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter lesson title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          placeholder="Enter lesson description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Video (Upload from Computer)
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                            <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                            <span className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                              Choose Video
                            </span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {videoFile && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {videoFile.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Or Video URL (YouTube or other)
                        </label>
                        <input
                          type="url"
                          value={lessonForm.videoUrl}
                          onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="https://www.youtube.com/watch?v=..."
                          disabled={!!videoFile}
                        />
                        {videoFile && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Video file selected - URL field disabled
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Notes (PDF)
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Upload className="w-5 h-5" />
                            <span className="text-sm">Choose PDF</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setNotesFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {notesFile && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {notesFile.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Order
                        </label>
                        <input
                          type="number"
                          value={lessonForm.order}
                          onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          <Save className="w-5 h-5" />
                          Create Lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLessonForm(false);
                            setLessonForm({ title: '', description: '', videoUrl: '', order: 0 });
                            setNotesFile(null);
                            setVideoFile(null);
                          }}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Lessons List */}
            <div className="space-y-4">
              {lessons.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">No lessons yet</p>
                  {isTeacher && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Create your first lesson to get started
                    </p>
                  )}
                </div>
              ) : (
                lessons.map((lesson) => {
                  const lessonAssignments = getLessonAssignments(lesson._id);
                  return (
                  <div
                    key={lesson._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{lesson.description}</p>
                        )}
                        
                        <div className="space-y-3">
                          {lesson.videoUrl && (
                            <div>
                              {lesson.videoUrl.startsWith('/uploads/') ? (
                                // Local video file
                                <div className="bg-black rounded-lg overflow-hidden">
                                  <video
                                    controls
                                    className="w-full max-h-96"
                                    src={`http://localhost:5000${lesson.videoUrl}`}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              ) : (
                                // YouTube or external URL
                                <a
                                  href={lesson.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors inline-flex"
                                >
                                  <Video className="w-4 h-4" />
                                  Watch Video
                                </a>
                              )}
                            </div>
                          )}
                          {lesson.notes && (
                            <a
                              href={`http://localhost:5000${lesson.notes}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors inline-flex"
                            >
                              <FileText className="w-4 h-4" />
                              View Notes (PDF)
                            </a>
                          )}
                        </div>

                        {/* Lesson Assignments Section */}
                        {lessonAssignments.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-indigo-600" />
                              Assignments for this lesson
                            </h4>
                            <div className="space-y-3">
                              {lessonAssignments.map((assignment: any) => (
                                <div
                                  key={assignment._id}
                                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {assignment.title}
                                      </h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        {assignment.description}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-3">
                                        {assignment.dueDate && (
                                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                          </div>
                                        )}
                                        {assignment.documentUrl && (
                                          <a
                                            href={`http://localhost:5000${assignment.documentUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                          >
                                            <FileText className="w-3 h-3" />
                                            View Instructions
                                          </a>
                                        )}
                                        {!isTeacher && (
                                          assignment.submission ? (
                                            <div className="flex items-center gap-1 text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                                              <CheckCircle className="w-3 h-3" />
                                              Submitted
                                              {assignment.submission.grade !== undefined && (
                                                <span className="ml-1 font-semibold">
                                                  ({assignment.submission.grade}/100)
                                                </span>
                                              )}
                                            </div>
                                          ) : (
                                            <Link
                                              to={`/assignment/${assignment._id}/submit`}
                                              className="flex items-center gap-1 text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                            >
                                              <Upload className="w-3 h-3" />
                                              Submit
                                            </Link>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    {isTeacher && (
                                      <button
                                        onClick={() => handleDeleteAssignment(assignment._id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors ml-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Assignment Button/Form for Teacher */}
                        {isTeacher && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {lessonAssignmentForm !== lesson._id ? (
                              <button
                                onClick={() => {
                                  setLessonAssignmentForm(lesson._id);
                                  setAssignmentForm({ title: '', description: '', dueDate: '', lessonId: lesson._id });
                                  setAssignmentFile(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Add Assignment to this Lesson
                              </button>
                            ) : (
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    Create Assignment for: {lesson.title}
                                  </h4>
                                  <button
                                    onClick={() => {
                                      setLessonAssignmentForm(null);
                                      setAssignmentForm({ title: '', description: '', dueDate: '', lessonId: '' });
                                      setAssignmentFile(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <form onSubmit={(e) => handleCreateLessonAssignment(e, lesson._id)} className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Assignment Title *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={assignmentForm.title}
                                      onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                      placeholder="Enter assignment title"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Description *
                                    </label>
                                    <textarea
                                      required
                                      value={assignmentForm.description}
                                      onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                      rows={3}
                                      placeholder="Enter assignment instructions"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Due Date
                                    </label>
                                    <input
                                      type="datetime-local"
                                      value={assignmentForm.dueDate}
                                      onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Upload Document (PDF, DOC, etc.)
                                    </label>
                                    <div className="flex items-center gap-3">
                                      <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                                        <Upload className="w-4 h-4" />
                                        <span>Choose File</span>
                                        <input
                                          type="file"
                                          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                                          onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                                          className="hidden"
                                        />
                                      </label>
                                      {assignmentFile && (
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                          {assignmentFile.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-2">
                                    <button
                                      type="submit"
                                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                                    >
                                      <Save className="w-4 h-4" />
                                      Create Assignment
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLessonAssignmentForm(null);
                                        setAssignmentForm({ title: '', description: '', dueDate: '', lessonId: '' });
                                        setAssignmentFile(null);
                                      }}
                                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {isTeacher && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleDeleteLesson(lesson._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div>
            {isTeacher && (
              <div className="mb-6">
                {!showAssignmentForm ? (
                  <button
                    onClick={() => setShowAssignmentForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Assignment
                  </button>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Assignment</h3>
                      <button
                        onClick={() => {
                          setShowAssignmentForm(false);
                          setAssignmentForm({ title: '', description: '', dueDate: '', lessonId: '' });
                          setAssignmentFile(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Assignment Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={assignmentForm.title}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter assignment title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description *
                        </label>
                        <textarea
                          required
                          value={assignmentForm.description}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          rows={4}
                          placeholder="Enter assignment instructions"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Due Date
                        </label>
                        <input
                          type="datetime-local"
                          value={assignmentForm.dueDate}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Link to Lesson (Optional)
                        </label>
                        <select
                          value={assignmentForm.lessonId}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, lessonId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">No lesson</option>
                          {lessons.map((lesson) => (
                            <option key={lesson._id} value={lesson._id}>
                              {lesson.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Document (PDF, DOC, etc.)
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Upload className="w-5 h-5" />
                            <span className="text-sm">Choose File</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                              onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {assignmentFile && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {assignmentFile.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          <Save className="w-5 h-5" />
                          Create Assignment
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAssignmentForm(false);
                            setAssignmentForm({ title: '', description: '', dueDate: '', lessonId: '' });
                            setAssignmentFile(null);
                          }}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Assignments List */}
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">No assignments yet</p>
                  {isTeacher && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Create your first assignment to get started
                    </p>
                  )}
                </div>
              ) : (
                assignments.map((assignment: any) => (
                  <div
                    key={assignment._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {assignment.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{assignment.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          {assignment.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {assignment.lesson && (
                            <div className="text-sm text-indigo-600 dark:text-indigo-400">
                              Linked to: {assignment.lesson.title}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {assignment.documentUrl && (
                            <a
                              href={`http://localhost:5000${assignment.documentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View Instructions
                            </a>
                          )}
                          {isTeacher && (
                            <Link
                              to={`/assignment/${assignment._id}/submissions`}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                            >
                              <Users className="w-4 h-4" />
                              View Submissions
                            </Link>
                          )}
                        </div>

                        {/* Student Submission Section */}
                        {!isTeacher && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {assignment.submission ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg inline-flex">
                                <CheckCircle className="w-5 h-5" />
                                <div>
                                  <span className="font-semibold">Submitted</span>
                                  {assignment.submission.grade !== undefined && (
                                    <span className="ml-2">
                                      - Grade: {assignment.submission.grade}/100
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : submittingAssignment === assignment._id ? (
                              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Submit Your Assignment
                                  </h4>
                                  <button
                                    onClick={() => {
                                      setSubmittingAssignment(null);
                                      setSubmissionContent('');
                                      setSubmissionFile(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>

                                {/* File Upload */}
                                <div className="mb-4">
                                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    📎 Upload Completed Assignment from Computer
                                  </label>
                                  <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-lg p-6 bg-white dark:bg-gray-800">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                                      onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                      className="hidden"
                                      id={`file-${assignment._id}`}
                                    />
                                    <label
                                      htmlFor={`file-${assignment._id}`}
                                      className="cursor-pointer flex flex-col items-center"
                                    >
                                      {!submissionFile ? (
                                        <>
                                          <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-2" />
                                          <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            Click to upload from computer
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            PDF, DOC, DOCX, TXT, XLS, PPT, ZIP (Max 10MB)
                                          </span>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                          <CheckCircle className="w-5 h-5" />
                                          <span className="font-medium">{submissionFile.name}</span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setSubmissionFile(null);
                                            }}
                                            className="ml-2 text-red-600 hover:text-red-700"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      )}
                                    </label>
                                  </div>
                                </div>

                                {/* Optional Text Response */}
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Written Response (Optional)
                                  </label>
                                  <textarea
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                    rows={4}
                                    placeholder="Type your response here (optional)..."
                                  />
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleSubmitAssignment(assignment._id)}
                                    disabled={isSubmitting || (!submissionFile && !submissionContent)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-5 h-5" />
                                        Submit Assignment
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSubmittingAssignment(null);
                                      setSubmissionContent('');
                                      setSubmissionFile(null);
                                    }}
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSubmittingAssignment(assignment._id)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                              >
                                <Upload className="w-5 h-5" />
                                Submit Assignment
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {isTeacher && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleDeleteAssignment(assignment._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Students List Modal */}
      {showStudentsList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Students List
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {classroom.students?.length || 0} students enrolled
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentsList(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {classroom.students && classroom.students.length > 0 ? (
                <div className="space-y-3">
                  {classroom.students.map((student: any, index: number) => (
                    <div
                      key={student._id || index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {student.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {student.name || 'Unknown Student'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                          Enrolled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No students enrolled yet
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    Share the classroom PIN ({classroom.pin}) with students to get started
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setShowStudentsList(false)}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetailPage;
