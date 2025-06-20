const axios = require('axios');

async function registerUser() {
    try {
        const response = await axios.post('http://localhost:5001/api/register', {
            username: 'testuser_from_script',
            password: 'password123',
            role: 'admin'
        });
        console.log('SUCCESS: User registered successfully!');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('ERROR: Failed to register user.');
        if (error.response) {
            console.error('Error Response:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

async function loginUser(username, password) {
    console.log(`\nAttempting to login user: ${username}...`);
    try {
        const response = await axios.post('http://localhost:5001/api/login', {
            username: username,
            password: password
        });
        console.log('SUCCESS: User logged in successfully!');
        console.log('Login Response:', response.data);
    } catch (error) {
        console.error('ERROR: Failed to login user.');
        if (error.response) {
            console.error('Error Response:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

async function runTests() {
    // First, try to register a user (this might fail if already exists, which is okay for this test sequence)
    await registerUser(); 

    // Then, try to login with a known user
    // We know 'internal_test_user' was created with password 'password123' and role 'viewer'
    await loginUser('internal_test_user', 'password123');
}

runTests();
