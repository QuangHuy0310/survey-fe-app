import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const QuestionPage = () => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loadingSurveys, setLoadingSurveys] = useState(true);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', type: '', options: '' });
    const [formError, setFormError] = useState(null);

    // Lấy token từ localStorage và trả về header Authorization
    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
    };

    // Lấy danh sách khảo sát
    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BACK_END_URL + '/surveys/get-survey', {
                    headers: getAuthHeader()
                });
                if (!response.ok) {
                    throw new Error('Lỗi khi lấy danh sách khảo sát');
                }
                const data = await response.json();
                setSurveys(data.item || []);
                setLoadingSurveys(false);
            } catch (err) {
                setError(err.message);
                setLoadingSurveys(false);
            }
        };

        fetchSurveys();
    }, []);

    // Lấy danh sách câu hỏi khi chọn khảo sát
    useEffect(() => {
        if (!selectedSurveyId) {
            setQuestions([]);
            return;
        }

        const fetchQuestions = async () => {
            setLoadingQuestions(true);
            try {
                const response = await fetch(
                    process.env.REACT_APP_BACK_END_URL`/questions/get-question?surveyId=${selectedSurveyId}`,
                    { headers: getAuthHeader() }
                );
                if (!response.ok) {
                    throw new Error('Lỗi khi lấy danh sách câu hỏi');
                }
                const data = await response.json();
                setQuestions(Array.isArray(data) ? data : []);
                setLoadingQuestions(false);
            } catch (err) {
                setError(err.message);
                setLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, [selectedSurveyId]);

    // Xử lý thay đổi lựa chọn khảo sát
    const handleSurveyChange = (e) => {
        setSelectedSurveyId(e.target.value);
        setError(null); // Xóa lỗi khi chọn khảo sát mới
    };

    // Xử lý thay đổi input trong form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý submit form tạo câu hỏi
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!formData.title || !formData.type || !selectedSurveyId) {
            setFormError('Vui lòng nhập đầy đủ tiêu đề, loại câu hỏi và chọn khảo sát');
            return;
        }

        try {
            const options = formData.options
                ? formData.options.split(',').map((opt) => opt.trim()).filter((opt) => opt)
                : [];

            const response = await fetch(`${process.env.REACT_APP_BACK_END_URL}/questions/new-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()  // Thêm Authorization header
                },
                body: JSON.stringify({
                    surveyId: selectedSurveyId,
                    title: formData.title,
                    type: formData.type,
                    options,
                }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi tạo câu hỏi');
            }

            // Đóng modal và reset form
            setShowModal(false);
            setFormData({ title: '', type: '', options: '' });

            // Làm mới danh sách câu hỏi
            const updatedResponse = await fetch(
                process.env.REACT_APP_BACK_END_URL`/questions/get-question?surveyId=${selectedSurveyId}`,
                { headers: getAuthHeader() }
            );
            if (updatedResponse.ok) {
                const updatedData = await updatedResponse.json();
                setQuestions(Array.isArray(updatedData) ? updatedData : []);
            }
        } catch (err) {
            setFormError(err.message);
        }
    };

    if (loadingSurveys) {
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
                <h2>Danh sách câu hỏi</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                    disabled={!selectedSurveyId} // Vô hiệu hóa nếu chưa chọn khảo sát
                >
                    Tạo câu hỏi
                </button>
            </div>

            {/* Thanh select khảo sát */}
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

            {/* Bảng câu hỏi */}
            {selectedSurveyId ? (
                loadingQuestions ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải câu hỏi...</span>
                        </div>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="alert alert-info text-center" role="alert">
                        Không có câu hỏi nào cho khảo sát này.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Tiêu đề câu hỏi</th>
                                    <th scope="col">Loại</th>
                                    <th scope="col">Tùy chọn</th>
                                    <th scope="col">Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((question) => (
                                    <tr key={question._id}>
                                        <td>{question._id}</td>
                                        <td>{question.title}</td>
                                        <td>{question.type}</td>
                                        <td>
                                            {question.options && question.options.length > 0
                                                ? question.options.join(', ')
                                                : 'Không có'}
                                        </td>
                                        <td>
                                            {new Date(question.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="alert alert-info text-center" role="alert">
                    Vui lòng chọn một khảo sát để xem câu hỏi.
                </div>
            )}

            {/* Modal tạo câu hỏi */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content" style={{ backgroundColor: '#FFC107' }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Tạo câu hỏi mới</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ title: '', type: '', options: '' });
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
                                        <label htmlFor="title" className="form-label">
                                            Tiêu đề câu hỏi
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tiêu đề câu hỏi"
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="type" className="form-label">
                                            Loại câu hỏi
                                        </label>
                                        <select
                                            className="form-select"
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Chọn loại</option>
                                            <option value="text">Text</option>
                                            <option value="radiogroup">Radiogroup</option>
                                            <option value="rating">Rating</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="options" className="form-label">
                                            Tùy chọn (phân cách bằng dấu phẩy)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="options"
                                            name="options"
                                            value={formData.options}
                                            onChange={handleInputChange}
                                            placeholder="Ví dụ: JavaScript, Python, Go"
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ title: '', type: '', options: '' });
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

export default QuestionPage;
