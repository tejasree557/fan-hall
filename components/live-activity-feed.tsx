"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  user: string;
  player: string;
  text: string;
  color: string;
  colorText: string;
};

const sampleActivities: Activity[] = [
  { 
    user: "Sneha", 
    player: "Jemimah Rodrigues", 
    text: "wrote something emotional 💙",
    color: "from-cyan-400/30 to-blue-400/30",
    colorText: "text-cyan-100"
  },
  { 
    user: "Rahul", 
    player: "Harmanpreet Kaur", 
    text: "posted a message 🔥",
    color: "from-blue-400/30 to-purple-400/30",
    colorText: "text-blue-100"
  },
  { 
    user: "Aarav", 
    player: "Smriti Mandhana", 
    text: "shared a story ✨",
    color: "from-purple-400/30 to-indigo-400/30",
    colorText: "text-purple-100"
  }
];

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const random = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
      setActivities(prev => {
        const newActs = [random, ...prev.slice(0, 2)];
        return newActs;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const hasActivities = activities.length > 0;

  return (
    <div className="mt-8 flex justify-center">
      <div className="relative w-full max-w-sm md:max-w-md lg:max-w-xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 backdrop-blur-2xl opacity-70 animate-float rounded-2xl" />
        
        <div className="relative fixed bottom-6 left-1/2 -translate-x-1/2 md:static backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl max-h-80 overflow-hidden animate-fadeInUp">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full live-dot flex-shrink-0" />
            <p className="text-xs font-medium text-white/80 tracking-wide">LIVE FAN ACTIVITY</p>
          </div>

          <div className="flex md:block gap-3 md:space-y-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent md:scrollbar-none">
            {hasActivities ? (
              activities.map((item, i) => {
                const isCTA = i === activities.length - 1;
                return (
                  <div key={i} className={`flex items-center gap-3 min-w-[280px] md:min-w-0 bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-xl p-3 cursor-pointer group snap-start flex-shrink-0 ${isCTA ? 'border-2 border-cyan-400/30 ring-1 ring-cyan-400/20' : ''}`}>
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${item.color} flex items-center justify-center text-xs md:text-sm font-bold ${item.colorText} group-hover:scale-105 transition-transform`}>
                      {item.user[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base text-white/90 font-medium leading-tight mb-1 truncate">
                        <span className="font-semibold">{item.user}</span> {item.text} for <span className="text-cyan-300 font-semibold">{item.player}</span>
                      </p>
                      {isCTA && (
                        <div className="flex items-center gap-1 text-xs text-cyan-300/90 font-medium pt-1 border-t border-white/10">
                          ✨ You could be next → <Link href="/write" className="hover:underline underline-offset-2">Write now</Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 text-white/60 min-w-[280px] md:min-w-0">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm animate-pulse">
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-sm font-medium mb-2">No stories yet</p>
                <p className="text-xs">Be the first to write one she might read</p>
                <Link href="/write" className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-xs font-medium border border-white/20 transition-all">
                  Write Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

