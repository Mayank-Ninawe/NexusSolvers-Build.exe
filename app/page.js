'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

// Scroll Reveal Component
function ScrollReveal({ children, animation = 'fade-up', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1, once: true });
  
  const animations = {
    'fade-up': 'translate-y-10 opacity-0',
    'fade-down': '-translate-y-10 opacity-0',
    'fade-left': 'translate-x-10 opacity-0',
    'fade-right': '-translate-x-10 opacity-0',
    'zoom-in': 'scale-90 opacity-0',
    'zoom-out': 'scale-110 opacity-0'
  };

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 translate-x-0 scale-100 opacity-100' : animations[animation]
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate feature cards
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '34', label: 'AI Models', color: 'text-purple-600', icon: '🤖' },
    { value: '100%', label: 'Accuracy', color: 'text-green-600', icon: '🎯' },
    { value: '5', label: 'Bias Types', color: 'text-blue-600', icon: '📊' },
    { value: 'Free', label: 'Forever', color: 'text-pink-600', icon: '💝' }
  ];

  const features = [
    {
      icon: '📧',
      title: 'Upload Emails',
      desc: 'Simply paste or upload placement emails from your college. Our system analyzes text for bias patterns.',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      icon: '🤖',
      title: 'AI Analysis',
      desc: 'Gemini 2.5 Flash detects gender bias, department discrimination, and socioeconomic indicators.',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      icon: '📊',
      title: 'Get Insights',
      desc: 'View detailed reports with confidence scores, bias patterns, and actionable recommendations.',
      color: 'bg-green-50 border-green-200'
    }
  ];

  const biasTypes = [
    { name: 'Gender Bias', icon: '👥', desc: 'Pronouns, role assumptions', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700' },
    { name: 'Department', icon: '🎓', desc: 'CS/IT preference', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
    { name: 'Socioeconomic', icon: '🏠', desc: 'Hostel, fees, background', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
    { name: 'Academic', icon: '📚', desc: 'Unrealistic CGPA cutoffs', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' },
    { name: 'Community', icon: '🏛️', desc: 'Caste/religion indicators', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Powered by Badge */}
          <div className="flex justify-center mb-8 animate-fadeInDown">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-blue-100">
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-semibold text-gray-700">Powered by Google Gemini AI</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-8 animate-fadeInUp">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Detect Bias in<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                Campus Placements
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              AI-powered analysis to identify discrimination patterns in placement emails, ensuring 
              fair opportunities for all students across departments and backgrounds.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fadeInUp animation-delay-200">
            <Link 
              href="/upload"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Analysis
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link 
              href="/about"
              className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-blue-300 transform hover:scale-105 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* Stats Cards with Scroll Reveal */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <ScrollReveal key={index} animation="zoom-in" delay={index * 100}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className={`text-3xl font-black ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                How BiasBreaker Works
              </h2>
              <p className="text-xl text-gray-600">
                Advanced AI analysis to detect subtle discrimination patterns
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal 
                key={index} 
                animation={index === 0 ? 'fade-right' : index === 2 ? 'fade-left' : 'fade-up'}
                delay={index * 150}
              >
                <div 
                  className={`relative p-8 rounded-2xl border-2 ${feature.color} transform transition-all duration-500 cursor-pointer ${
                    activeCard === index ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg hover:scale-105'
                  }`}
                  onMouseEnter={() => setActiveCard(index)}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-black shadow-lg">
                    {index + 1}
                  </div>

                  <div className="text-6xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Animated Progress Bar */}
                  {activeCard === index && (
                    <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-progress"></div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* What We Detect Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                What We Detect
              </h2>
              <p className="text-xl text-gray-600">
                Five types of discrimination patterns
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {biasTypes.map((bias, index) => (
              <ScrollReveal 
                key={index} 
                animation="zoom-in" 
                delay={index * 100}
              >
                <div 
                  className={`${bias.bg} ${bias.border} border-2 rounded-2xl p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:-rotate-1 cursor-pointer group`}
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {bias.icon}
                  </div>
                  <h3 className={`text-lg font-bold ${bias.text} mb-2`}>
                    {bias.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {bias.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need for bias detection
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Real-Time Analysis', desc: 'Get results in under 3 seconds', color: 'from-yellow-400 to-orange-500' },
              { icon: '📊', title: 'Visual Reports', desc: 'Interactive charts and graphs', color: 'from-blue-400 to-cyan-500' },
              { icon: '📁', title: 'Batch Processing', desc: 'Analyze up to 10 emails at once', color: 'from-purple-400 to-pink-500' },
              { icon: '🔍', title: 'Deep Insights', desc: 'Detailed pattern explanations', color: 'from-green-400 to-teal-500' },
              { icon: '📄', title: 'Export Reports', desc: 'PDF & CSV downloads', color: 'from-red-400 to-rose-500' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your data stays protected', color: 'from-indigo-400 to-purple-500' }
            ].map((feature, index) => (
              <ScrollReveal 
                key={index} 
                animation="fade-up" 
                delay={index * 100}
              >
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal animation="zoom-in">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse animation-delay-1000"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Ready to Ensure Fair Placements?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Join students fighting for equal opportunities
                </p>
                <Link 
                  href="/upload"
                  className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1"
                >
                  Get Started for Free
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <ScrollReveal animation="fade-right">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  🎯
                </div>
                <span className="text-xl font-bold text-white">BiasBreaker</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered campus placement bias detection using Google Gemini.
              </p>
            </div>
          </ScrollReveal>

          {/* Quick Links */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/dashboard" className="block hover:text-white transition">Dashboard</Link>
                <Link href="/upload" className="block hover:text-white transition">Upload</Link>
                <Link href="/reports" className="block hover:text-white transition">Reports</Link>
                <Link href="/about" className="block hover:text-white transition">About</Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Tech Stack */}
          <ScrollReveal animation="fade-left" delay={200}>
            <div>
              <h3 className="text-white font-bold mb-4">Tech Stack</h3>
              <div className="space-y-1 text-sm">
                <p>• Next.js 16 (Turbopack)</p>
                <p>• Google Gemini 2.5 Flash</p>
                <p>• Firebase Auth & Database</p>
                <p>• Tailwind CSS</p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>Built for Google Technologies Hackathon 2025 • Made with ❤️ in Nagpur</p>
          <p className="mt-2">December 26, 2025 • Nagpur, India</p>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animate-progress {
          animation: progress 3s ease-in-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
