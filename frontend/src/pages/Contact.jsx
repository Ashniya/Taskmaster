import { useState, useEffect, useRef } from 'react';
import { sendContactMessage } from '../services/api';

const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return [ref, isVisible];
};

// Animated Character Component
const AnimatedChar = ({ char, delay, isDark }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className="inline-block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) rotateX(0deg)' : 'translateY(20px) rotateX(-90deg)',
        transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        color: isDark ? '#FFFFFF' : '#111827',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
};

const Contact = ({ isDark = false }) => {
  const [refLeft, visibleLeft] = useScrollAnimation();
  const [refRight, visibleRight] = useScrollAnimation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    services: {
      website: false,
      ux: false,
      strategy: false,
      other: false,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (key) => {
    setForm((prev) => ({
      ...prev,
      services: { ...prev.services, [key]: !prev.services[key] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        services: form.services,
      };
      await sendContactMessage(payload);
      alert('Message sent successfully!');
      setForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        services: {
          website: false,
          ux: false,
          strategy: false,
          other: false,
        },
      });
    } catch (err) {
      console.error('Contact submit error:', err);
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const title = "Get in touch";

  return (
    <div
      className="min-h-screen pt-20 transition-colors duration-300 relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(to bottom right, #1F2937, #111827)'
          : 'linear-gradient(to bottom right, #DBEAFE, #E0E7FF, #DDD6FE)',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bubbleFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
        }
        @keyframes bubbleFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 30px) scale(1.15); }
        }
        @keyframes bubbleFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.08); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; filter: blur(40px); }
          50% { opacity: 0.6; filter: blur(60px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes floatingGlow {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          33% { 
            transform: translate(20px, -20px) scale(1.1);
            opacity: 0.6;
          }
          66% { 
            transform: translate(-15px, 15px) scale(0.95);
            opacity: 0.5;
          }
        }
      `}</style>

      {/* Enhanced Background bubbles with glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: '500px',
            height: '500px',
            background: isDark 
              ? 'radial-gradient(circle, #4F46E5 0%, transparent 70%)'
              : 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
            top: '-150px',
            left: '-150px',
            animation: 'bubbleFloat1 20s ease-in-out infinite, glow 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '400px',
            height: '400px',
            background: isDark 
              ? 'radial-gradient(circle, #EC4899 0%, transparent 70%)'
              : 'radial-gradient(circle, #F97316 0%, transparent 70%)',
            bottom: '-180px',
            right: '-120px',
            animation: 'bubbleFloat2 24s ease-in-out infinite, glow 10s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '350px',
            height: '350px',
            background: isDark 
              ? 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)'
              : 'radial-gradient(circle, #22C55E 0%, transparent 70%)',
            top: '40%',
            right: '8%',
            animation: 'bubbleFloat3 22s ease-in-out infinite, glow 9s ease-in-out infinite 1s',
          }}
        />
        
        {/* Additional floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              background: isDark 
                ? `radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)`
                : `radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 8}s ease-in-out infinite ${Math.random() * 5}s`,
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Enhanced Animated Header */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {title.split('').map((char, i) => (
                <AnimatedChar key={i} char={char} delay={i * 50} isDark={isDark} />
              ))}
            </h1>
          </div>

          <div style={{ animation: 'fadeInUp 0.8s ease-out 0.8s both' }}>
            <p 
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: isDark ? '#D1D5DB' : '#374151' }}
            >
              Share your ideas or questions about{' '}
              <span 
                className="font-bold"
                style={{ 
                  color: isDark ? '#93C5FD' : '#4F46E5',
                  textShadow: isDark ? '0 0 20px rgba(147, 197, 253, 0.3)' : 'none'
                }}
              >
                TaskMaster
              </span>{' '}
              and the team will get back to you.
            </p>
          </div>
        </div>

        {/* Split Layout - Left Content & Right Form */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* LEFT SIDE - Animated Content */}
            <div
              ref={refLeft}
              className="relative"
              style={{
                opacity: visibleLeft ? 1 : 0,
                transform: visibleLeft ? 'translateX(0)' : 'translateX(-50px)',
                transition: 'all 0.8s ease-out',
              }}
            >
              {/* Floating glow behind left content */}
              <div 
                className="absolute -inset-8 rounded-3xl pointer-events-none"
                style={{
                  background: isDark 
                    ? 'radial-gradient(circle at 30% 50%, rgba(79,70,229,0.4), transparent 60%)'
                    : 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.3), transparent 60%)',
                  filter: 'blur(50px)',
                  animation: 'floatingGlow 8s ease-in-out infinite',
                }}
              />

              <div className="relative space-y-8 lg:pt-12">
                <div style={{ animation: 'fadeInUp 1s ease-out' }}>
                  <p
                    className="text-sm font-bold uppercase tracking-widest mb-6"
                    style={{ 
                      color: isDark ? '#93C5FD' : '#4F46E5',
                      animation: 'pulse 2s ease-in-out infinite',
                      letterSpacing: '0.15em'
                    }}
                  >
                    • Contact •
                  </p>
                  
                  <h2
                    className="text-4xl md:text-5xl font-bold leading-tight mb-6"
                    style={{ 
                      color: isDark ? '#F9FAFB' : '#111827',
                      animation: 'float 4s ease-in-out infinite',
                      textShadow: isDark ? '0 0 30px rgba(147,197,253,0.1)' : 'none'
                    }}
                  >
                    Let's build a better way to organize your day.
                  </h2>
                  
                  <p
                    className="text-lg leading-relaxed mb-8"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    Have feedback, a feature request, or found a bug? Send a
                    message and help shape the future of TaskMaster.
                  </p>

                  {/* Info badges */}
                  <div className="space-y-4 mb-8">
                    <div
                      className="inline-flex items-center gap-3 px-5 py-3 rounded-full text-sm font-medium backdrop-blur-sm"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(79,70,229,0.2)'
                          : 'rgba(129,140,248,0.2)',
                        color: isDark ? '#E5E7EB' : '#1F2937',
                        border: isDark ? '1px solid rgba(147,197,253,0.3)' : '1px solid rgba(79,70,229,0.2)',
                      }}
                    >
                      <span 
                        className="w-3 h-3 rounded-full bg-emerald-400"
                        style={{ animation: 'pulse 2s ease-in-out infinite' }}
                      />
                      Responds within 24 hours
                    </div>
                    
                    <div
                      className="inline-flex items-center gap-2 backdrop-blur-sm px-5 py-3 rounded-full"
                      style={{ 
                        color: isDark ? '#E5E7EB' : '#374151',
                        backgroundColor: isDark ? 'rgba(31,41,55,0.5)' : 'rgba(255,255,255,0.5)',
                        border: isDark ? '1px solid rgba(147,197,253,0.2)' : '1px solid rgba(229,231,235,0.8)',
                      }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span style={{ color: isDark ? '#93C5FD' : '#2563EB', fontWeight: 600 }}>
                        support@taskmaster.com
                      </span>
                    </div>
                  </div>

                  {/* Social icons */}



<div className="flex gap-3 mb-6">
  {[
    { label: 'IG', color: '#E4405F', link: 'https://www.instagram.com/task_masrer110/' },
    // { label: 'T', color: '#0A66C2', link: 'https://linkedin.com/in/yourprofile' },
    { label: 'X', color: '#000000', link: 'https://x.com/Task_Master110' },
    { label: 'YT', color: '#E4405F', link: 'https://instagram.com/yourprofile' }
   
  ].map((social, i) => (
    <a
      key={social.label}
      href={social.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative"
      style={{ animation: `fadeInUp 1.2s ease-out ${1.2 + i * 0.1}s both` }}
    >
      <button
        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        style={{
          backgroundColor: isDark
            ? 'rgba(79,70,229,0.15)'
            : 'rgba(255,255,255,0.9)',
          color: isDark ? '#93C5FD' : '#4F46E5',
          border: isDark
            ? '2px solid rgba(147,197,253,0.3)'
            : '2px solid rgba(79,70,229,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = social.color;
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.borderColor = social.color;
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark
            ? 'rgba(79,70,229,0.15)'
            : 'rgba(255,255,255,0.9)';
          e.currentTarget.style.color = isDark ? '#93C5FD' : '#4F46E5';
          e.currentTarget.style.borderColor = isDark
            ? 'rgba(147,197,253,0.3)'
            : 'rgba(79,70,229,0.2)';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
        }}
      >
        {social.label}
      </button>
    </a>
  ))}
</div>




<div>

                    {/* <h3
                      className="text-3xl md:text-4xl font-bold"
                      style={{ 
                        color: isDark ? '#F9FAFB' : '#111827',
                        animation: 'slideInLeft 1s ease-out',
                        textShadow: isDark ? '0 0 30px rgba(147,197,253,0.1)' : 'none'
                      }}
                    >
                      Got ideas? Let's talk.
                    </h3> */}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Form */}
            <div
              ref={refRight}
              className="relative"
              style={{
                opacity: visibleRight ? 1 : 0,
                transform: visibleRight ? 'translateX(0)' : 'translateX(50px)',
                transition: 'all 0.8s ease-out 0.2s',
              }}
            >
              {/* Floating glow behind form */}
              <div 
                className="absolute -inset-8 rounded-3xl pointer-events-none"
                style={{
                  background: isDark 
                    ? 'radial-gradient(circle at 70% 50%, rgba(139,92,246,0.4), transparent 60%)'
                    : 'radial-gradient(circle at 70% 50%, rgba(99,102,241,0.3), transparent 60%)',
                  filter: 'blur(50px)',
                  animation: 'floatingGlow 10s ease-in-out infinite 2s',
                }}
              />

              <div 
                className="relative backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border"
                style={{
                  backgroundColor: isDark 
                    ? 'rgba(31, 41, 55, 0.7)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  borderColor: isDark 
                    ? 'rgba(147, 197, 253, 0.2)' 
                    : 'rgba(229, 231, 235, 0.8)',
                }}
              >
                <div
                  className="p-8 md:p-10"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(139,92,246,0.08))'
                      : 'linear-gradient(135deg, rgba(238,242,255,0.8), rgba(224,231,255,0.8))',
                  }}
                >
                  <div className="mb-8">
                    <p 
                      className="text-base leading-relaxed"
                      style={{ 
                        color: isDark ? '#D1D5DB' : '#4B5563',
                      }}
                    >
                      Tell us a bit about yourself and how TaskMaster can help you.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label 
                        className="block text-sm font-bold mb-2 tracking-wide"
                        style={{ color: isDark ? '#93C5FD' : '#4F46E5' }}
                      >
                        Your name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent focus:outline-none py-3 text-base transition-all duration-300 rounded-lg px-4"
                        placeholder="Your name"
                        style={{
                          border: isDark 
                            ? '2px solid rgba(147,197,253,0.2)' 
                            : '2px solid rgba(79,70,229,0.2)',
                          color: isDark ? '#F9FAFB' : '#111827',
                          backgroundColor: isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = isDark ? '#93C5FD' : '#4F46E5';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.5)' 
                            : 'rgba(255,255,255,0.9)';
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = isDark 
                            ? 'rgba(147,197,253,0.2)' 
                            : 'rgba(79,70,229,0.2)';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-bold mb-2 tracking-wide"
                        style={{ color: isDark ? '#93C5FD' : '#4F46E5' }}
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent focus:outline-none py-3 text-base transition-all duration-300 rounded-lg px-4"
                        placeholder="Enter your email"
                        style={{
                          border: isDark 
                            ? '2px solid rgba(147,197,253,0.2)' 
                            : '2px solid rgba(79,70,229,0.2)',
                          color: isDark ? '#F9FAFB' : '#111827',
                          backgroundColor: isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = isDark ? '#93C5FD' : '#4F46E5';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.5)' 
                            : 'rgba(255,255,255,0.9)';
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = isDark 
                            ? 'rgba(147,197,253,0.2)' 
                            : 'rgba(79,70,229,0.2)';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-bold mb-2 tracking-wide"
                        style={{ color: isDark ? '#93C5FD' : '#4F46E5' }}
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full bg-transparent focus:outline-none py-3 text-base transition-all duration-300 rounded-lg px-4"
                        placeholder="How can we help?"
                        style={{
                          border: isDark 
                            ? '2px solid rgba(147,197,253,0.2)' 
                            : '2px solid rgba(79,70,229,0.2)',
                          color: isDark ? '#F9FAFB' : '#111827',
                          backgroundColor: isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = isDark ? '#93C5FD' : '#4F46E5';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.5)' 
                            : 'rgba(255,255,255,0.9)';
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = isDark 
                            ? 'rgba(147,197,253,0.2)' 
                            : 'rgba(79,70,229,0.2)';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-bold mb-2 tracking-wide"
                        style={{ color: isDark ? '#93C5FD' : '#4F46E5' }}
                      >
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-transparent focus:outline-none py-3 text-base resize-none transition-all duration-300 rounded-lg px-4"
                        placeholder="Tell us about your question or feedback..."
                        style={{
                          border: isDark 
                            ? '2px solid rgba(147,197,253,0.2)' 
                            : '2px solid rgba(79,70,229,0.2)',
                          color: isDark ? '#F9FAFB' : '#111827',
                          backgroundColor: isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = isDark ? '#93C5FD' : '#4F46E5';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.5)' 
                            : 'rgba(255,255,255,0.9)';
                          e.target.style.transform = 'scale(1.02)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = isDark 
                            ? 'rgba(147,197,253,0.2)' 
                            : 'rgba(79,70,229,0.2)';
                          e.target.style.backgroundColor = isDark 
                            ? 'rgba(31,41,55,0.3)' 
                            : 'rgba(255,255,255,0.5)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                    </div>

                    <div>
                      <p 
                        className="text-sm font-bold mb-3 tracking-wide"
                        style={{ color: isDark ? '#93C5FD' : '#4F46E5' }}
                      >
                        How can we help?
                      </p>
                      <div 
                        className="grid grid-cols-2 gap-3 text-sm"
                        style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                      >
                        {[
                          { key: 'website', label: 'Task setup' },
                          { key: 'ux', label: 'UI / UX' },
                          { key: 'strategy', label: 'Productivity tips' },
                          { key: 'other', label: 'Other' }
                        ].map((service) => (
                          <label 
                            key={service.key}
                            className="flex items-center gap-2 cursor-pointer p-3 rounded-lg transition-all duration-300 hover:scale-105"
                            style={{
                              backgroundColor: form.services[service.key]
                                ? isDark 
                                  ? 'rgba(79,70,229,0.2)' 
                                  : 'rgba(79,70,229,0.1)'
                                : 'transparent',
                              border: form.services[service.key]
                                ? isDark
                                  ? '2px solid rgba(147,197,253,0.4)'
                                  : '2px solid rgba(79,70,229,0.3)'
                                : isDark
                                  ? '2px solid rgba(147,197,253,0.1)'
                                  : '2px solid rgba(229,231,235,0.5)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={form.services[service.key]}
                              onChange={() => handleServiceChange(service.key)}
                              className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                            />
                            <span className="font-medium">{service.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="group relative w-full py-4 rounded-full text-white text-base font-bold shadow-2xl transition-all duration-500 hover:shadow-indigo-500/50 overflow-hidden"
                      style={{
                        background: isDark 
                          ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)' 
                          : 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Send Message
                        <svg 
                          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                      
                      {/* Animated background shimmer on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;