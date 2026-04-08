import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center px-4 pt-6 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl rounded-[28px] border border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.08)] px-8 py-4 flex justify-between items-center relative"
      >
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
       <h1 className="font-bold hidden md:flex items-center gap-3 text-xl 
bg-gradient-to-r from-gray-900 via-green-600 to-blue-600 
bg-clip-text text-transparent">

  <img
    src="./Image.png"
    alt="logo"
    className="w-8 h-8"
  />

  Intervexa AI
</h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6 relative">
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-white/80 border border-white/70 px-4 py-2 rounded-full text-md hover:bg-white shadow-sm transition-all duration-300"
            >
              <BsCoin size={20} />
              {userData?.credits || 0}
            </button>

            {showCreditPopup && (
              <div className="absolute right-[-50px] mt-3 w-64 bg-white/95 backdrop-blur-xl shadow-xl border border-white/70 rounded-2xl p-5 z-50">
                <p className="text-sm text-gray-600 mb-4">
                  Need more credits to continue your interview practice?
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-2.5 rounded-xl text-sm shadow-md"
                >
                  Buy More Credits
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-10 h-10 bg-gradient-to-br from-black via-gray-900 to-green-700 text-white rounded-full flex items-center justify-center font-semibold shadow-md"
            >
              {userData ? userData?.name?.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-xl shadow-xl border border-white/70 rounded-2xl p-4 z-50">
                <p className="text-md text-blue-600 font-medium mb-2">{userData?.name}</p>

                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm py-2 hover:text-black text-gray-600 transition"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Navbar;
