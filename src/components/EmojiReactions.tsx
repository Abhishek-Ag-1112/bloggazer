import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface EmojiReactionsProps {
  blogId: string;
}

const REACTION_TYPES = [
  { key: 'like', symbol: '👍', label: 'Like' },
  { key: 'love', symbol: '❤️', label: 'Love' },
  { key: 'celebrate', symbol: '🎉', label: 'Celebrate' },
  { key: 'laugh', symbol: '😂', label: 'Laugh' },
  { key: 'wow', symbol: '😮', label: 'Wow' },
];

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({ blogId }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<{ [key: string]: string[] }>({});
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);

  useEffect(() => {
    if (!blogId) return;

    // Listen to real-time updates on reactions
    const docRef = doc(db, 'blogs', blogId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReactions(data.reactions || {});
      }
    });

    return () => unsubscribe();
  }, [blogId]);

  const handleReact = async (key: string) => {
    if (!user) {
      toast('Please sign in to react to posts!', { icon: '🔑' });
      return;
    }

    const currentReactors = reactions[key] || [];
    const hasReacted = currentReactors.includes(user.id);
    const blogRef = doc(db, 'blogs', blogId);

    // Trigger micro-animation state
    setAnimatingEmoji(key);
    setTimeout(() => setAnimatingEmoji(null), 400);

    try {
      if (hasReacted) {
        // Remove reaction
        await updateDoc(blogRef, {
          [`reactions.${key}`]: arrayRemove(user.id)
        });
      } else {
        // Add reaction
        await updateDoc(blogRef, {
          [`reactions.${key}`]: arrayUnion(user.id)
        });
      }
    } catch (e) {
      console.error("Error updating reaction:", e);
      toast.error("Failed to post reaction.");
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-center mt-6 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/10 border border-gray-200/50 dark:border-gray-800/80 backdrop-blur-sm select-none">
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">Reactions:</span>
      
      {REACTION_TYPES.map(({ key, symbol, label }) => {
        const Uids = reactions[key] || [];
        const count = Uids.length;
        const active = user ? Uids.includes(user.id) : false;
        const isAnimating = animatingEmoji === key;

        return (
          <button
            key={key}
            onClick={() => handleReact(key)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer transform
              ${active 
                ? 'bg-blue-100/60 dark:bg-blue-950/40 border-blue-400 text-blue-700 dark:text-blue-300 scale-105' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-750'}
              ${isAnimating ? 'animate-bounce' : ''}`}
            title={label}
          >
            <span className="text-base">{symbol}</span>
            {count > 0 && <span className="font-semibold">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default EmojiReactions;
