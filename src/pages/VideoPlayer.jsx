import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VideoPlayer() {
  const navigate = useNavigate();

  const handleClose = () => {
    // Navigate home and instruct the browser to quickly scroll to the How It Works block
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-[200] flex items-center justify-center animate-[fade-up_0.3s_ease-out_forwards]">
      {/* Close Button */}
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 hover:bg-[var(--purple)] text-white rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
        aria-label="Close video and return to Home"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Full screen Video Element */}
      <video 
        className="w-full h-full object-contain outline-none"
        preload="auto"
        controls 
        autoPlay 
        playsInline
      >
        <source src="/demo.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
}
