
import React from 'react';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
  index: number;
}

const CtaButton: React.FC<{ type: Post['cta_type']; url: string | null }> = ({ type, url }) => {
  if (type === 'none') {
    return null;
  }
  return (
    <a
      href={url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-3 px-3 py-1 text-sm font-semibold text-indigo-200 bg-indigo-500/50 rounded-full hover:bg-indigo-500/70 transition-colors"
    >
      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </a>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, index }) => {
  const imageUrl = post.image.url || `https://picsum.photos/seed/${post.title || index}/400/300`;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
      <div className="relative">
        <img src={imageUrl} alt={post.title || 'Post image'} className="w-full h-48 object-cover" />
        <span className="absolute top-2 right-2 bg-slate-900/70 text-xs font-bold text-white px-2 py-1 rounded-full">
          {post.type}
        </span>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-lg text-slate-100">{post.title || 'Untitled Post'}</h4>
        <p className="text-sm text-slate-400 mt-2">{post.body}</p>
        <div className="mt-3 text-xs text-slate-500">
            {post.schedule_at_iso && <span>Scheduled: {new Date(post.schedule_at_iso).toLocaleString()}</span>}
        </div>
        <CtaButton type={post.cta_type} url={post.cta_url} />

        {post.image.source === 'generated' && post.image.prompt && (
            <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500 italic">
                    <strong className="font-semibold text-slate-400">Image Prompt:</strong> {post.image.prompt}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
