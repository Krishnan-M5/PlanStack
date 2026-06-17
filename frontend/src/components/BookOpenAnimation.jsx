import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';

const BookOpenAnimation = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate random particles along the center spine
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${45 + Math.random() * 10}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: `${0.5 + Math.random() * 0.8}s`,
      size: `${4 + Math.random() * 6}px`,
      color: ['#6366f1', '#818cf8', '#a5b4fc', '#4f46e5'][Math.floor(Math.random() * 4)],
    }));
    setParticles(newParticles);

    // Remove the animation overlay after it completes
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="book-cover">
      {/* Left Page */}
      <div className="book-page book-page-left">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
      </div>

      {/* Right Page */}
      <div className="book-page book-page-right">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
      </div>

      {/* Center Spine with Glow */}
      <div className="book-spine" />

      {/* Center Logo */}
      <div className="book-logo">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-primary-500/40"
          style={{ animation: 'glowPulse 1s ease-in-out' }}
        >
          <Layers className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">ProjectFlow</h2>
        <p className="text-primary-300/60 text-sm mt-1">Opening your workspace...</p>
      </div>

      {/* Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
};

export default BookOpenAnimation;
