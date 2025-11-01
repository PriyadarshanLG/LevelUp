import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AppHeader from '../components/AppHeader';
import { 
  ArrowLeft, FileText, Calendar, CheckCircle, 
  Clock, Download, Save, X 
} from 'lucide-react';

interface Submission {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  content?: string;
  documentUrl?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

const AssignmentSubmissionsPage = () => {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [assignmentId, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 [Frontend] Fetching assignment and submissions for ID:', assignmentId);
      
      const [assignmentRes, submissionsRes] = await Promise.all([
        api.get(`/assignments/${assignmentId}`),
        api.get(`/assignments/${assignmentId}/submissions`),
      ]);

      console.log('📥 [Frontend] Assignment Response:', assignmentRes);
      console.log('📥 [Frontend] Submissions Response:', submissionsRes);
      
      console.log('✅ [Frontend] Assignment Response Data:', assignmentRes.data);
      console.log('✅ [Frontend] Submissions Response Data:', submissionsRes.data);

      if (assignmentRes.success && assignmentRes.data) {
        console.log('✅ [Frontend] Setting assignment:', assignmentRes.data.assignment);
        setAssignment(assignmentRes.data.assignment);
      } else {
        console.error('❌ [Frontend] Assignment response success is false');
      }

      if (submissionsRes.success && submissionsRes.data) {
        console.log('✅ [Frontend] Setting submissions:', submissionsRes.data.submissions);
        setSubmissions(submissionsRes.data.submissions);
      } else {
        console.error('❌ [Frontend] Submissions response success is false');
      }
    } catch (error) {
      console.error('❌ [Frontend] Error fetching data:', error);
      console.error('❌ [Frontend] Error details:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
      console.log('🏁 [Frontend] fetchData completed. Assignment:', assignment, 'Submissions:', submissions);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      setSaving(true);
      await api.put(`/assignments/submissions/${submissionId}/grade`, {
        grade: parseInt(gradeForm.grade),
        feedback: gradeForm.feedback,
      });

      alert('Grade submitted successfully!');
      setGradingSubmission(null);
      setGradeForm({ grade: '', feedback: '' });
      fetchData();
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to submit grade');
    } finally {
      setSaving(false);
    }
  };

  const startGrading = (submission: Submission) => {
    setGradingSubmission(submission._id);
    setGradeForm({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Assignment not found</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:text-indigo-700">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Classroom
        </button>

        {/* Assignment Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {assignment.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {assignment.description}
          </p>
          
          <div className="flex items-center gap-6">
            {assignment.dueDate && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">{submissions.length} Submission{submissions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Student Submissions
          </h2>

          {submissions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No submissions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Students haven't submitted their assignments yet
              </p>
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {submission.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {submission.student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {submission.student.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                    {submission.grade !== undefined && (
                      <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-lg font-bold">{submission.grade}/100</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Content */}
                {submission.content && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Written Response:
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {submission.content}
                    </p>
                  </div>
                )}

                {/* Attached Document */}
                {submission.documentUrl && (
                  <div className="mb-4">
                    <a
                      href={`http://localhost:5000${submission.documentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors inline-flex"
                    >
                      <Download className="w-5 h-5" />
                      Download Submitted Document
                    </a>
                  </div>
                )}

                {/* Grading Section */}
                {gradingSubmission === submission._id ? (
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Grade Submission
                      </h4>
                      <button
                        onClick={() => {
                          setGradingSubmission(null);
                          setGradeForm({ grade: '', feedback: '' });
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Grade (0-100) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeForm.grade}
                          onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter grade (0-100)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Feedback (Optional)
                        </label>
                        <textarea
                          value={gradeForm.feedback}
                          onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          placeholder="Enter feedback for the student..."
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleGradeSubmission(submission._id)}
                          disabled={saving || !gradeForm.grade}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Submit Grade
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setGradingSubmission(null);
                            setGradeForm({ grade: '', feedback: '' });
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    {submission.feedback && (
                      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Feedback:
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => startGrading(submission)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {submission.grade !== undefined ? 'Update Grade' : 'Grade Submission'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmissionsPage;
