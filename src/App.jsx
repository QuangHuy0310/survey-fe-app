import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginForm from './components/LoginForm';
import UserPage from './pages/UserPage';
import UserResponses from './components/UserResponse';
import ManagerPage from './pages/ManagerPage';
import UserResponsePage from './pages/UserResponsePage';
import SurveyPage from './pages/SurveyPage';
import QuestionPage from './pages/QuestionPage';
import OAuthSuccess from './pages/OAuthSuccess';

function MainApp() {
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy token từ query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      try {
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', token);

        // Giải mã token để lấy thông tin role
        const decoded = jwtDecode(token);
        const role = decoded?.role;

        // Xóa query parameter khỏi URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Điều hướng dựa trên role
        if (role === 'manager') {
          navigate('/manager', { replace: true });
        } else if (role === 'user') {
          navigate('/user', { replace: true });
        } else {
          navigate('/', { replace: true });
          alert('Vai trò không hợp lệ. Vui lòng thử lại!');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        alert('Đăng nhập thất bại. Vui lòng thử lại!');
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/user" element={<UserPage />} />
      <Route path="/manager" element={<ManagerPage />}>
        <Route path="users" element={<UserResponsePage />} />
        <Route path="survey" element={<SurveyPage />} />
        <Route path="question" element={<QuestionPage />} />
      </Route>
      <Route path="/user-responses" element={<UserResponses />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}