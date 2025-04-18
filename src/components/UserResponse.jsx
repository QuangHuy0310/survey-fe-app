import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const UserResponses = ({ userId: propUserId }) => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getUserIdFromToken = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.userId || decoded.id || decoded.sub;
        } catch (err) {
            console.error("Lỗi decode token:", err);
            return null;
        }
    };

    useEffect(() => {
        const fetchResponses = async () => {
            const userId = propUserId || getUserIdFromToken(); // Ưu tiên props
            if (!userId) {
                setError("Không tìm thấy người dùng. Vui lòng đăng nhập.");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("accessToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            try {
                const res = await fetch(
                    `http://localhost:3000/responses/by-user?userId=${userId}`,
                    { headers }
                );
                if (!res.ok) throw new Error("Không thể lấy dữ liệu câu trả lời.");

                const data = await res.json();
                setResponses(data);
            } catch (error) {
                setError("Đã có lỗi xảy ra khi lấy câu trả lời.");
                console.error("Lỗi khi lấy câu trả lời:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();
    }, [propUserId]);

    if (loading) return <div>Đang tải câu trả lời...</div>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>Câu trả lời của {propUserId ? `người dùng: ${propUserId}` : 'bạn'}</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {responses.length === 0 ? (
                <p>Chưa có câu trả lời nào.</p>
            ) : (
                responses.map((response) => (
                    <div key={response._id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12, borderRadius: 8 }}>
                        <h4>📝 Mã khảo sát: {response.surveyId}</h4>
                        <p>🕓 Ngày gửi: {new Date(response.createdAt).toLocaleString()}</p>

                        <ul>
                            {response.answers.map((ans) => (
                                <li key={ans._id}>
                                    <div>
                                        <strong>Câu hỏi:</strong> {ans.title}
                                    </div>
                                    <br />
                                    <strong>Trả lời:</strong> {ans.answer}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
};

export default UserResponses;
