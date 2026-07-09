import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ReadingList } from '../types';
import { X, FolderPlus, Folder, CheckSquare, Square, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReadingListModalProps {
  blogId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingListModal: React.FC<ReadingListModalProps> = ({ blogId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchLists = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'reading_lists'),
        where('user_id', '==', user.id)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          blog_ids: data.blog_ids || [],
          ...data,
          created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString()
        };
      }) as ReadingList[];
      setLists(fetched);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load reading lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchLists();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleTogglePostInList = async (list: ReadingList) => {
    const isIncluded = list.blog_ids.includes(blogId);
    const listRef = doc(db, 'reading_lists', list.id);
    
    try {
      if (isIncluded) {
        // Remove from list
        await updateDoc(listRef, {
          blog_ids: arrayRemove(blogId)
        });
        setLists(prev => prev.map(l => l.id === list.id ? { ...l, blog_ids: l.blog_ids.filter(id => id !== blogId) } : l));
        toast.success(`Removed from "${list.name}"`);
      } else {
        // Add to list
        await updateDoc(listRef, {
          blog_ids: arrayUnion(blogId)
        });
        setLists(prev => prev.map(l => l.id === list.id ? { ...l, blog_ids: [...l.blog_ids, blogId] } : l));
        toast.success(`Added to "${list.name}"`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update list.");
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreating(true);

    try {
      const newListData = {
        user_id: user.id,
        name: newListName.trim(),
        blog_ids: [blogId], // Add current blog post immediately
        created_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'reading_lists'), newListData);
      
      const newList: ReadingList = {
        id: docRef.id,
        user_id: user.id,
        name: newListName.trim(),
        blog_ids: [blogId],
        created_at: new Date().toISOString()
      };

      setLists(prev => [newList, ...prev]);
      setNewListName('');
      setShowCreateForm(false);
      toast.success(`Collection "${newList.name}" created!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create collection.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Save to Reading List</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[350px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : lists.length === 0 && !showCreateForm ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p className="mb-4">You don't have any reading lists yet.</p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create New List</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lists.map(list => {
                const inList = list.blog_ids.includes(blogId);
                return (
                  <button
                    key={list.id}
                    onClick={() => handleTogglePostInList(list)}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{list.name}</span>
                    <div className="text-blue-600 dark:text-blue-400">
                      {inList ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer/Create form */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          {showCreateForm ? (
            <form onSubmit={handleCreateList} className="space-y-4">
              <input
                type="text"
                placeholder="List Name (e.g. Weekend Reads)"
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                maxLength={40}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-755 dark:text-gray-350 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newListName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create & Save</span>
                </button>
              </div>
            </form>
          ) : lists.length > 0 ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New List</span>
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default ReadingListModal;
