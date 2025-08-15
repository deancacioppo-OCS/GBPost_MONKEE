import React from 'react';
import { useState } from 'react';
import type { ResearchSnapshot, PostPlan } from '../types';
import { generatePostPlan } from '../services/geminiService';
import Loader from './Loader';
import PostCard from './PostCard';
import SparklesIcon from './icons/SparklesIcon';

interface PlannerStepProps {
  snapshot: ResearchSnapshot;
  onPlanGenerated: (plan: PostPlan) => void;
  onApprovePlan: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  generatedPlan: PostPlan | null;
}

const PlannerStep: React.FC<PlannerStepProps> = ({
  snapshot,
  onPlanGenerated,
  onApprovePlan,
  isLoading,
  setIsLoading,
  error,
  setError,
  generatedPlan,
}) => {
  const [isSnapshotVisible, setIsSnapshotVisible] = useState(false);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generatePostPlan(snapshot);
      onPlanGenerated(plan);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="p-4 bg-slate-800 rounded-lg mb-4">
        <button
          onClick={() => setIsSnapshotVisible(!isSnapshotVisible)}
          className="font-semibold text-lg w-full text-left text-indigo-400 hover:text-indigo-300"
        >
          {isSnapshotVisible ? '▼ Hide' : '► Show'} Research Snapshot
        </button>
        {isSnapshotVisible && (
          <pre className="mt-2 p-3 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto">
            <code>{JSON.stringify(snapshot, null, 2)}</code>
          </pre>
        )}
      </div>

      {!generatedPlan && !isLoading && (
        <button
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2.5 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Generate 16-Post Plan
        </button>
      )}
      
      {generatedPlan && (
         <button
          onClick={onApprovePlan}
          className="w-full flex items-center justify-center px-4 py-2.5 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 transition-colors"
        >
          Approve & Schedule Posts →
        </button>
      )}


      {isLoading && <Loader message="Generating Post Plan..." subMessage="First generating text, then creating images. This may take a minute." />}
      {error && <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md">{error}</div>}

      {generatedPlan && (
        <div className="mt-6">
          <div className="mb-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Generation Notes</h3>
            <p className="text-slate-400"><strong className="text-slate-200">Cadence:</strong> {generatedPlan.notes.cadence}</p>
            {generatedPlan.notes.assumptions.length > 0 && (
                 <ul className="list-disc list-inside mt-2 text-slate-400">
                    <strong className="text-slate-200">Assumptions:</strong>
                    {generatedPlan.notes.assumptions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {generatedPlan.posts.map((post, index) => (
              <PostCard key={index} post={post} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerStep;
