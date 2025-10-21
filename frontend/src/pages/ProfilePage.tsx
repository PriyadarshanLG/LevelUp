import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import type { User } from '../types/user';
import {
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Edit3
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm text-white transition-all duration-300"
            >
              <Edit3 size={20} />
            </button>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 py-8 md:px-8">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center -mt-20 mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {user.name[0].toUpperCase()}
                </div>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Basic Information
                </h2>
                
                {user.dateOfBirth && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
                    <span>Born {formatDate(user.dateOfBirth)}</span>
                  </div>
                )}

                {user.gender && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="mr-3 text-blue-600 dark:text-blue-400">⚥</span>
                    <span>{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</span>
                  </div>
                )}

                {user.phoneNumber && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}

                {user.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin size={20} className="mr-3 text-blue-600 dark:text-blue-400" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Professional Information
                </h2>

                {user.profession && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Briefcase size={20} className="mr-3 text-purple-600 dark:text-purple-400" />
                    <span>{user.profession}</span>
                  </div>
                )}

                {user.organization && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Building2 size={20} className="mr-3 text-purple-600 dark:text-purple-400" />
                    <span>{user.organization}</span>
                  </div>
                )}

                {/* Social Links */}
                {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                  <div className="space-y-3">
                    {user.socialLinks.website && (
                      <a
                        href={user.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        <Globe size={20} className="mr-3 text-purple-600 dark:text-purple-400" />
                        <span>Website</span>
                      </a>
                    )}

                    {user.socialLinks.github && (
                      <a
                        href={user.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        <Github size={20} className="mr-3 text-purple-600 dark:text-purple-400" />
                        <span>GitHub</span>
                      </a>
                    )}

                    {user.socialLinks.twitter && (
                      <a
                        href={user.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        <Twitter size={20} className="mr-3 text-purple-600 dark:text-purple-400" />
                        <span>Twitter</span>
                      </a>
                    )}

                    {user.socialLinks.linkedin && (
                      <a
                        href={user.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        <Linkedin size={20} className="mr-3 text-purple-600 dark:text-purple-400" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  About Me
                </h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ProfileCompletionModal
        isOpen={editing}
        onClose={() => setEditing(false)}
      />
    </div>
  );
};

export default ProfilePage;