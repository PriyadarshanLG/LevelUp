import React, { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI, APIError } from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'

// Defines a set of templates for various courses.
const courseTemplates = {
  'python': {
    title: 'Python for Beginners',
    description: 'A practical, beginner-friendly Python course covering syntax, data types, control flow, functions, and basic projects.',
    shortDescription: 'Learn Python from scratch with hands-on examples',
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    thumbnail: 'https://img.youtube.com/vi/UrsmFxEIp5k/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/UrsmFxEIp5k?si=YXjiEuov3djVftHt',
    tags: 'python, beginner, programming',
    requirements: 'No prior programming experience required',
    learningOutcomes: 'Understand Python basics; Work with data types; Write simple scripts'
  },
  'java': {
    title: 'Java for Beginners',
    description: 'Learn the fundamentals of Java programming, including object-oriented principles, syntax, and basic application development.',
    shortDescription: 'Get started with Java, one of the most popular programming languages',
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    thumbnail: 'https://img.youtube.com/vi/grEKMHGYyns/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/grEKMHGYyns',
    tags: 'java, beginner, programming',
    requirements: 'No prior programming experience required',
    learningOutcomes: 'Understand Java syntax; Grasp object-oriented concepts; Build simple Java applications'
  },
  'c': {
    title: 'C Programming for Beginners',
    description: 'An introduction to the C programming language, focusing on fundamentals like memory management, pointers, and data structures.',
    shortDescription: 'Learn the foundational concepts of C programming',
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    thumbnail: 'https://img.youtube.com/vi/KJgsSFOSQv0/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/KJgsSFOSQv0',
    tags: 'c, programming, fundamentals',
    requirements: 'Basic computer literacy',
    learningOutcomes: 'Understand memory management; Work with pointers; Implement basic data structures'
  },
  'c++': {
    title: 'C++ for Beginners',
    description: 'A beginner\'s guide to C++, covering everything from basic syntax to object-oriented programming and the Standard Template Library (STL).',
    shortDescription: 'Start your journey with the powerful C++ language',
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    thumbnail: 'https://img.youtube.com/vi/vLnPwxZdW4Y/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/vLnPwxZdW4Y',
    tags: 'c++, oop, programming',
    requirements: 'Some programming experience is helpful but not required',
    learningOutcomes: 'Understand C++ syntax; Learn object-oriented principles; Use the STL effectively'
  },
  'html': {
    title: 'HTML Fundamentals',
    description: 'Learn the basics of HTML to create and structure web pages. This course covers tags, elements, forms, and more.',
    shortDescription: 'Build the foundation of your web development skills with HTML',
    category: 'Programming',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    thumbnail: 'https://img.youtube.com/vi/pQN-pnXPaVg/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/pQN-pnXPaVg',
    tags: 'html, web development, frontend',
    requirements: 'No prior experience needed',
    learningOutcomes: 'Structure web pages with HTML; Use various HTML tags and elements; Create forms'
  },
  'css': {
    title: 'CSS for Beginners',
    description: 'Learn how to style web pages with CSS. This course covers selectors, properties, layouts, and responsive design.',
    shortDescription: 'Style your websites and make them look great with CSS',
    category: 'Design',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    thumbnail: 'https://img.youtube.com/vi/1Rs2ND1ryYc/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/1Rs2ND1ryYc',
    tags: 'css, web design, frontend',
    requirements: 'Basic knowledge of HTML',
    learningOutcomes: 'Understand CSS selectors and properties; Create layouts with Flexbox and Grid; Implement responsive design'
  },
  'computer-networks': {
    title: 'Introduction to Computer Networks',
    description: 'A comprehensive overview of computer networking, including protocols, network architecture, and security fundamentals.',
    shortDescription: 'Understand how the internet and computer networks work',
    category: 'Business',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    price: 29.99,
    thumbnail: 'https://img.youtube.com/vi/IPvYjXCsTg8/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/IPvYjXCsTg8',
    tags: 'networking, cybersecurity, IT',
    requirements: 'Basic IT knowledge',
    learningOutcomes: 'Understand the OSI model; Learn about TCP/IP and other protocols; Grasp network security concepts'
  },
  'software-engineering': {
    title: 'Software Engineering Principles',
    description: 'Learn the fundamentals of software engineering, including software development life cycles, design patterns, and testing methodologies.',
    shortDescription: 'Master the principles of building robust and scalable software',
    category: 'Personal Development',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    price: 39.99,
    thumbnail: 'https://img.youtube.com/vi/Z6f9ckE23_E/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/Z6f9ckE23_E',
    tags: 'software development, engineering, agile',
    requirements: 'Experience with at least one programming language',
    learningOutcomes: 'Understand different software development models; Apply design patterns to solve common problems; Learn various testing techniques'
  },
  'cloud-computing': {
    title: 'Cloud Computing Basics',
    description: 'An introduction to cloud computing, covering concepts like IaaS, PaaS, and SaaS, as well as major cloud providers like AWS, Azure, and Google Cloud.',
    shortDescription: 'Get started with the essentials of cloud computing',
    category: 'Business',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 19.99,
    thumbnail: 'https://img.youtube.com/vi/M988_fsOSWo/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/M988_fsOSWo',
    tags: 'cloud, aws, azure, gcp',
    requirements: 'No prior cloud experience required',
    learningOutcomes: 'Understand the different cloud service models; Learn about the major cloud providers; Grasp the benefits of cloud computing'
  },
  'ai': {
    title: 'Introduction to Artificial Intelligence',
    description: 'A beginner-friendly introduction to the world of AI, covering machine learning, neural networks, and natural language processing.',
    shortDescription: 'Explore the exciting field of Artificial Intelligence',
    category: 'Data Science',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 49.99,
    thumbnail: 'https://img.youtube.com/vi/ad79nYk2keg/maxresdefault.jpg',
    previewVideo: 'https://youtu.be/ad79nYk2keg',
    tags: 'ai, machine learning, data science',
    requirements: 'Basic knowledge of programming and mathematics',
    learningOutcomes: 'Understand the basics of machine learning; Learn about neural networks; Get an overview of natural language processing'
  }
};


