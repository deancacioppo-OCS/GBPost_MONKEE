
import React from 'react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = "Generating with Gemini...", 
  subMessage = "This may take a moment. Please wait." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-indigo-500 border-t-transparent"></div>
      <p className="mt-4 text-lg font-medium text-slate-300">{message}</p>
      <p className="mt-1 text-sm text-slate-400">{subMessage}</p>
    </div>
  );
};

export default Loader;
