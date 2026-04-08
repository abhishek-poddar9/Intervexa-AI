import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewPage() {
  const location = useLocation();
  const selectedMode = location.state?.selectedMode || "technical";

  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <div className='min-h-screen bg-gray-50'>
      {step === 1 && (
        <Step1SetUp
          selectedMode={selectedMode}
          onStart={(data) => {
            setInterviewData({
              ...data,
              selectedMode,
            });
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          selectedMode={selectedMode}
          onFinish={(report) => {
            setInterviewData({
              ...report,
              selectedMode,
            });
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <Step3Report
          report={interviewData}
          selectedMode={selectedMode}
        />
      )}
    </div>
  )
}

export default InterviewPage
