import React from 'react';
import { useState } from 'react';
import type { ResearchSnapshot, PostPlan, Post } from '../types';
import { schedulePost } from '../services/highlevelService';
import SparklesIcon from './icons/SparklesIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';


interface SubmissionStepProps {
  snapshot: ResearchSnapshot;
  plan: PostPlan;
}

const StatusIndicator: React.FC<{ status: Post['submissionStatus'] }> = ({ status }) => {
  switch (status) {
    case 'submitting':
      return <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-indigo-400 border-t-transparent" />;
    case 'success':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'failed':
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    case 'pending':
    default:
      return <div className="w-4 h-4 rounded-full bg-slate-600" />;
  }
};


const SubmissionStep: React.FC<SubmissionStepProps> = ({ snapshot, plan }) => {
  const [posts, setPosts] = useState<Post[]>(() => plan.posts.map(p => ({ ...p, submissionStatus: 'pending' })));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const successfulPosts = posts.filter(p => p.submissionStatus === 'success').length;
  const failedPosts = posts.filter(p => p.submissionStatus === 'failed').length;
  const completedPosts = successfulPosts + failedPosts;
  const progress = posts.length > 0 ? (completedPosts / posts.length) * 100 : 0;


  const startSubmission = async () => {
    if (!snapshot.client.locationId || !snapshot.client.selectedGbpAccountId) {
        alert("Missing Location ID or Account ID in snapshot.");
        return;
    }
    setIsSubmitting(true);
    setIsDone(false);

    const updatePostStatus = (index: number, status: Post['submissionStatus'], error: string | null = null) => {
        setPosts(currentPosts => 
            currentPosts.map((post, i) => 
                i === index ? { ...post, submissionStatus: status, submissionError: error ?? undefined } : post
            )
        );
    };

    for (let i = 0; i < posts.length; i++) {
        updatePostStatus(i, 'submitting');
        try {
            const result = await schedulePost(
                snapshot.client.locationId,
                snapshot.client.selectedGbpAccountId,
                posts[i] // Pass the original post data
            );
            if (result.success) {
                updatePostStatus(i, 'success');
            } else {
                updatePostStatus(i, 'failed', result.message);
            }
        } catch (err: any) {
            updatePostStatus(i, 'failed', err.message || 'An unknown error occurred.');
        }
    }
    
    setIsSubmitting(false);
    setIsDone(true);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">Submit Posts to HighLevel</h3>
        <p className="text-slate-400">Ready to schedule {posts.length} posts to the Social Planner.</p>
      </div>

      {!isSubmitting && !isDone && (
        <button
          onClick={startSubmission}
          className="w-full max-w-sm mx-auto flex items-center justify-center px-4 py-2.5 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Start Scheduling
        </button>
      )}

      {(isSubmitting || isDone) && (
        <div className="max-w-3xl mx-auto">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium text-slate-300">
                        {isSubmitting ? `Submitting post ${completedPosts + 1} of ${posts.length}...` : 'Submission Complete!'}
                    </span>
                    <span className="font-mono text-slate-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                 <div className="flex justify-between mt-1 text-xs">
                    <span className="text-green-500">{successfulPosts} Success</span>
                    <span className="text-red-500">{failedPosts} Failed</span>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3 h-96 overflow-y-auto">
            {posts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/70 rounded-md">
                    <div className="flex items-center gap-3">
                        <StatusIndicator status={post.submissionStatus} />
                        <div>
                            <p className="font-medium text-slate-200">{post.title || 'Untitled Post'}</p>
                            {post.submissionStatus === 'failed' && (
                                <p className="text-xs text-red-400">{post.submissionError}</p>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                        {post.submissionStatus?.toUpperCase()}
                    </div>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionStep;