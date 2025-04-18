import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const SurveyPage = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ data: '', description: '' });
    const [formError, setFormError] = useState(null);

    // Lấy Bearer token từ localStorage
    const token = localStorage.getItem('accessToken'); // Hoặc lấy từ nơi bạn lưu trữ token

    // Lấy danh sách khảo sát
    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BACK_END_URL +'/surveys/get-survey', {
                    headers: {
                        'Authorization': `Bearer ${token}` // Thêm Bearer token vào header
                    }
                });
                if (!response.ok) {
                    throw new Error('Lỗi khi lấy danh sách khảo sát');
                }
                const data = await response.json();
                setSurveys(data.item || []);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSurveys();
    }, [token]);

    // Xử lý thay đổi input trong form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý submit form tạo khảo sát
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!formData.data || !formData.description) {
            setFormError('Vui lòng nhập đầy đủ nội dung và mô tả');
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_BACK_END_URL +'/surveys/new-survey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Thêm Bearer token vào header
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi tạo khảo sát');
            }

            // Đóng modal và reset form
            setShowModal(false);
            setFormData({ data: '', description: '' });

            // Làm mới danh sách khảo sát
            const updatedResponse = await fetch(process.env.REACT_APP_BACK_END_URL +'/surveys/get-survey', {
                headers: {
                    'Authorization': `Bearer ${token}` // Thêm Bearer token vào header
                }
            });
            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setSurveys(updatedData.item || []);
            }
        } catch (err) {
            setFormError(err.message);
        }
    };

    // Xử lý xóa khảo sát
    const handleDeleteSurvey = async (id) => {
        if (window.confirm('Bạn chắc chắn muốn xóa khảo sát này?')) {
            try {
                const response = await fetch(process.env.REACT_APP_BACK_END_URL`/surveys/remove?id=${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}` // Thêm Bearer token vào header
                    }
                });

                if (!response.ok) {
                    throw new Error('Lỗi khi xóa khảo sát');
                }

                // Cập nhật lại danh sách khảo sát
                setSurveys((prevSurveys) => prevSurveys.filter((survey) => survey._id !== id));
            } catch (err) {
                alert('Lỗi: ' + err.message);
            }
        }
    };

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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Danh sách khảo sát</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    Tạo khảo sát
                </button>
            </div>

            {surveys.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                    Không có khảo sát nào.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Nội dung</th>
                                <th scope="col">Mô tả</th>
                                <th scope="col">Ngày tạo</th>
                                <th scope="col">Ngày cập nhật</th>
                                <th scope="col">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {surveys.map((survey) => (
                                <tr key={survey._id}>
                                    <td>{survey._id}</td>
                                    <td>{survey.data}</td>
                                    <td>{survey.description}</td>
                                    <td>{new Date(survey.createdAt).toLocaleString('vi-VN')}</td>
                                    <td>{new Date(survey.updatedAt).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteSurvey(survey._id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal tạo khảo sát */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Tạo khảo sát mới</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ data: '', description: '' });
                                        setFormError(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {formError && (
                                    <div className="alert alert-danger" role="alert">
                                        {formError}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="data" className="form-label">
                                            Nội dung
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="data"
                                            name="data"
                                            value={formData.data}
                                            onChange={handleInputChange}
                                            placeholder="Nhập nội dung khảo sát"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">
                                            Mô tả
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Nhập mô tả khảo sát"
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ data: '', description: '' });
                                        setFormError(null);
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                >
                                    Tạo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SurveyPage;
