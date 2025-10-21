import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import User from '../models/User'
import { IUser } from '../models/User'

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    
    return res.json({ success: true, data: { user } })
  } catch (error: any) {
    console.error('Error getting profile:', error)
    return res.status(500).json({ success: false, message: 'Error getting profile' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }

  try {
    const {
      name,
      dateOfBirth,
      gender,
      phoneNumber,
      country,
      hobbies,
      institution,
      position,
      department,
      yearOfStudy,
      experienceLevel,
      fieldOfInterest,
      preferredLearningMode,
      preferredLanguage,
      careerGoal,
      profession,
      organization,
      bio,
      location,
      socialLinks,
      interests
    } = req.body

    const user = await User.findById(req.user?._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Update profile fields
    if (name) user.name = name
    if (dateOfBirth) user.dateOfBirth = dateOfBirth
    if (gender) user.gender = gender
    if (phoneNumber) user.phoneNumber = phoneNumber
    if (country) user.country = country
    if (hobbies) user.hobbies = hobbies
    if (institution) user.institution = institution
    if (position) user.position = position
    if (department) user.department = department
    if (yearOfStudy) user.yearOfStudy = yearOfStudy
    if (experienceLevel) user.experienceLevel = experienceLevel
    if (fieldOfInterest) user.fieldOfInterest = fieldOfInterest
    if (preferredLearningMode) user.preferredLearningMode = preferredLearningMode
    if (preferredLanguage) user.preferredLanguage = preferredLanguage
    if (careerGoal) user.careerGoal = careerGoal
    if (profession) user.profession = profession
    if (organization) user.organization = organization
    if (bio) user.bio = bio
    if (location) user.location = location
    if (socialLinks) user.socialLinks = socialLinks
    if (interests) user.interests = interests

    await user.save()

  // Exclude password and __v from the returned user object
  const { password, __v, ...safeUser } = user.toObject() as any

    return res.json({
      success: true,
      data: {
        user: safeUser
      }
    })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return res.status(500).json({ success: false, message: 'Error updating profile' })
  }
}