import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/SideBar';
import UserResponsePage from './UserResponsePage';
import SurveyPage from './SurveyPage';
import QuestionPage from './QuestionPage';
import '../styles/ManagerPage.css';

const ManagerPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="manager-page">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Routes>
          <Route path="users" element={<UserResponsePage />} />
          <Route path="survey" element={<SurveyPage />} />
          <Route path="question" element={<QuestionPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerPage;