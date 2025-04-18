import React, { useEffect, useState } from "react";
import { Survey } from "survey-react-ui";
import { Model } from "survey-core";
import "survey-core/defaultV2.min.css";
import { useNavigate } from "react-router-dom";

const SurveyComponent = ({ surveyId }) => {
  const [surveyModel, setSurveyModel] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const getAccessToken = () => localStorage.getItem("accessToken");

  const submitSurvey = async (answers) => {
    const token = getAccessToken();
    if (!token) {
      alert("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_BACK_END_URL}/responses/new-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          surveyId,
          answers,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login");
        }
        throw new Error(`Lỗi khi gửi khảo sát: ${errorData.message || res.statusText}`);
      }

      await res.json();
      setSubmitted(true);
    } catch (error) {
      console.error("Lỗi submit:", error);
      alert(`Đã có lỗi xảy ra khi gửi khảo sát: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!surveyId) {
      alert("ID khảo sát không hợp lệ!");
      return;
    }

    const fetchQuestions = async () => {
      const token = getAccessToken();
      if (!token) {
        alert("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACK_END_URL}/questions/get-question?surveyId=${surveyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!data || data.length === 0) {
          console.error("Không có câu hỏi nào cho khảo sát này.");
          return;
        }

        const elements = data.map((q) => ({
          type: q.type === "multiple" ? "checkbox" : q.type === "single" ? "radiogroup" : q.type,
          name: q._id,
          title: q.title,
          isRequired: true,
          choices: q.options?.length > 0 ? q.options : undefined,
        }));

        const surveyJson = {
          title: data[0]?.survey?.data || "Khảo sát",
          description: data[0]?.survey?.description || "",
          pages: [{ elements }],
        };

        const model = new Model(surveyJson);

        model.onComplete.add(async (sender) => {
          const result = sender.data;

          const answers = Object.entries(result).map(([questionId, answer]) => ({
            questionId,
            answer: Array.isArray(answer) ? answer.join(", ") : answer,
          }));

          await submitSurvey(answers);
        });

        setSurveyModel(model);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu khảo sát:", error);
        alert("Không thể tải khảo sát. Vui lòng thử lại.");
      }
    };

    fetchQuestions();
  }, [surveyId, navigate]);

  return (
    <div>
      {submitted ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>✅ Cảm ơn bạn đã hoàn thành khảo sát!</h2>
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => navigate("/user-responses")}
          >
            👉 Xem câu trả lời của bạn
          </button>
        </div>
      ) : surveyModel ? (
        <Survey model={surveyModel} />
      ) : (
        <p>Đang tải khảo sát...</p>
      )}
    </div>
  );
};

export default SurveyComponent;