import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { videoAPI, APIError } from '../utils/api'

const AdminAddVideo: React.FC = () => {
  const { courseId = '' } = useParams()
  const { user } = useAuth()

  const isAllowed = useMemo(() => user?.role === 'admin' || user?.role === 'instructor', [user])

  const [title, setTitle] = useState('Python for Beginners - Full Course')
  const [description, setDescription] = useState('Complete beginner lesson using the provided YouTube link.')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState<number>(5400)
  const [order, setOrder] = useState<number>(1)
  const [isPreview, setIsPreview] = useState<boolean>(true)
  const [thumbnail, setThumbnail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be an instructor or admin to add videos.</p>
          <Link to="/dashboard" className="inline-block px-6 py-3 bg-black text-white rounded-xl">Go to Dashboard</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const payload = {
        courseId,
        title,
        description,
        videoUrl,
        duration,
        order,
        isPreview,
        thumbnail
      }
      const res = await videoAPI.createVideo(payload)
      if (res.success) {
        const vid = (res.data as any).video
        await videoAPI.updateVideo(vid._id, { isPublished: true })
        setSuccess('Video created and published successfully')
      }
    } catch (err) {
      const msg = err instanceof APIError ? err.message : 'Failed to create video'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const suggestThumbFromYouTube = () => {
    try {
      const m = videoUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
      if (m && m[1]) {
        setThumbnail(`https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg`)
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Add Video</h1>
          <Link to={`/course/${courseId}`} className="text-sm text-gray-700 hover:text-black">Back to Course</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-1 gap-5">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
          {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Order</label>
              <input type="number" min={1} value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Duration (sec)</label>
              <input type="number" min={1} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" checked={isPreview} onChange={e => setIsPreview(e.target.checked)} className="mr-2" />
                <span className="text-sm text-gray-700">Preview</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">YouTube URL</label>
              <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://youtu.be/..." />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Thumbnail URL</label>
              <div className="flex space-x-2">
                <input value={thumbnail} onChange={e => setThumbnail(e.target.value)} required className="flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder="https://img.youtube.com/vi/<id>/maxresdefault.jpg" />
                <button type="button" onClick={suggestThumbFromYouTube} className="px-3 py-2 bg-gray-900 text-white rounded-lg">Auto</button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button disabled={submitting} className="px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-900 disabled:opacity-60">
              {submitting ? 'Adding...' : 'Add Video'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminAddVideo




















