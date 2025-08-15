import React from 'react';
import { useState } from 'react';
import type { ResearchSnapshot, PostPlan } from './types';
import { Step } from './types';
import ResearcherStep from './components/ResearcherStep';
import PlannerStep from './components/PlannerStep';
import SubmissionStep from './components/SubmissionStep';
import SparklesIcon from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Researcher);
  const [researchSnapshot, setResearchSnapshot] = useState<ResearchSnapshot | null>(null);
  const [postPlan, setPostPlan] = useState<PostPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSnapshotGenerated = (snapshot: ResearchSnapshot) => {
    setResearchSnapshot(snapshot);
    setCurrentStep(Step.Planner);
    setError(null);
  };

  const handlePlanGenerated = (plan: PostPlan) => {
    setPostPlan(plan);
    setError(null);
  };

  const handlePlanApproved = () => {
    if (postPlan) {
      setCurrentStep(Step.Submission);
    }
  };

  const resetFlow = () => {
    setCurrentStep(Step.Researcher);
    setResearchSnapshot(null);
    setPostPlan(null);
    setError(null);
    setIsLoading(false);
  };
  
  const getStepClass = (step: Step) => {
      const base = "flex items-center justify-center w-full lg:w-auto lg:flex-1 py-3 px-6 text-center text-sm font-medium border-b-4 transition-colors";
      if (step === currentStep) {
          return `${base} border-indigo-500 text-indigo-400`;
      }
      if (step < currentStep) {
          return `${base} border-green-500 text-green-400 cursor-pointer hover:bg-slate-700/50`;
      }
      return `${base} border-slate-700 text-slate-500`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <SparklesIcon className="w-8 h-8 text-indigo-400"/>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
              GBP Post Generation AI
            </h1>
          </div>
          <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
            A three-step AI agent workflow to research, plan, and schedule a 16-post social media plan.
          </p>
        </header>

        <div className="w-full bg-slate-800/50 rounded-lg shadow-2xl shadow-slate-950/50 border border-slate-700 mb-8">
            <nav className="flex flex-col lg:flex-row border-b border-slate-700">
                <div onClick={() => setCurrentStep(Step.Researcher)} className={getStepClass(Step.Researcher)}>
                    <span className="text-lg font-bold mr-2">1</span> Client Research
                </div>
                <div 
                  onClick={() => researchSnapshot && setCurrentStep(Step.Planner)} 
                  className={`${getStepClass(Step.Planner)} ${!researchSnapshot ? 'cursor-not-allowed' : ''}`}
                >
                    <span className="text-lg font-bold mr-2">2</span> Post Plan Generation
                </div>
                 <div 
                  onClick={() => postPlan && setCurrentStep(Step.Submission)} 
                  className={`${getStepClass(Step.Submission)} ${!postPlan ? 'cursor-not-allowed' : ''}`}
                >
                    <span className="text-lg font-bold mr-2">3</span> Submit to HighLevel
                </div>
            </nav>
            <div className="p-6 sm:p-8">
                {currentStep === Step.Researcher && (
                    <ResearcherStep
                        onSnapshotGenerated={handleSnapshotGenerated}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        error={error}
                        setError={setError}
                    />
                )}
                {currentStep === Step.Planner && researchSnapshot && (
                    <PlannerStep
                        snapshot={researchSnapshot}
                        onPlanGenerated={handlePlanGenerated}
                        onApprovePlan={handlePlanApproved}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        error={error}
                        setError={setError}
                        generatedPlan={postPlan}
                    />
                )}
                {currentStep === Step.Submission && researchSnapshot && postPlan && (
                    <SubmissionStep
                        snapshot={researchSnapshot}
                        plan={postPlan}
                    />
                )}
            </div>
        </div>

        {(researchSnapshot || error) && (
            <div className="text-center">
                 <button 
                    onClick={resetFlow} 
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                >
                    Start Over
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
