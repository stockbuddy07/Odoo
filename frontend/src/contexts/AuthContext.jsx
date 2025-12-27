import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)

  useEffect(() => {
    // Check for stored auth data on app load
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken)
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      
      if (response.data.success) {
        const { user: userData, tokens } = response.data.data
        
        // Store auth data
        setUser(userData)
        setToken(tokens.accessToken)
        setRefreshToken(tokens.refreshToken)
        
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        
        return { success: true, user: userData }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await authAPI.register({ 
        email, 
        password, 
        firstName, 
        lastName 
      })
      
      if (response.data.success) {
        const { user: userData, tokens } = response.data.data
        
        // Store auth data
        setUser(userData)
        setToken(tokens.accessToken)
        setRefreshToken(tokens.refreshToken)
        
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        
        return { success: true, user: userData }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'Registration failed'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      // Call logout API (optional, as tokens are stored client-side)
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear all auth data regardless of API call result
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken(refreshToken)
      
      if (response.data.success) {
        const { tokens } = response.data.data
        
        setToken(tokens.accessToken)
        setRefreshToken(tokens.refreshToken)
        
        localStorage.setItem('token', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        
        return true
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout user
      logout()
      return false
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    token,
    refreshToken,
    login,
    register,
    logout,
    refreshAuthToken,
    updateUser,
    loading,
    isAuthenticated: !!user && !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
