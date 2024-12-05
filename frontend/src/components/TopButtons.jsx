import React from 'react';
import { IoHomeOutline } from 'react-icons/io5';
import { IoRefresh } from 'react-icons/io5';
import { Navigate, useNavigate } from 'react-router-dom';
const TopButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between p-4">
      <button
        onClick={() => navigate('/homepage')}
        className="p-3 rounded-full backdrop-blur-sm bg-white/10 text-white border border-white/20 
        transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-lg 
        active:scale-95"
      >
        <IoHomeOutline size={24} />
      </button>
      <button
        onClick={() => navigate('/recent-scans')}
        className="p-3 rounded-full backdrop-blur-sm bg-white/10 text-white border border-white/20 
        transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:shadow-lg 
        active:scale-95"
      >
        <IoRefresh size={24} />
      </button>
    </div>
  );
};

export default TopButtons;