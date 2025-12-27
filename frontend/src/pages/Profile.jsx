import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Lock, Camera, Edit3, Save, X } from 'lucide-react'
import './Profile.css'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate developer with experience in modern web technologies.'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    // TODO: Implement API call to update user profile
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      bio: 'Passionate developer with experience in modern web technologies.'
    })
    setIsEditing(false)
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff&size=128`}
            alt="Profile"
            className="avatar-image"
          />
          <button className="avatar-edit-btn">
            <Camera size={16} />
          </button>
        </div>
        <div className="profile-info">
          <h1>{user?.name || 'User'}</h1>
          <p>{user?.email || 'user@example.com'}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">142</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">89</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">156</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
              <Edit3 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={18} />
                Save
              </button>
              <button className="btn btn-outline" onClick={handleCancel}>
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              {isEditing ? (
                <div className="input-container">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>
              ) : (
                <p>{formData.name}</p>
              )}
            </div>

            <div className="info-item">
              <label>Email Address</label>
              {isEditing ? (
                <div className="input-container">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
              ) : (
                <p>{formData.email}</p>
              )}
            </div>

            <div className="info-item">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p>{formData.phone}</p>
              )}
            </div>

            <div className="info-item">
              <label>Location</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                />
              ) : (
                <p>{formData.location}</p>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Bio</h2>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="bio-textarea"
            />
          ) : (
            <p className="bio-text">{formData.bio}</p>
          )}
        </div>

        <div className="profile-section">
          <h2>Account Security</h2>
          <div className="security-options">
            <div className="security-item">
              <div className="security-info">
                <Lock size={20} />
                <div>
                  <h3>Password</h3>
                  <p>Last changed 30 days ago</p>
                </div>
              </div>
              <button className="btn btn-outline">Change Password</button>
            </div>
            
            <div className="security-item">
              <div className="security-info">
                <Mail size={20} />
                <div>
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
              </div>
              <button className="btn btn-outline">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
