import { Request, Response } from 'express'
import Certificate from '../models/Certificate'
import Course from '../models/Course'
import User from '../models/User'
import { authenticate } from '../middleware/auth'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

// Generate certificate for a completed course
export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params
    const userId = req.user?.id

    console.log('Certificate generation request:', { courseId, userId, user: req.user })

    if (!userId) {
      console.log('No user ID found in request')
      return res.status(401).json({ message: 'User not authenticated' })
    }

    // Check if user exists
    console.log('Looking up user with ID:', userId)
    const user = await User.findById(userId)
    if (!user) {
      console.log('User not found')
      return res.status(404).json({ message: 'User not found' })
    }
    console.log('User found:', user.name)

    // Check if course exists
    console.log('Looking up course with ID:', courseId)
    const course = await Course.findById(courseId)
    if (!course) {
      console.log('Course not found')
      return res.status(404).json({ message: 'Course not found' })
    }
    console.log('Course found:', course.title)

    // Check if certificate already exists and delete it to regenerate
    try {
      await deleteExistingCertificate(userId, courseId)
    } catch (error) {
      console.error('Error handling existing certificate:', error)
      // Non-fatal: log and continue to generate a new certificate
    }

    // Generate certificate image with required metadata
    console.log('Generating certificate image for:', { userName: user.name, courseName: course.title })
    const authorName = course.instructor?.name || 'Instructor'
    const certificateUrl = await generateCertificateImage(user.name, course.title, authorName)
    console.log('Certificate image generated:', certificateUrl)

    // Create certificate record
    const certificate = new Certificate({
      userId,
      courseId,
      userName: user.name,
      courseName: course.title,
      certificateUrl
    })

    await certificate.save()

    return res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      data: { certificate }
    })
  } catch (error) {
    console.error('Certificate generation error:', error)
    return res.status(500).json({ success: false, message: 'Error generating certificate' })
  }
}

// Get user's certificates
export const getUserCertificates = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title thumbnail')
      .sort({ issuedAt: -1 })

    return res.status(200).json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: { certificates }
    })
  } catch (error) {
    console.error('Get certificates error:', error)
    return res.status(500).json({ success: false, message: 'Error fetching certificates' })
  }
}

// Download certificate
export const downloadCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const certificate = await Certificate.findOne({ _id: certificateId, userId })
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' })
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.courseName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.png"`)

    // Read and send the certificate file
    const certificatePath = path.join(__dirname, '../../public/certificates', certificate.certificateUrl)
    
    if (!fs.existsSync(certificatePath)) {
      return res.status(404).json({ message: 'Certificate file not found' })
    }

    const certificateBuffer = fs.readFileSync(certificatePath)
    return res.send(certificateBuffer)
  } catch (error) {
    console.error('Download certificate error:', error)
    return res.status(500).json({ message: 'Error downloading certificate' })
  }
}

// Generate certificate image with text overlay
async function generateCertificateImage(
  userName: string,
  courseName: string,
  authorName: string
): Promise<string> {
  try {
    console.log('Starting certificate generation...')
    
    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, '../../public/certificates')
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true })
      console.log('Created certificates directory')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `certificate_${timestamp}.png`
    const outputPath = path.join(certificatesDir, filename)
    
    console.log('Creating styled certificate with overlay...')

    const width = 1400
    const height = 1000

    // Use levelUpcertificate.png template from frontend public directory
    const frontendAssetsDir = path.join(__dirname, '../../../frontend/public')
    const templatePath = path.join(frontendAssetsDir, 'levelUpcertificate.png')
    const possibleLogos = ['logo.png', 'LEARNHUB.png', 'learnhub.png']
    const logoPath = possibleLogos
      .map(name => path.join(frontendAssetsDir, name))
      .find(p => fs.existsSync(p))
    const hasTemplate = fs.existsSync(templatePath)
    console.log('Template path:', templatePath)
    console.log('Template exists:', hasTemplate)
    console.log('Logo path:', logoPath)

    // SVG overlay matching new levelUpcertificate.png template layout
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- User Name: moved to new position, larger font -->
  <text x="700" y="500" text-anchor="middle" font-family="Gravitas One, serif" font-size="52" fill="#000000" font-weight="bold">${escapeXML(userName)}</text>

  <!-- Course Name: larger font, "Course" appended -->
  <text x="700" y="620" text-anchor="middle" font-family="Rowdies, sans-serif" font-size="36" fill="#000000" font-weight="bold">${escapeXML(courseName + ' Course')}</text>
</svg>`

    // Prepare base image
    let base = hasTemplate
      ? sharp(templatePath).resize(width, height).png()
      : sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        }).png()

    const composites: sharp.OverlayOptions[] = []

    // Add text overlay SVG
    composites.push({ input: Buffer.from(svg) })

    await base.composite(composites).png().toFile(outputPath)

    console.log('Certificate created successfully at:', outputPath)
    return filename
  } catch (error) {
    console.error('Error generating certificate image:', error)
    throw error
  }
}

// Basic XML escaping for text values placed in SVG
function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Safely delete an existing certificate and its image file
async function deleteExistingCertificate(userId: string, courseId: string) {
  try {
    const existingCertificate = await Certificate.findOne({ userId, courseId })

    if (existingCertificate) {
      // Delete the image file if it exists
      if (existingCertificate.certificateUrl) {
        const imagePath = path.join(
          __dirname,
          '../../public/certificates',
          path.basename(existingCertificate.certificateUrl)
        )

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }

      // Delete the certificate record from the database
      await Certificate.findByIdAndDelete(existingCertificate._id)
    }
  } catch (error) {
    console.error('Error deleting existing certificate:', error)
    // Do not re-throw, to prevent crashing the main process
  }
}
