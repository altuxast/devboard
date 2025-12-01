import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize navigate

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;

            if (token) {
                sessionStorage.setItem('authToken', token); // Store the token in sessionStorage
                navigate('/board'); // Use navigate to redirect after successful login
            } else {
                setError('Login failed: No token returned');
            }
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Login failed');
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={loginUser}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <button type="submit">Login</button>
                </div>
            </form>
            {error && <p>{error}</p>} {/* Display error if login fails */}
        </div>
    );
};

export default Login;
