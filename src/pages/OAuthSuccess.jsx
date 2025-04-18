// pages/OAuthSuccess.jsx
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const { role, id, sub } = decoded;

                const user = {
                    id,
                    role,
                    googleId: sub,
                };

                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(user));

                alert('Đăng nhập Google thành công!');

                // Xóa token khỏi URL cho sạch
                window.history.replaceState({}, document.title, window.location.pathname);

                // Điều hướng
                if (role === 'manager') {
                    navigate('/manager');
                } else {
                    navigate('/user');
                }
            } catch (err) {
                console.error('Decode token error:', err);
                alert('Đăng nhập Google thất bại. Vui lòng thử lại!');
                navigate('/login');
            }
        } else {
            alert('Không tìm thấy token từ Google.');
            navigate('/login');
        }
    }, [location, navigate]);

    return <div>Đang xử lý đăng nhập Google...</div>;
};

export default OAuthSuccess;
