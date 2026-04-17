"use client";

import React, { useState } from 'react';

export default function CommunityPage() {
  const [posts, setPosts] = useState([
    {
      id: "1",
      user: "Amit Sharma",
      title: "Dealing with Tomato Early Blight in humid weather",
      content: "Hi everyone, the humidity has been high in UP recently. My tomatoes started showing early blight symptoms. I found that applying a copper fungicide and pruning bottom leaves really slowed it down. Any other organic suggestions?",
      likes: 12,
      comments: [
        { user: "Raj", text: "Neem oil works somewhat as a preventative measure, but copper is best once it starts." }
      ],
      time: "2 hours ago"
    },
    {
      id: "2",
      user: "Vikas Singh",
      title: "Best NDVI thresholds for Wheat before harvest?",
      content: "I've been using the Area Insights map. My wheat field NDVI is dropping from 0.7 to 0.4. Is this the right time to stop watering before harvesting?",
      likes: 8,
      comments: [],
      time: "5 hours ago"
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handlePost = () => {
    if(!newTitle || !newContent) return;
    const newPost = {
      id: Date.now().toString(),
      user: "Farmer (You)",
      title: newTitle,
      content: newContent,
      likes: 0,
      comments: [],
      time: "Just now"
    };
    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 max-w-4xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-extrabold heading-gradient mb-2">Farmer Community</h1>
        <p className="text-slate-400">Share knowledge, ask questions, and learn from experts around you.</p>
      </header>

      {/* Create Post */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <h3 className="font-bold text-lg">Create a Post</h3>
        <input 
          type="text" 
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-agrigreen-500"
          placeholder="Post Title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea 
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-agrigreen-500 min-h-[100px]"
          placeholder="What's on your mind? Share a problem or a remedy..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        ></textarea>
        <div className="flex justify-end">
          <button 
            onClick={handlePost}
            className="bg-agrigreen-600 hover:bg-agrigreen-500 px-6 py-2 rounded-lg font-bold transition"
          >
            Publish Post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-6">
        {posts.map(post => (
          <div key={post.id} className="glass-panel p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{post.title}</h2>
                <div className="text-sm text-slate-400 mt-1">
                  Posted by <span className="text-agrigreen-400">{post.user}</span> • {post.time}
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 leading-relaxed mb-6">{post.content}</p>
            
            <div className="flex gap-6 border-t border-slate-700/50 pt-4">
               <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition">
                 <span>❤️</span> {post.likes}
               </button>
               <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition">
                 <span>💬</span> {post.comments.length}
               </button>
            </div>

            {post.comments.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-slate-700 flex flex-col gap-3">
                {post.comments.map((c, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-bold text-slate-300">{c.user}: </span>
                    <span className="text-slate-400">{c.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
