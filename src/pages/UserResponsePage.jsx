import React, { useEffect, useState } from 'react';
import '../styles/UserCardStyles.css'; // Import your existing CSS file
import UserResponse from '../components/UserResponse';

const UserResponsePage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseCounts, setResponseCounts] = useState({});

    // Lấy token từ localStorage
    const getAccessToken = () => localStorage.getItem('accessToken');

    // Lấy danh sách phản hồi và nhóm theo userId
    useEffect(() => {
        const fetchResponses = async () => {
            const token = getAccessToken(); // Lấy Bearer token
            if (!token) {
                alert('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/responses/users', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Thêm Bearer token vào header
                    },
                });

                if (!response.ok) {
                    throw new Error('Lỗi khi lấy danh sách phản hồi');
                }

                const data = await response.json();

                // Đếm số phản hồi cho mỗi userId
                const responseCounts = data.reduce((acc, item) => {
                    acc[item.userId] = (acc[item.userId] || 0) + 1;
                    return acc;
                }, {});

                // Tạo danh sách người dùng duy nhất
                const uniqueUsers = Array.from(
                    new Map(
                        data.map((item) => [
                            item.userId,
                            { userId: item.userId, email: `User-${item.userId.slice(0, 8)}` },
                        ])
                    ).values()
                );

                setUsers(uniqueUsers);
                setResponseCounts(responseCounts);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Lỗi khi fetch user:', err);
            }
        };

        fetchResponses();
    }, []);

    // Hàm đóng modal
    const closeModal = () => {
        setSelectedUserId(null);
    };

    // Lắng nghe phím Esc để đóng modal
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger text-center mx-auto my-4 w-50" role="alert">
                Lỗi: {error}
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="mb-4 text-center">Danh sách người dùng</h2>
            <div className="row g-4">
                {users.length === 0 ? (
                    <div className="alert alert-info text-center" role="alert">
                        Không có người dùng nào.
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.userId} className="col-md-4">
                            <div className="card user-card shadow-sm border-0">
                                <div className="card-body">
                                    <h5 className="card-title">{user.email}</h5>
                                    <p className="card-text">
                                        <strong>ID:</strong> {user.userId}
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setSelectedUserId(user.userId)}
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal hiển thị UserResponse */}
            {selectedUserId && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ backgroundColor: '' }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết người dùng</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <UserResponse userId={selectedUserId} />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserResponsePage;
