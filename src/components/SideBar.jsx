import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SideBar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const handleLinkClick = (e) => {
    // Ngăn chặn bất kỳ hành vi không mong muốn
    e.stopPropagation();
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
   
      <div className="sidebar-items">
        <div className="sidebar-item" onClick={handleLinkClick}>
          <Link to="users">User</Link>
        </div>
        <div className="sidebar-item" onClick={handleLinkClick}>
          <Link to="survey">Survey</Link>
        </div>
        <div className="sidebar-item" onClick={handleLinkClick}>
          <Link to="question">Question</Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;