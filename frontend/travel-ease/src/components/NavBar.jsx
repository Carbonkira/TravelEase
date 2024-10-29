import React from 'react';
import { useNavigate } from "react-router-dom";
import LOGO from "../assets/images/logo.svg";
import ProfileInfo from './Cards/ProfileInfo';

const NavBar = ({ userInfo }) => {
  const navigate = useNavigate();

  // Logout function
  const onLogOut = () => {
    localStorage.clear(); // Clear any user data from storage
    navigate("/login");   // Redirect to login page
  };

  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow sticky top-0 z-10'>
      <img src={LOGO} alt="travel ease" className='h-9'/>
      <ProfileInfo userInfo={userInfo} onLogOut={onLogOut}/>
    </div>
  );
};

export default NavBar;
