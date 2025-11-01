import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Video, CheckCircle, Clock, Play } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import api from '../utils/api';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  progress: {
    watchedDuration: number;
    totalDuration: number;
    progressPercentage: number;
    isCompleted: boolean;
    lastWatchedAt: string;
  } | null;
}

interface StudentStats {
  student: Student;
  statistics: {
    completedVideos: number;
    totalVideos: number;
    completionPercentage: number;
    averageProgress: number;
  };
  lessonProgress: LessonProgress[];
}

interface OverallStats {
  totalStudents: number;
  totalLessons: number;
  averageCompletion: number;
}

const ClassroomStatisticsPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classroomName, setClassroomName] = useState('');
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [classroomId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lessons/classroom/${classroomId}/statistics`);
      
      if (response.success) {
        setClassroomName(response.data.classroom.name);
        setOverallStats(response.data.overallStats);
        setStudentStats(response.data.studentStats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedStudentData = selectedStudent 
    ? studentStats.find(s => s.student._id === selectedStudent)
    : null;

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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Video Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{classroomName}</p>
        </div>

        {/* Overall Statistics Cards */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.totalStudents}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.totalLessons}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Completion</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.averageCompletion}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Selection */}
        {!selectedStudent ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Student Performance
            </h2>
            
            <div className="space-y-4">
              {studentStats.map((stats) => (
                <div
                  key={stats.student._id}
                  onClick={() => setSelectedStudent(stats.student._id)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {stats.student.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.student.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {stats.statistics.completedVideos} / {stats.statistics.totalVideos}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(stats.statistics.completionPercentage)} transition-all duration-300`}
                            style={{ width: `${stats.statistics.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                      <span className={`font-semibold text-sm ${getProgressTextColor(stats.statistics.completionPercentage)}`}>
                        {stats.statistics.completionPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {studentStats.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No students enrolled yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detailed Student View */
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedStudentData?.student.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedStudentData?.student.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                >
                  View All Students
                </button>
              </div>

              {/* Student Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedStudentData?.statistics.completedVideos} / {selectedStudentData?.statistics.totalVideos}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedStudentData?.statistics.completionPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedStudentData?.statistics.averageProgress}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson-by-Lesson Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Lesson Progress
              </h3>

              <div className="space-y-4">
                {selectedStudentData?.lessonProgress.map((lessonProg) => (
                  <div
                    key={lessonProg.lessonId}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {lessonProg.lessonTitle}
                        </h4>
                        {lessonProg.progress && (
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Last watched: {formatDate(lessonProg.progress.lastWatchedAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {lessonProg.progress?.isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>

                    {lessonProg.progress ? (
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(lessonProg.progress.progressPercentage)} transition-all duration-300`}
                                style={{ width: `${lessonProg.progress.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                          <span className={`font-semibold text-sm ${getProgressTextColor(lessonProg.progress.progressPercentage)}`}>
                            {lessonProg.progress.progressPercentage}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Watched: {formatDuration(lessonProg.progress.watchedDuration)} / {formatDuration(lessonProg.progress.totalDuration)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Play className="w-4 h-4" />
                        <span className="text-sm">Not started yet</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomStatisticsPage;
