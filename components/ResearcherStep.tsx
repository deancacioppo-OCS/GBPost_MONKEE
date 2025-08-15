
import React from 'react';
import { useState, useMemo } from 'react';
import type { ResearchSnapshot, SocialAccount } from '../types';
import { generateResearchSnapshot } from '../services/geminiService';
import { fetchSocialAccounts } from '../services/highlevelService';
import Loader from './Loader';
import CodeBlock from './CodeBlock';
import SparklesIcon from './icons/SparklesIcon';

interface ResearcherStepProps {
  onSnapshotGenerated: (snapshot: ResearchSnapshot) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const ResearcherStep: React.FC<ResearcherStepProps> = ({ onSnapshotGenerated, isLoading, setIsLoading, error, setError }) => {
  const [homepageUrl, setHomepageUrl] = useState('');
  const [gbpHint, setGbpHint] = useState('');
  const [locationId, setLocationId] = useState('');
  const [generatedSnapshot, setGeneratedSnapshot] = useState<ResearchSnapshot | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // GHL State
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);

  const gbpAccounts = useMemo(() => socialAccounts.filter(acc => acc.provider === 'google_my_business'), [socialAccounts]);

  const handleFetchAccounts = async () => {
    if (!locationId) {
      setAccountError('Please enter a Location ID.');
      return;
    }
    setIsFetchingAccounts(true);
    setAccountError(null);
    setSocialAccounts([]);
    setSelectedAccountId('');
    try {
      const accounts = await fetchSocialAccounts(locationId);
      setSocialAccounts(accounts);
    } catch (err: any) {
      setAccountError(err.message || 'Failed to fetch accounts.');
    } finally {
      setIsFetchingAccounts(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homepageUrl || !selectedAccountId) {
      setError('Homepage URL and a selected GBP Account are required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedSnapshot(null);
    setGeneratedImageUrl(null);

    try {
      const { snapshot, generatedImageUrl: imageUrl } = await generateResearchSnapshot(homepageUrl, gbpHint, locationId, selectedAccountId);
      setGeneratedSnapshot(snapshot);
      setGeneratedImageUrl(imageUrl);
      onSnapshotGenerated(snapshot);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormSubmittable = homepageUrl && selectedAccountId && !isLoading;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* === HighLevel Connection Step === */}
        <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
          <h3 className="font-semibold text-lg mb-2 text-indigo-400">1. Connect to HighLevel</h3>
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="flex-grow w-full">
              <label htmlFor="locationId" className="block text-sm font-medium text-slate-300 mb-1">
                HighLevel Location ID*
              </label>
              <input
                type="text"
                id="locationId"
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  setSocialAccounts([]);
                  setSelectedAccountId('');
                  setAccountError(null);
                }}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. a1B2c3D4e5F6g7H8i9J0"
              />
            </div>
            <button
              type="button"
              onClick={handleFetchAccounts}
              disabled={isFetchingAccounts || !locationId}
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              {isFetchingAccounts ? 'Fetching...' : 'Fetch Accounts'}
            </button>
          </div>
          {accountError && <p className="text-sm text-red-400 mt-2">{accountError}</p>}
          {isFetchingAccounts && <div className="text-sm text-slate-400 mt-2">Connecting to HighLevel...</div>}
          
          {gbpAccounts.length > 0 && (
             <div className="mt-3">
                <label htmlFor="gbpAccount" className="block text-sm font-medium text-slate-300 mb-1">
                  Select Google Business Profile*
                </label>
                <select
                  id="gbpAccount"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>-- Select a profile --</option>
                  {gbpAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
             </div>
          )}
        </div>
        
        {/* === Client Details Step === */}
        <div className={`p-4 border border-slate-700 rounded-lg bg-slate-800/50 transition-opacity ${selectedAccountId ? 'opacity-100' : 'opacity-50'}`}>
           <h3 className="font-semibold text-lg mb-2 text-indigo-400">2. Provide Client Details</h3>
           <div className="space-y-4">
              <div>
                <label htmlFor="homepageUrl" className="block text-sm font-medium text-slate-300 mb-1">
                  Homepage URL*
                </label>
                <input
                  type="url"
                  id="homepageUrl"
                  value={homepageUrl}
                  onChange={(e) => setHomepageUrl(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com"
                  required
                  disabled={!selectedAccountId}
                />
              </div>
              <div>
                <label htmlFor="gbpHint" className="block text-sm font-medium text-slate-300 mb-1">
                  Google Business Profile Hint (Optional)
                </label>
                <input
                  type="text"
                  id="gbpHint"
                  value={gbpHint}
                  onChange={(e) => setGbpHint(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Example Plumbing New Orleans"
                  disabled={!selectedAccountId}
                />
              </div>
           </div>
        </div>

        <button
          type="submit"
          disabled={!isFormSubmittable}
          className="w-full flex items-center justify-center px-4 py-2.5 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {isLoading ? 'Generating...' : 'Generate Research Snapshot'}
        </button>
      </form>

      {isLoading && <Loader message="Analyzing & Generating Image..." subMessage="This involves web research and image creation, so it may take a bit longer." />}
      {error && <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md">{error}</div>}
      
      {(generatedSnapshot || generatedImageUrl) && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Generated Assets</h3>
          {generatedImageUrl && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-300 mb-2">Generated Hero Image</h4>
              <div className="flex justify-center">
                <img src={generatedImageUrl} alt="AI generated hero image for the client" className="rounded-lg shadow-lg w-full max-w-lg" />
              </div>
              {generatedSnapshot?.generated_hero_image_prompt && (
                <p className="text-xs text-slate-500 italic mt-2 text-center max-w-lg mx-auto">
                  <strong className="font-semibold text-slate-400">Prompt:</strong> {generatedSnapshot.generated_hero_image_prompt}
                </p>
              )}
            </div>
          )}
          {generatedSnapshot && (
            <div>
              <h4 className="text-lg font-semibold text-slate-300 mb-2">Research Snapshot JSON</h4>
              <CodeBlock content={JSON.stringify(generatedSnapshot, null, 2)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearcherStep;