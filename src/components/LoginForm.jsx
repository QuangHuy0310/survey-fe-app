import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/LoginForm.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    console.log('REACT_APP_BACK_END_URL:', process.env.REACT_APP_BACK_END_URL);

    // Handle Google login token from URL
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const { sub, id, role } = decoded;

                const user = {
                    id,
                    role,
                    googleId: sub,
                };

                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(user));

                alert('Đăng nhập Google thành công!');

                // Xóa token khỏi URL
                window.history.replaceState({}, document.title, window.location.pathname);

                if (role === 'manager') {
                    navigate('/manager');
                } else if (role === 'user') {
                    navigate('/user');
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Google login error:', error);
                alert('Đăng nhập Google thất bại. Vui lòng thử lại!');
            }
        }
    }, [location, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(process.env.REACT_APP_BACK_END_URL + '/Auth/login', {
                email,
                password,
            });

            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            const decoded = jwtDecode(accessToken);
            const role = decoded?.role;

            alert('Đăng nhập thành công!');

            if (role === 'manager') {
                navigate('/manager');
            } else if (role === 'user') {
                navigate('/user');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = process.env.REACT_APP_BACK_END_URL + '/auth/google/login';
    };

    return (
        <form className="form_container" onSubmit={handleLogin}>
            <div className="logo_container"></div>
            <div className="title_container">
                <p className="title">Login to your Account</p>
                <span className="subtitle">
                    Get started with our app, just create an account and enjoy the experience.
                </span>
            </div>
            <br />
            <div className="input_container">
                <label className="input_label" htmlFor="email_field">Email</label>
                <svg className="icon" viewBox="0 0 24 24">...</svg>
                <input
                    placeholder="name@mail.com"
                    name="email"
                    type="text"
                    className="input_field"
                    id="email_field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="input_container">
                <label className="input_label" htmlFor="password_field">Password</label>
                <svg className="icon" viewBox="0 0 24 24">...</svg>
                <input
                    placeholder="Password"
                    name="password"
                    type="password"
                    className="input_field"
                    id="password_field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button type="submit" className="sign-in_btn">
                <span>Sign In</span>
            </button>

            <div className="separator">
                <hr className="line" />
                <span>Or</span>
                <hr className="line" />
            </div>
            <button type="button" className="sign-in_ggl" onClick={handleGoogleLogin}>
                <svg height="18" width="18" viewBox="0 0 32 32">...</svg>
                <span>Sign in with Google</span>
            </button>
        </form>
    );
};

export default LoginForm;