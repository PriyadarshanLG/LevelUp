import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, MapPin, GraduationCap, Heart, Code, CheckCircle, AlertCircle, ChevronDown, ChevronRight, ArrowRight, ArrowLeft, Sparkles, Star, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void; // Callback when user skips
}

interface Country {
  name: string;
  code: string;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose, onSkip }) => {
  const { user, updateProfile } = useAuth();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Define steps
  const steps = [
    { id: 1, title: 'Personal Info', icon: User, description: 'Basic information about you' },
    { id: 2, title: 'Professional', icon: GraduationCap, description: 'Your work or education' },
    { id: 3, title: 'Interests', icon: Heart, description: 'What you love to learn' },
    { id: 4, title: 'Preferences', icon: Star, description: 'How you like to learn' }
  ];

  // Countries list with codes
  const countries: Country[] = [
    { name: 'United States', code: '+1' },
    { name: 'United Kingdom', code: '+44' },
    { name: 'Canada', code: '+1' },
    { name: 'Australia', code: '+61' },
    { name: 'Germany', code: '+49' },
    { name: 'France', code: '+33' },
    { name: 'India', code: '+91' },
    { name: 'Japan', code: '+81' },
    { name: 'China', code: '+86' },
    { name: 'Brazil', code: '+55' },
    { name: 'Mexico', code: '+52' },
    { name: 'Spain', code: '+34' },
    { name: 'Italy', code: '+39' },
    { name: 'Netherlands', code: '+31' },
    { name: 'Sweden', code: '+46' },
    { name: 'Norway', code: '+47' },
    { name: 'Denmark', code: '+45' },
    { name: 'Finland', code: '+358' },
    { name: 'Switzerland', code: '+41' },
    { name: 'Austria', code: '+43' },
    { name: 'Belgium', code: '+32' },
    { name: 'Poland', code: '+48' },
    { name: 'Czech Republic', code: '+420' },
    { name: 'Hungary', code: '+36' },
    { name: 'Portugal', code: '+351' },
    { name: 'Greece', code: '+30' },
    { name: 'Turkey', code: '+90' },
    { name: 'Russia', code: '+7' },
    { name: 'South Korea', code: '+82' },
    { name: 'Singapore', code: '+65' },
    { name: 'Thailand', code: '+66' },
    { name: 'Malaysia', code: '+60' },
    { name: 'Indonesia', code: '+62' },
    { name: 'Philippines', code: '+63' },
    { name: 'Vietnam', code: '+84' },
    { name: 'South Africa', code: '+27' },
    { name: 'Egypt', code: '+20' },
    { name: 'Nigeria', code: '+234' },
    { name: 'Kenya', code: '+254' },
    { name: 'Morocco', code: '+212' },
    { name: 'Argentina', code: '+54' },
    { name: 'Chile', code: '+56' },
    { name: 'Colombia', code: '+57' },
    { name: 'Peru', code: '+51' },
    { name: 'Venezuela', code: '+58' },
    { name: 'New Zealand', code: '+64' },
    { name: 'Israel', code: '+972' },
    { name: 'Saudi Arabia', code: '+966' },
    { name: 'United Arab Emirates', code: '+971' },
    { name: 'Qatar', code: '+974' },
    { name: 'Kuwait', code: '+965' },
    { name: 'Bahrain', code: '+973' },
    { name: 'Oman', code: '+968' },
    { name: 'Jordan', code: '+962' },
    { name: 'Lebanon', code: '+961' },
    { name: 'Cyprus', code: '+357' },
    { name: 'Malta', code: '+356' },
    { name: 'Iceland', code: '+354' },
    { name: 'Ireland', code: '+353' },
    { name: 'Luxembourg', code: '+352' },
    { name: 'Monaco', code: '+377' },
    { name: 'Liechtenstein', code: '+423' },
    { name: 'San Marino', code: '+378' },
    { name: 'Vatican City', code: '+379' },
    { name: 'Andorra', code: '+376' }
  ];

  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    countryCode: '+1',
    phoneNumber: '',
    country: '',
    bio: '',
    institution: '',
    position: '',
    fieldOfInterest: [] as string[],
    preferredLearningMode: '',
    hobbies: [] as string[],
    privacyConsent: false
  });

  const [hobbyInput, setHobbyInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Interest categories
  const interestCategories: Record<string, string[]> = {
    'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'TypeScript', 'PHP', 'Ruby', 'Swift', 'Kotlin'],
    'Web Development': ['React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Laravel', 'Spring Boot', 'ASP.NET'],
    'Mobile Development': ['React Native', 'Flutter', 'Ionic', 'Xamarin', 'Native iOS', 'Native Android'],
    'Data Science': ['Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics', 'R', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch'],
    'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Ansible'],
    'Database': ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Firebase'],
    'UI/UX Design': ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    'Cybersecurity': ['Ethical Hacking', 'Network Security', 'Cryptography', 'Penetration Testing', 'Security Auditing'],
    'Game Development': ['Unity', 'Unreal Engine', 'Game Design', '2D Games', '3D Games', 'VR/AR'],
    'Other': ['Blockchain', 'IoT', 'AI/ML', 'Robotics', 'Digital Marketing', 'Project Management']
  };

  // Focus management and Escape key handling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes or when the user object is updated
  useEffect(() => {
    if (isOpen && user) {
      // Extract country code from phone number if it exists
      let countryCode = '+1'; // default
      let phoneNumber = '';
      
      if (user.phoneNumber) {
        const phoneMatch = user.phoneNumber.match(/^(\+\d{1,4})\s*(.*)$/);
        if (phoneMatch) {
          countryCode = phoneMatch[1];
          phoneNumber = phoneMatch[2];
        } else {
          phoneNumber = user.phoneNumber;
        }
      }

      setFormData({
        fullName: user.name || '',
        dateOfBirth: user.dateOfBirth ? (user.dateOfBirth instanceof Date ? user.dateOfBirth.toISOString().split('T')[0] : user.dateOfBirth) : '',
        countryCode: countryCode,
        phoneNumber: phoneNumber,
        country: user.country || '',
        bio: user.bio || '',
        institution: user.institution || '',
        position: user.position || '',
        fieldOfInterest: user.interests || [],
        preferredLearningMode: user.preferredLearningMode || '',
        hobbies: user.hobbies || [],
        privacyConsent: false
      });
    }
  }, [isOpen, user]);

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const fields = [
      formData.fullName,
      formData.dateOfBirth,
      formData.phoneNumber,
      formData.country,
      formData.bio,
      formData.institution,
      formData.position,
      formData.fieldOfInterest.length > 0,
      formData.preferredLearningMode,
      formData.hobbies.length > 0
    ];
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();
  const isProfileComplete = completionPercentage > 80;

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Check if current step is complete
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.dateOfBirth && formData.country;
      case 2:
        return formData.institution && formData.position;
      case 3:
        return formData.fieldOfInterest.length > 0;
      case 4:
        return formData.preferredLearningMode && formData.bio;
      default:
        return false;
    }
  };

  // Update completed steps when form data changes
  useEffect(() => {
    const newCompletedSteps: number[] = [];
    for (let i = 1; i <= steps.length; i++) {
      if (isStepComplete(i)) {
        newCompletedSteps.push(i);
      }
    }
    setCompletedSteps(newCompletedSteps);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      fieldOfInterest: prev.fieldOfInterest.includes(interest)
        ? prev.fieldOfInterest.filter(i => i !== interest)
        : [...prev.fieldOfInterest, interest]
    }));
  };

  const addHobby = () => {
    if (hobbyInput.trim() && !formData.hobbies.includes(hobbyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, hobbyInput.trim()]
      }));
      setHobbyInput('');
    }
  };

  const removeHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid birth date';
      }
    }

    if (formData.phoneNumber) {
      const fullPhoneNumber = `${formData.countryCode}${formData.phoneNumber}`;
      const phoneRegex = /^\+\d{1,4}\s?\d{6,14}$/;
      if (!phoneRegex.test(fullPhoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }

    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution/Company is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (formData.fieldOfInterest.length === 0) {
      newErrors.fieldOfInterest = 'Please select at least one field of interest';
    }

    if (!formData.preferredLearningMode) {
      newErrors.preferredLearningMode = 'Preferred learning mode is required';
    }

    if (!formData.privacyConsent) {
      newErrors.privacyConsent = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('Submitting profile update with data:', formData);
      
      // Combine country code and phone number
      const fullPhoneNumber = formData.phoneNumber ? `${formData.countryCode}${formData.phoneNumber}` : '';
      
      const updateData = {
        name: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        phoneNumber: fullPhoneNumber,
        country: formData.country,
        bio: formData.bio,
        institution: formData.institution,
        position: formData.position as "Student" | "Faculty" | "Intern" | "Employee" | "Freelancer",
        interests: formData.fieldOfInterest,
        preferredLearningMode: formData.preferredLearningMode as "Video" | "Text" | "Interactive",
        hobbies: formData.hobbies
      };

      console.log('Profile update data being sent:', updateData);
      
      await updateProfile(updateData);
      
      console.log('Profile updated successfully');
      setShowSuccess(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden transform animate-slide-up border border-white/20 dark:border-gray-700/50">
        {/* Modern Header with Step Indicator */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-16 -translate-y-8"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform -translate-x-16 translate-y-8"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 id="profile-modal-title" className="text-3xl font-bold">
                    {isProfileComplete ? 'My Profile' : 'Complete Your Profile'}
                  </h2>
                  <p className="text-white/80 text-lg">
                    {isProfileComplete
                      ? 'View and edit your personal details below'
                      : (
                          <>
                            Let's personalize your <span className="text-black">Level</span><span className="text-orange-500">Up</span> experience
                          </>
                        )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Skip Button */}
                {!isProfileComplete && (
                  <button
                    onClick={() => {
                      if (onSkip) onSkip();
                      onClose();
                    }}
                    className="px-6 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
                  >
                    Skip for Now
                  </button>
                )}
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  title="Close"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.includes(step.id);
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => goToStep(step.id)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-white text-indigo-600 shadow-lg scale-110'
                            : isCompleted
                            ? 'bg-white/20 text-white border-2 border-white/30'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </button>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-white/60">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 rounded-full ${
                        completedSteps.includes(step.id) ? 'bg-white' : 'bg-white/20'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Profile Updated Successfully!</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Your profile has been saved and will be displayed in your profile page.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="p-2 hover:bg-green-200 dark:hover:bg-green-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-green-600 dark:text-green-400" />
            </button>
          </div>
        )}

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-300px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
          <form onSubmit={handleSubmit}>
            <div className="p-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tell us about yourself</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                      </div>
                      {errors.dateOfBirth && <p className="text-sm text-red-600">{errors.dateOfBirth}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Phone Number
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative w-32">
                          <select
                            value={formData.countryCode}
                            onChange={(e) => handleInputChange('countryCode', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm appearance-none"
                          >
                            {countries.map(country => (
                              <option key={country.code} value={country.code}>
                                {country.code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                              errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Country *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none`}
                        >
                          <option value="">Select your country</option>
                          {countries.map(country => (
                            <option key={country.name} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tell us about your work or education</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Institution/Company *
                      </label>
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.institution ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="University, Company, or Organization"
                      />
                      {errors.institution && <p className="text-sm text-red-600">{errors.institution}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Position *
                      </label>
                      <select
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.position ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none`}
                      >
                        <option value="">Select your position</option>
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Intern">Intern</option>
                        <option value="Employee">Employee</option>
                        <option value="Freelancer">Freelancer</option>
                      </select>
                      {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Interests */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Interests</h3>
                    <p className="text-gray-600 dark:text-gray-400">What would you like to learn about?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Fields of Interest * (Select at least one)
                    </label>
                    
                    {Object.entries(interestCategories).map(([category, interests]) => (
                      <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Code className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({formData.fieldOfInterest.filter(interest => interests.includes(interest)).length}/{interests.length})
                            </span>
                          </div>
                          {expandedCategories.has(category) ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedCategories.has(category) && (
                          <div className="p-4 bg-white dark:bg-gray-900">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {interests.map((interest: string) => (
                                <button
                                  key={interest}
                                  type="button"
                                  onClick={() => toggleInterest(interest)}
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                                    formData.fieldOfInterest.includes(interest)
                                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {interest}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {errors.fieldOfInterest && (
                      <p className="text-sm text-red-600 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.fieldOfInterest}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Preferences */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Learning Preferences</h3>
                    <p className="text-gray-600 dark:text-gray-400">How do you like to learn?</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Preferred Learning Mode *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'Video', label: 'Video', description: 'Learn through videos and visual content' },
                          { value: 'Text', label: 'Text', description: 'Learn through reading and written materials' },
                          { value: 'Interactive', label: 'Interactive', description: 'Learn through hands-on activities and practice' }
                        ].map(mode => (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => handleInputChange('preferredLearningMode', mode.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              formData.preferredLearningMode === mode.value
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-lg font-semibold">{mode.label}</div>
                              <div className="text-sm opacity-75">{mode.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.preferredLearningMode && <p className="text-sm text-red-600">{errors.preferredLearningMode}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Bio *
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                          errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none`}
                        placeholder="Tell us about yourself, your goals, and what you hope to achieve..."
                      />
                      {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Hobbies & Interests
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={hobbyInput}
                          onChange={(e) => setHobbyInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Add a hobby or interest"
                        />
                        <button
                          type="button"
                          onClick={addHobby}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200"
                        >
                          Add
                        </button>
                      </div>
                      {formData.hobbies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.hobbies.map(hobby => (
                            <span
                              key={hobby}
                              className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                            >
                              {hobby}
                              <button
                                type="button"
                                onClick={() => removeHobby(hobby)}
                                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.privacyConsent}
                          onChange={(e) => handleInputChange('privacyConsent', e.target.checked)}
                          className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          I agree to the{' '}
                          <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                            Privacy Policy
                          </a>{' '}
                          and consent to the processing of my personal data for educational purposes. *
                        </span>
                      </label>
                      {errors.privacyConsent && <p className="text-sm text-red-600">{errors.privacyConsent}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errors.submit}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Skip Button */}
            {!isProfileComplete && (
              <button
                type="button"
                onClick={() => {
                  if (onSkip) onSkip();
                  onClose();
                }}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Skip for Now</span>
              </button>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepComplete(currentStep)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  isStepComplete(currentStep)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;