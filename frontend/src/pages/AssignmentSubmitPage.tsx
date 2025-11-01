import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AppHeader from '../components/AppHeader';
import { Upload, FileText, Send, CheckCircle, ArrowLeft } from 'lucide-react';

const AssignmentSubmitPage = () => {
  const { assignmentId } = useParams();
  useAuth();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      // Fetch assignment details directly by ID
      const res = await api.get(`/assignments/${assignmentId}`);
      
      if (res.data.success && res.data.data.assignment) {
        const fetchedAssignment = res.data.data.assignment;
        setAssignment(fetchedAssignment);
        if (fetchedAssignment.submission) {
          setExistingSubmission(fetchedAssignment.submission);
          setContent(fetchedAssignment.submission.content || '');
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content && !file) {
      alert('Please provide either written content or upload a document');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (content) formData.append('content', content);
      if (file) formData.append('document', file);

      await api.post(`/assignments/${assignmentId}/submit`, formData);

      alert('Assignment submitted successfully!');
      navigate(-1);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading assignment...</p>
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

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Classroom
        </button>

        {/* Assignment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {assignment.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {assignment.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            {assignment.dueDate && (
              <div className={`px-4 py-2 rounded-lg ${
                isOverdue 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              }`}>
                <p className="text-sm font-semibold">Due Date</p>
                <p className="text-lg">
                  {new Date(assignment.dueDate).toLocaleString()}
                </p>
                {isOverdue && <p className="text-sm font-semibold mt-1">OVERDUE</p>}
              </div>
            )}
            
            {assignment.documentUrl && (
              <a
                href={`http://localhost:5000${assignment.documentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <FileText className="w-5 h-5" />
                View Instructions Document
              </a>
            )}
          </div>

          {existingSubmission && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Already Submitted</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Submitted on: {new Date(existingSubmission.submittedAt).toLocaleString()}
              </p>
              {existingSubmission.grade !== undefined && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Grade: <span className="text-lg text-green-600 dark:text-green-400">{existingSubmission.grade}/100</span>
                  </p>
                  {existingSubmission.feedback && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <strong>Feedback:</strong> {existingSubmission.feedback}
                    </p>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                You can resubmit to update your submission
              </p>
            </div>
          )}
        </div>

        {/* Submission Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section - Made More Prominent */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📎 Upload Your Assignment
              </label>
              <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl p-10 text-center bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {!file ? (
                    <>
                      <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Click here to upload your file
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        or drag and drop your file here
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 px-4 py-2 bg-white dark:bg-gray-700 rounded-full mt-2">
                        Supported: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, ZIP (Max 10MB)
                      </span>
                    </>
                  ) : (
                    <div className="py-4">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold text-lg text-gray-900 dark:text-white">{file.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        File size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Remove File
                  </button>
                )}
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-3 font-medium">
                💡 Upload your completed assignment document
              </p>
            </div>

            {/* Text Response Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                ✍️ Written Response (Optional)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={8}
                placeholder="Type your written response here (if needed)..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You can also type your answer directly if you prefer
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting || (!content && !file)}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>{existingSubmission ? 'Update Submission' : 'Submit Assignment'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            {/* Helper Text */}
            {(!content && !file) && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                  ⚠️ Please upload a file or write a response before submitting
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmitPage;
