import express from "express";
import multer from "multer";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  analyzeResume,
  finishInterview,
  generateQuestion,
  getInterviewReport,
  getMyInterviews,
  submitAnswer,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

const uploadResumeMiddleware = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        message: error.message || "Resume upload failed.",
      });
    }

    next();
  });
};

interviewRouter.post("/resume", isAuth, uploadResumeMiddleware, analyzeResume);
interviewRouter.post("/generate-questions", isAuth, generateQuestion);
interviewRouter.post("/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/finish", isAuth, finishInterview);

interviewRouter.get("/get-interview", isAuth, getMyInterviews);
interviewRouter.get("/report/:id", isAuth, getInterviewReport);

export default interviewRouter;