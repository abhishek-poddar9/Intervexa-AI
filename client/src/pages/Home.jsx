import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import AuthModel from '../components/AuthModel';
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/Footer';

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedMode, setSelectedMode] = useState("technical");
  const navigate = useNavigate();

  const stepData = [
    {
      icon: <BsRobot size={24} />,
      step: "STEP 1",
      title: "Role & Experience Selection",
      desc: "Choose your target role and experience level to get personalized interview questions."
    },
    {
      icon: <BsMic size={24} />,
      step: "STEP 2",
      title: "Smart Voice Interview",
      desc: "Practice with AI-powered follow-up questions that adapt to your answers in real time."
    },
    {
      icon: <BsClock size={24} />,
      step: "STEP 3",
      title: "Timer Based Simulation",
      desc: "Experience realistic interview pressure with countdown-based practice sessions."
    }
  ];

  const capabilityData = [
    {
      image: evalImg,
      icon: <BsBarChart size={20} />,
      title: "AI Answer Evaluation",
      desc: "Analyze answer quality based on clarity, communication, technical depth, and confidence."
    },
    {
      image: resumeImg,
      icon: <BsFileEarmarkText size={20} />,
      title: "Resume Based Interview",
      desc: "Generate personalized interview questions from your uploaded resume, skills, and projects."
    },
    {
      image: pdfImg,
      icon: <BsFileEarmarkText size={20} />,
      title: "Downloadable PDF Report",
      desc: "Get a detailed report with strengths, weak areas, and actionable suggestions for improvement."
    },
    {
      image: analyticsImg,
      icon: <BsBarChart size={20} />,
      title: "History & Analytics",
      desc: "Track your past sessions, monitor progress, and review topic-wise interview performance."
    }
  ];

  const modeData = [
    {
      mode: "hr",
      img: hrImg,
      title: "HR Interview Mode",
      desc: "Practice behavioral, HR, and communication-focused interview questions."
    },
    {
      mode: "technical",
      img: techImg,
      title: "Technical Mode",
      desc: "Prepare for role-specific technical interviews with focused question sets."
    },
    {
      mode: "confidence",
      img: confidenceImg,
      title: "Confidence Detection",
      desc: "Get basic speaking-confidence insights from your pace, fluency, and response flow."
    },
    {
      mode: "credits",
      img: creditImg,
      title: "Credits System",
      desc: "Unlock premium interview sessions and advanced reports with credits."
    }
  ];

  const handleStartInterview = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    navigate("/interview", { state: { selectedMode } });
  };

  const handleViewHistory = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }
    navigate("/history");
  };

  const handleModeClick = (mode) => {
    if (mode === "credits") {
      navigate("/pricing");
      return;
    }

    setSelectedMode(mode);

    if (!userData) {
      setShowAuth(true);
      return;
    }

    navigate("/interview", { state: { selectedMode: mode } });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.14),_transparent_26%),linear-gradient(to_bottom_right,_#f8fafc,_#f0fdf4,_#eff6ff)]">
      
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-green-300/20 blur-3xl"></div>
        <div className="absolute top-24 right-10 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="flex-1 px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">

            <div className="flex justify-center mb-6">
              <div className="backdrop-blur-xl bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-gray-700 text-sm px-5 py-2.5 rounded-full flex items-center gap-2">
                <HiSparkles size={16} className="text-green-600" />
                AI Powered Smart Interview Platform
              </div>
            </div>

            <div className="text-center mb-24">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-5xl mx-auto text-gray-900"
              >
                Practice Interviews with{" "}
                <span className="relative inline-block mt-3 md:mt-0 md:ml-3">
                  <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                    AI Intelligence
                  </span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-gray-600 mt-6 max-w-3xl mx-auto text-base md:text-xl leading-8"
              >
                Role-based mock interviews with smart follow-ups, adaptive difficulty,
                resume-aware question generation, and real-time performance evaluation.
              </motion.p>

              <p className="mt-6 text-sm md:text-base text-gray-600">
                Selected Mode:{" "}
                <span className="font-semibold capitalize text-green-600">
                  {selectedMode}
                </span>
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <motion.button
                  onClick={handleStartInterview}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-3.5 rounded-full text-white font-medium bg-gradient-to-r from-gray-900 via-black to-gray-800 shadow-[0_12px_30px_rgba(0,0,0,0.18)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-all duration-300"
                >
                  Start Interview
                </motion.button>

                <motion.button
                  onClick={handleViewHistory}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-3.5 rounded-full border border-white/70 bg-white/70 backdrop-blur-xl text-gray-800 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:bg-white transition-all duration-300"
                >
                  View History
                </motion.button>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {[
                  "AI Follow-up Questions",
                  "Role-Based Practice",
                  "Resume-Based Interviews",
                  "Performance Reports",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-white/70 text-sm text-gray-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-10 mb-24">
              {stepData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 + index * 0.2 }}
                  whileHover={{ rotate: 0, scale: 1.06 }}
                  viewport={{ once: true }}
                  className={`
                    relative rounded-[32px] border border-white/70 bg-white/75 backdrop-blur-xl
                    p-10 w-80 max-w-[90%] shadow-[0_12px_40px_rgba(0,0,0,0.08)]
                    hover:shadow-[0_20px_55px_rgba(34,197,94,0.16)] transition-all duration-300
                    ${index === 0 ? "rotate-[-4deg]" : ""}
                    ${index === 1 ? "rotate-[3deg] md:-mt-6" : ""}
                    ${index === 2 ? "rotate-[-3deg]" : ""}
                  `}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-white to-green-50 border border-green-200 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_12px_30px_rgba(34,197,94,0.18)]">
                    {item.icon}
                  </div>

                  <div className="pt-10 text-center">
                    <div className="text-xs text-green-600 font-semibold mb-2 tracking-wider">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-3 text-lg text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mb-24">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900"
              >
                Advanced AI{" "}
                <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  Capabilities
                </span>
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-10">
                {capabilityData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    viewport={{ once: true }}
                    className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-[30px] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-full md:w-1/2 flex justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-auto object-contain max-h-64"
                        />
                      </div>

                      <div className="w-full md:w-1/2">
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                          {item.icon}
                        </div>
                        <h3 className="font-semibold mb-3 text-xl text-gray-900">{item.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mb-24">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900"
              >
                Multiple Interview{" "}
                <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  Modes
                </span>
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-10">
                {modeData.map((mode, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                    viewport={{ once: true }}
                    onClick={() => handleModeClick(mode.mode)}
                    className={`bg-white/80 backdrop-blur-xl border rounded-[30px] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)] transition-all duration-300 cursor-pointer ${
                      selectedMode === mode.mode
                        ? "border-green-400 ring-2 ring-green-200"
                        : "border-white/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="w-1/2">
                        <h3 className="font-semibold text-xl mb-3 text-gray-900">{mode.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{mode.desc}</p>

                        {mode.mode !== "credits" && (
                          <p className="mt-4 text-sm font-medium text-green-600">
                            Click to start in {mode.title}
                          </p>
                        )}

                        {mode.mode === "credits" && (
                          <p className="mt-4 text-sm font-medium text-blue-600">
                            Click to view pricing and credits
                          </p>
                        )}
                      </div>

                      <div className="w-1/2 flex justify-end">
                        <img
                          src={mode.img}
                          alt={mode.title}
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-[36px] border border-white/70 bg-gradient-to-r from-white/80 via-green-50/80 to-blue-50/80 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,0.08)] px-8 md:px-14 py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Ready to improve your interview confidence?
              </h2>

              <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-base md:text-lg leading-8">
                Practice role-based interviews, receive AI-powered feedback,
                and track your growth with detailed performance reports.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button
                  onClick={handleStartInterview}
                  className="px-8 py-3.5 rounded-full text-white font-medium bg-gradient-to-r from-green-600 via-emerald-500 to-blue-500 shadow-[0_12px_30px_rgba(16,185,129,0.25)] hover:scale-[1.02] transition-all duration-300"
                >
                  Start Free Practice
                </button>

                <button
                  onClick={() => navigate("/pricing")}
                  className="px-8 py-3.5 rounded-full border border-white/70 bg-white/80 text-gray-800 shadow-sm hover:bg-white transition-all duration-300"
                >
                  Explore Pricing
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

        <Footer />
      </div>
    </div>
  );
}

export default Home;