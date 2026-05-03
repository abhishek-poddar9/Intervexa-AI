import React, { useEffect, useRef, useState } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowRight } from "react-icons/bs";

function Step2Interview({ interviewData, onFinish, selectedMode }) {
  const { interviewId, questions, userName, mode } = interviewData;
  const activeMode = mode || selectedMode || "Technical";

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isQuestionActive, setIsQuestionActive] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  const getModeBadgeClasses = () => {
    if (activeMode === "HR") {
      return "bg-blue-50 text-blue-700 border border-blue-200";
    }

    if (activeMode === "Confidence") {
      return "bg-purple-50 text-purple-700 border border-purple-200";
    }

    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log("Mic already started or not allowed:", error);
      }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Mic stop error:", error);
      }
    }
  };

  const speakText = (text, startMicAfterSpeech = false) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();

        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }

        setIsAIPlaying(false);

        setTimeout(() => {
          setSubtitle("");

          if (startMicAfterSpeech && isMicOn) {
            startMic();
          }

          resolve();
        }, 300);
      };

      utterance.onerror = () => {
        videoRef.current?.pause();

        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }

        setIsAIPlaying(false);
        setSubtitle("");
        resolve();
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) return;

    let cancelled = false;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        if (cancelled) return;

        if (activeMode === "HR") {
          await speakText(
            "This is your HR interview round. Answer naturally and focus on communication, clarity, and professional behavior."
          );
        } else if (activeMode === "Confidence") {
          await speakText(
            "This is your confidence interview round. Speak clearly, take your time, and express your thoughts with confidence."
          );
        } else {
          await speakText(
            "This is your technical interview round. Focus on clarity, practical thinking, and technical understanding."
          );
        }

        if (cancelled) return;

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        if (cancelled) return;

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        setIsQuestionActive(false);
        setTimeLeft(currentQuestion.timeLimit || 60);

        await new Promise((r) => setTimeout(r, 800));

        if (cancelled) return;

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        if (cancelled) return;

        await speakText(currentQuestion.question, true);

        if (cancelled) return;

        setIsQuestionActive(true);
      }
    };

    runIntro();

    return () => {
      cancelled = true;
    };
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (!isQuestionActive) return;
    if (isSubmitting || feedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentQuestion, isQuestionActive, isSubmitting, feedback]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
      setIsQuestionActive(false);
    }
  }, [currentIndex, isIntroPhase, currentQuestion]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }

    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;

    setIsQuestionActive(false);
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true }
      );

      setFeedback(result.data.feedback);
      setIsSubmitting(false);

      await speakText(result.data.feedback);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setIsQuestionActive(false);
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex((prev) => prev + 1);
  };

  const finishInterview = async () => {
    setIsQuestionActive(false);
    stopMic();
    setIsMicOn(false);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );

      console.log(result.data);

      onFinish({
        ...result.data,
        mode: activeMode,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (!isQuestionActive) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft, isQuestionActive]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[1400px] min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          <div className="w-full max-w-md flex items-center justify-between gap-3">
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getModeBadgeClasses()}`}
            >
              {activeMode} Mode
            </div>

            <div className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm border border-gray-200">
              {userName || "Candidate"}
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>

              {isAIPlaying ? (
                <span className="text-sm font-semibold text-emerald-600">
                  AI Speaking
                </span>
              ) : isQuestionActive ? (
                <span className="text-sm font-semibold text-blue-600">
                  Answer Now
                </span>
              ) : (
                <span className="text-sm font-semibold text-gray-400">
                  Waiting
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit}
              />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-400">
                  Current Question
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-600">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-400">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-600">
              AI Smart Interview
            </h2>

            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${getModeBadgeClasses()}`}
            >
              Active: {activeMode}
            </div>
          </div>

          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>

              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>
            </div>
          )}

          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            disabled={!isQuestionActive || isSubmitting || !!feedback}
            className="flex-1 min-h-[220px] bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          />

          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                disabled={!isQuestionActive || isSubmitting}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isMicOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} />
                )}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting || !isQuestionActive}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                {currentIndex + 1 >= questions.length
                  ? "Finish Interview"
                  : "Next Question"}
                <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
