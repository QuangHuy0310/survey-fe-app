import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import SurveyComponent from '../components/SurveyComponent';

const UserPage = () => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy danh sách khảo sát
    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const token = localStorage.getItem('accessToken'); // Lấy accessToken từ localStorage
    
                const response = await fetch(process.env.REACT_APP_BACK_END_URL+'/surveys/get-survey', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Thêm Bearer token vào header
                        'Content-Type': 'application/json'
                    }
                });
    
                if (!response.ok) {
                    throw new Error('Lỗi khi lấy danh sách khảo sát');
                }
    
                const data = await response.json();
                setSurveys(data.item || []);
    
                if (data.item && data.item.length > 0) {
                    setSelectedSurveyId(data.item[0]._id);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
    
        fetchSurveys();
    }, []);

    // Xử lý thay đổi lựa chọn khảo sát
    const handleSurveyChange = (e) => {
        setSelectedSurveyId(e.target.value);
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
            <h2 className="mb-4 text-center">Quản lý khảo sát</h2>
            <div className="mb-4">
                <label htmlFor="surveySelect" className="form-label fw-bold">
                    Chọn khảo sát
                </label>
                <select
                    id="surveySelect"
                    className="form-select"
                    value={selectedSurveyId}
                    onChange={handleSurveyChange}
                >
                    <option value="">-- Chọn một khảo sát --</option>
                    {surveys.map((survey) => (
                        <option key={survey._id} value={survey._id}>
                            {survey.data}
                        </option>
                    ))}
                </select>
            </div>

            {selectedSurveyId ? (
                <SurveyComponent surveyId={selectedSurveyId} />
            ) : (
                <div className="alert alert-info text-center" role="alert">
                    Vui lòng chọn một khảo sát để xem chi tiết.
                </div>
            )}
        </div>
    );
};

export default UserPage;