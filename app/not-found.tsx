'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faExclamationTriangle,
  faRocket,
  faStar,
  faTools,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const NotFound = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    setIsVisible(true);

    // Generate floating elements for background animation
    const elements: FloatingElement[] = [];
    for (let i = 0; i < 15; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2,
      });
    }
    setFloatingElements(elements);
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-green-50 to-emerald-50">
      {/* Custom CSS for animations (use CSS variables to control float) */}
      <style jsx global>{`
        /* Control these to tune the float behaviour */
        :root {
          --float-distance: 6px;   /* amplitude: reduce to decrease up/down movement */
          --float-duration: 6s;    /* duration: increase to slow the float */
          --dot-float-distance: 3px; /* smaller movement for background dots */
          --dot-float-duration: 12s; /* longer slower movement for dots */
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { 
          animation: spin-slow 3s linear infinite; 
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(-1 * var(--float-distance))); }
        }
        .animate-float { 
          animation: float var(--float-duration) ease-in-out infinite; 
        }

        @keyframes float-dot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(-1 * var(--dot-float-distance))); }
        }
        .animate-float-dot {
          animation: float-dot var(--dot-float-duration) ease-in-out infinite;
        }

        /* you can apply different easing for very subtle motion */
        .floating-dot {
          animation-timing-function: cubic-bezier(.4,.0,.2,1);
        }
      `}</style>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full opacity-20 animate-float-dot floating-dot"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              background: 'radial-gradient(circle at 30% 20%, #74d19d 0%, rgba(116,209,157,0.15) 20%, transparent 60%)',
              filter: 'blur(12px)',
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration + 8}s`, // make background dots slower by default
              opacity: 0.9
            }}
          />
        ))}

        {/* Additional decorative elements */}
        <div
          className="absolute top-10 left-10 w-28 h-28 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(116,209,157,0.18), transparent 40%)',
            filter: 'blur(8px)'
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full opacity-85"
          style={{
            background: 'radial-gradient(circle at 30% 20%, #74d19d 0%, rgba(116,209,157,0.12) 20%, transparent 60%)',
            filter: 'blur(12px)'
          }}
        />

        {/* Large Background Glow */}
        <div
          className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(116,209,157,0.12), transparent 40%)',
            filter: 'blur(28px)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className={`text-center max-w-2xl mx-auto transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}>

          {/* 404 Number with Animation (reduced float) */}
          <div className="relative mb-8">
            <h1
              className="text-5xl md:text-[8rem] font-extrabold animate-float"
              style={{
                background: 'linear-gradient(90deg, #4fbf86, #74d19d)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              404
            </h1>

            {/* Floating Icons around 404 - keep them subtle (no heavy up/down) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="absolute text-yellow-500 text-2xl"
                style={{ top: '18%', left: '8%', transform: 'translateY(0)', transition: 'transform 0.6s ease-in-out', animationDelay: '0.5s' }}
              />
              <FontAwesomeIcon
                icon={faRocket}
                className="absolute text-emerald-500 text-xl"
                style={{ top: '28%', right: '14%', transform: 'translateY(0)', animationDelay: '1s' }}
              />
              <FontAwesomeIcon
                icon={faStar}
                className="absolute text-green-300 text-lg"
                style={{ bottom: '24%', left: '20%', transform: 'translateY(0)', animationDelay: '1.5s' }}
              />
              <FontAwesomeIcon
                icon={faTools}
                className="absolute text-emerald-600 text-xl"
                style={{ bottom: '18%', right: '10%', transform: 'translateY(0)', animationDelay: '2s' }}
              />
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-md mx-auto">
              The page you're looking for seems to have wandered off into the digital wilderness.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGoHome}
              className="px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #4fbf86, #74d19d)'
              }}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Go Home
            </button>
          </div>

          {/* Fun Animation Element */}
          <div className="relative mt-6">
            <p className="mt-4 text-sm text-gray-500 animate-float" style={{ animationDuration: '8s' }}>
              Redirecting your digital journey...
            </p>
          </div>

          {/* Decorative small floating shapes */}
          <div className="absolute top-6 left-6 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(116,209,157,0.12), transparent 40%)', filter: 'blur(18px)' }} />
          <div className="absolute bottom-8 right-8 w-28 h-28 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(116,209,157,0.08), rgba(116,209,157,0.04))', filter: 'blur(22px)' }} />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
