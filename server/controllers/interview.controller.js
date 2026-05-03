import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

const extractJsonFromAI = (aiResponse) => {
  if (!aiResponse) {
    throw new Error("AI returned empty response.");
  }

  const responseText =
    typeof aiResponse === "string" ? aiResponse : JSON.stringify(aiResponse);

  const cleanedResponse = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI response was not valid JSON.");
    }

    return JSON.parse(jsonMatch[0]);
  }
};

export const analyzeResume = async (req, res) => {
  let filepath;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required.",
      });
    }

    filepath = req.file.path;

    let fileBuffer;

    if (req.file.buffer) {
      fileBuffer = req.file.buffer;
    } else if (filepath) {
      fileBuffer = await fs.promises.readFile(filepath);
    } else {
      return res.status(400).json({
        message: "Unable to read uploaded resume file.",
      });
    }

    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
      disableWorker: true,
    }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    if (!resumeText) {
      return res.status(400).json({
        message:
          "Could not extract text from this PDF. Please upload a text-based resume PDF.",
      });
    }

    const resumeTextForAI = resumeText.slice(0, 12000);

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return ONLY valid JSON.
Do not write markdown.
Do not use code block.
Do not add explanation.

Format:
{
  "name": "string",
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`,
      },
      {
        role: "user",
        content: resumeTextForAI,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = extractJsonFromAI(aiResponse);

    return res.status(200).json({
      name: parsed.name || "",
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      resumeText,
    });
  } catch (error) {
    console.error("Analyze Resume Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to analyze resume.",
    });
  } finally {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
};

export const generateQuestion = async (req, res) => {
  try {
    let {
      role,
      experience,
      mode,
      resumeText,
      projects,
      skills,
      candidateName,
    } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();
    candidateName = candidateName?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: "Role, Experience and Mode are required.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required.",
      });
    }

    const projectText =
      Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

    const skillsText =
      Array.isArray(skills) && skills.length ? skills.join(", ") : "None";

    const safeResume = resumeText?.trim() || "None";

    const modeValue = mode.toLowerCase().trim();

    const normalizedMode =
      modeValue === "hr"
        ? "HR"
        : modeValue === "confidence" || modeValue === "confidence detection"
        ? "Confidence"
        : "Technical";

    const userPrompt = `
CandidateName: ${candidateName || user.name}
Role: ${role}
Experience: ${experience}
InterviewMode: ${normalizedMode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}
`;

    let modeInstruction = "";

    if (normalizedMode === "HR") {
      modeInstruction = `
Generate HR and behavioral interview questions.

Focus on:
- communication
- teamwork
- strengths and weaknesses
- conflict handling
- adaptability
- leadership
- professional attitude
- workplace situations

Rules:
- Avoid deep technical questions
- Ask practical HR-style questions
- Questions should sound like a real HR interviewer
`;
    } else if (normalizedMode === "Confidence") {
      modeInstruction = `
Generate confidence and communication focused interview questions.

Focus on:
- self introduction
- clarity of speaking
- confidence in expression
- fluency
- structured speaking
- explaining ideas clearly
- personal experiences
- communication in interview situations

Strict Rules for Confidence Mode:
- Ask only open-ended questions
- Questions should encourage longer spoken answers
- Avoid deep technical questions
- Avoid coding, API, database, or system design questions
- Keep questions natural and human-like
- Questions should test speaking confidence more than technical knowledge

Examples of style:
- Tell me about yourself.
- Explain one of your projects in simple words.
- What are your strengths as a developer?
- Describe a challenge you faced and how you handled it.
- Why do you think you are a good fit for this role?
`;
    } else {
      modeInstruction = `
Generate technical interview questions.

Focus on:
- role-specific concepts
- practical problem-solving
- tools and technologies
- projects
- technical decision-making
- implementation understanding

Rules:
- Questions should feel like a real technical interview
- Use resume, skills, and projects for personalization
`;
    }

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy
Question 2 → easy
Question 3 → medium
Question 4 → medium
Question 5 → hard

${modeInstruction}

Make questions based on the candidate's role, experience, interview mode, projects, skills, and resume details.

Special handling:
- If interview mode is HR, ask HR and behavioral questions.
- If interview mode is Confidence, ask confidence and communication focused questions only.
- If interview mode is Technical, ask technical and project-based questions.
`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response.",
      });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({
        message: "AI failed to generate questions.",
      });
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode: normalizedMode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit:
          normalizedMode === "Confidence"
            ? [90, 90, 120, 120, 150][index]
            : [60, 60, 90, 90, 120][index],
      })),
    });

    return res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: candidateName?.trim() || user.name,
      mode: normalizedMode,
      questions: interview.questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to create interview ${error}`,
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    const question = interview.questions[questionIndex];

    if (!question) {
      return res.status(400).json({
        message: "Invalid question index.",
      });
    }

    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
      });
    }

    let evaluationInstruction = "";

    if (interview.mode === "HR") {
      evaluationInstruction = `
Evaluate more carefully for HR interviews.
Focus on confidence, communication, relevance, professionalism, clarity, structured thinking, and workplace maturity.
`;
    } else if (interview.mode === "Confidence") {
      evaluationInstruction = `
Evaluate more carefully for confidence-focused interviews.
Give more attention to confidence, communication clarity, fluency, thought structure, and natural delivery.
Correctness should still matter, but less than in technical interviews.
`;
    } else {
      evaluationInstruction = `
Evaluate more carefully for technical interviews.
Focus on correctness, technical relevance, clarity, confidence, and completeness.
`;
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

${evaluationInstruction}

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`,
      },
      {
        role: "user",
        content: `
Interview Mode: ${interview.mode}
Question: ${question.question}
Answer: ${answer}
`,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = extractJsonFromAI(aiResponse);

    question.answer = answer;
    question.confidence = Number(parsed.confidence) || 0;
    question.communication = Number(parsed.communication) || 0;
    question.correctness = Number(parsed.correctness) || 0;
    question.score = Number(parsed.finalScore) || 0;
    question.feedback = parsed.feedback || "Answer evaluated successfully.";

    await interview.save();

    return res.status(200).json({
      feedback: question.feedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to submit answer ${error}`,
    });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(400).json({
        message: "failed to find Interview",
      });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      mode: interview.mode,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to finish Interview ${error}`,
    });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({
      message: `failed to find currentUser Interview ${error}`,
    });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      mode: interview.mode,
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to find currentUser Interview report ${error}`,
    });
  }
};