const categories = [
  'Programming','Design','Business','Marketing','Data Science','Personal Development','Language','Health & Fitness','Music','Photography'
]

const AdminCreateCourse: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isAllowed = useMemo(() => user?.role === 'admin' || user?.role === 'instructor', [user])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [price, setPrice] = useState<number>(0)
  const [thumbnail, setThumbnail] = useState('')
  const [previewVideo, setPreviewVideo] = useState('')
  const [tags, setTags] = useState<string>('python, beginner, programming')
  const [requirements, setRequirements] = useState<string>('No prior programming experience required')
  const [learningOutcomes, setLearningOutcomes] = useState<string>('Understand Python basics; Work with data types; Write simple scripts')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be an instructor or admin to create courses.</p>
          <Link to="/dashboard" className="inline-block px-6 py-3 bg-black text-white rounded-xl">Go to Dashboard</Link>
        </div>
      </div>
    )
  }

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value;
    const template = courseTemplates[templateKey as keyof typeof courseTemplates];
    if (template) {
      setTitle(template.title);
      setDescription(template.description);
      setShortDescription(template.shortDescription);
      setCategory(template.category);
      setLevel(template.level);
      setPrice(template.price);
      setThumbnail(template.thumbnail);
      setPreviewVideo(template.previewVideo);
      setTags(template.tags);
      setRequirements(template.requirements);
      setLearningOutcomes(template.learningOutcomes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const payload = {
        title,
        description,
        shortDescription,
        category,
        level,
        price,
        thumbnail,
        previewVideo: previewVideo || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        requirements: requirements.split(';').map(t => t.trim()).filter(Boolean),
        learningOutcomes: learningOutcomes.split(';').map(t => t.trim()).filter(Boolean)
      }
      const res = await courseAPI.createCourse(payload)
      if (res.success) {
        setSuccess('Course created successfully')
        // Navigate to add video page for convenience
        const courseId = (res.data as any).course._id
        setTimeout(() => navigate(`/admin/courses/${courseId}/videos/new`), 800)
      }
    } catch (err) {
      const msg = err instanceof APIError ? err.message : 'Failed to create course'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create Course</h1>
          <Link to="/dashboard" className="text-sm text-gray-700 hover:text-black">Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-1 gap-5">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
          {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Select a Course Template</label>
            <select onChange={handleTemplateChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">-- Select a Template --</option>
              {Object.keys(courseTemplates).map(key => (
                <option key={key} value={key}>{courseTemplates[key as keyof typeof courseTemplates].title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Python for Beginners" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Short Description</label>
            <input value={shortDescription} onChange={e => setShortDescription(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Learn Python from scratch" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Full Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="A practical beginner-friendly course..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Price (USD)</label>
              <input type="number" min={0} value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Thumbnail URL</label>
              <input value={thumbnail} onChange={e => setThumbnail(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://img.youtube.com/vi/<id>/maxresdefault.jpg" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Preview Video URL (optional)</label>
              <input value={previewVideo} onChange={e => setPreviewVideo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://youtu.be/..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tags (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Requirements (separate with ;)</label>
              <input value={requirements} onChange={e => setRequirements(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Learning Outcomes (separate with ;)</label>
            <input value={learningOutcomes} onChange={e => setLearningOutcomes(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div className="pt-2">
            <button disabled={submitting} className="px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-900 disabled:opacity-60">
              {submitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminCreateCourse





