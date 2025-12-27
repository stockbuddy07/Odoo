const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

// Test data
const testUser = {
  email: 'test@gearguard.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'User'
};

let authToken = null;
let testUserId = null;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test functions
const testHealthCheck = async () => {
  console.log('🏥 Testing health check...');
  try {
    const response = await api.get('/health');
    if (response.status === 200) {
      console.log('✅ Health check passed');
      return true;
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

const testRegister = async () => {
  console.log('📝 Testing user registration...');
  try {
    const response = await api.post('/api/auth/register', testUser);
    
    if (response.data.success) {
      console.log('✅ Registration successful');
      authToken = response.data.data.tokens.accessToken;
      testUserId = response.data.data.user.id;
      return true;
    } else {
      console.log('❌ Registration failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.response?.data?.message || error.message);
    return false;
  }
};

const testLogin = async () => {
  console.log('🔐 Testing user login...');
  try {
    const response = await api.post('/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.data.success) {
      console.log('✅ Login successful');
      authToken = response.data.data.tokens.accessToken;
      testUserId = response.data.data.user.id;
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
};

const testProtectedEndpoints = async () => {
  console.log('🛡️ Testing protected endpoints...');
  
  // Set auth token for protected requests
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  
  const tests = [];
  
  // Test get current user
  try {
    const response = await api.get('/api/auth/me');
    if (response.data.success) {
      console.log('✅ Get current user successful');
      tests.push(true);
    } else {
      console.log('❌ Get current user failed');
      tests.push(false);
    }
  } catch (error) {
    console.error('❌ Get current user error:', error.response?.data?.message || error.message);
    tests.push(false);
  }
  
  // Test get user profile
  try {
    const response = await api.get('/api/users/profile');
    if (response.data.success) {
      console.log('✅ Get profile successful');
      tests.push(true);
    } else {
      console.log('❌ Get profile failed');
      tests.push(false);
    }
  } catch (error) {
    console.error('❌ Get profile error:', error.response?.data?.message || error.message);
    tests.push(false);
  }
  
  // Test get dashboard
  try {
    const response = await api.get('/api/users/dashboard');
    if (response.data.success) {
      console.log('✅ Get dashboard successful');
      tests.push(true);
    } else {
      console.log('❌ Get dashboard failed');
      tests.push(false);
    }
  } catch (error) {
    console.error('❌ Get dashboard error:', error.response?.data?.message || error.message);
    tests.push(false);
  }
  
  return tests.every(test => test);
};

const testUpdateProfile = async () => {
  console.log('📋 Testing profile update...');
  try {
    const updateData = {
      phone: '+1234567890',
      address: '123 Test Street',
      bio: 'This is a test user profile'
    };
    
    const response = await api.put('/api/users/profile', updateData);
    
    if (response.data.success) {
      console.log('✅ Profile update successful');
      return true;
    } else {
      console.log('❌ Profile update failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Profile update error:', error.response?.data?.message || error.message);
    return false;
  }
};

const testInvalidToken = async () => {
  console.log('🚫 Testing invalid token handling...');
  try {
    // Set invalid token
    api.defaults.headers.common['Authorization'] = 'Bearer invalid_token';
    
    const response = await api.get('/api/auth/me');
    console.log('❌ Invalid token test failed - should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid token correctly rejected');
      return true;
    } else {
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  }
};

const testLogout = async () => {
  console.log('🚪 Testing logout...');
  try {
    const response = await api.post('/api/auth/logout');
    
    if (response.data.success) {
      console.log('✅ Logout successful');
      return true;
    } else {
      console.log('❌ Logout failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Logout error:', error.response?.data?.message || error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting API Tests');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Test 1: Health Check
  results.push(await testHealthCheck());
  console.log('');
  
  // Test 2: User Registration
  results.push(await testRegister());
  console.log('');
  
  // Test 3: User Login
  results.push(await testLogin());
  console.log('');
  
  // Test 4: Protected Endpoints
  results.push(await testProtectedEndpoints());
  console.log('');
  
  // Test 5: Profile Update
  results.push(await testUpdateProfile());
  console.log('');
  
  // Test 6: Invalid Token Handling
  results.push(await testInvalidToken());
  console.log('');
  
  // Test 7: Logout
  results.push(await testLogout());
  console.log('');
  
  // Summary
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  
  const passedTests = results.filter(result => result).length;
  const totalTests = results.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your backend is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check your backend configuration.');
  }
  
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('1. Start XAMPP and ensure MySQL is running');
  console.log('2. Run: npm run init-db (to initialize database)');
  console.log('3. Run: npm run dev (to start backend server)');
  console.log('4. Run: npm run dev (in frontend folder to start frontend)');
};

// Run tests if called directly
if (require.main === module) {
  console.log('🔍 API Test Suite');
  console.log(`Testing against: ${API_BASE_URL}`);
  console.log('');
  
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
