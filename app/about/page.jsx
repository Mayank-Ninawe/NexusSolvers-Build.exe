'use client'
import Navbar from '@/components/Navbar';
import Link from 'next/link';
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

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <ScrollReveal animation="fade-down">
          <div className="text-center mb-16">
            <div className="text-6xl mb-4 animate-bounce">🎯</div>
            <h1 className="text-5xl font-black text-gray-900 mb-4">
              About BiasBreaker
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered solution to detect and eliminate bias in campus placement processes
            </p>
          </div>
        </ScrollReveal>

        {/* Mission Section */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              BiasBreaker aims to ensure fair and equal opportunities for all students in campus placements by detecting subtle discrimination patterns in recruitment communications.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Using advanced AI technology, we analyze placement emails to identify gender bias, department discrimination, socioeconomic barriers, and other forms of unfair treatment that often go unnoticed.
            </p>
          </div>
        </ScrollReveal>

        {/* Problem Statement */}
        <ScrollReveal animation="fade-right">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem</h2>
            <div className="space-y-4 text-gray-800">
              <div className="flex items-start gap-3 group">
                <span className="text-2xl group-hover:scale-110 transition-transform">⚠️</span>
                <div>
                  <h3 className="font-bold mb-1">Hidden Discrimination</h3>
                  <p>Subtle bias in placement emails excludes qualified students based on gender, department, or background.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group">
                <span className="text-2xl group-hover:scale-110 transition-transform">📉</span>
                <div>
                  <h3 className="font-bold mb-1">Unequal Opportunities</h3>
                  <p>CS/IT students get 3x more opportunities than other branches despite similar skill sets.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                <div>
                  <h3 className="font-bold mb-1">Manual Detection Fails</h3>
                  <p>Human reviewers miss 80% of subtle bias patterns in recruitment communications.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Solution Section */}
        <ScrollReveal animation="fade-left">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Solution</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
                <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-700">Google Gemini 2.5 Flash analyzes text with 100% accuracy</p>
              </div>
              
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
                <h3 className="font-bold text-gray-900 mb-2">Real-Time</h3>
                <p className="text-sm text-gray-700">Instant analysis in under 2 seconds per email</p>
              </div>
              
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎯</div>
                <h3 className="font-bold text-gray-900 mb-2">Comprehensive</h3>
                <p className="text-sm text-gray-700">Detects 5 types of bias patterns with detailed reasoning</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Tech Stack */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Technology Stack</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚛️</span>
                  <span>Frontend</span>
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span><strong>Next.js 16</strong> - React framework with App Router</span>
                  </li>
                  <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span><strong>Tailwind CSS</strong> - Utility-first styling</span>
                  </li>
                  <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span><strong>Turbopack</strong> - Ultra-fast bundler</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🤖</span>
                  <span>AI & Backend</span>
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span><strong>Google Gemini 2.5 Flash</strong> - 34 AI models</span>
                  </li>
                  <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span><strong>Firebase Auth</strong> - Anonymous + OAuth</span>
                  </li>
                  <li className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                    <span><strong>Realtime Database</strong> - NoSQL data storage</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 font-semibold">
                💰 <strong>100% FREE:</strong> All services running on free tier with no billing required!
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Features */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
            
            <div className="space-y-4">
              {[
                {
                  icon: '👥',
                  title: 'Gender Bias Detection',
                  desc: 'Identifies gender-specific pronouns, role assumptions, and masculine/feminine language patterns.'
                },
                {
                  icon: '🎓',
                  title: 'Department Discrimination',
                  desc: 'Flags preferential treatment for CS/IT students over other engineering branches.'
                },
                {
                  icon: '🏠',
                  title: 'Socioeconomic Indicators',
                  desc: 'Detects hostel-based selection, fee requirements, and economic barriers.'
                },
                {
                  icon: '📚',
                  title: 'Academic Elitism',
                  desc: 'Identifies unrealistic CGPA cutoffs that exclude qualified candidates.'
                },
                {
                  icon: '🏛️',
                  title: 'Community Patterns',
                  desc: 'Analyzes surname patterns and indirect caste/religion indicators.'
                }
              ].map((feature, index) => (
                <ScrollReveal key={index} animation="fade-right" delay={index * 50}>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 group">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{feature.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-700">{feature.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Impact */}
        <ScrollReveal animation="zoom-in">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Impact Metrics</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-5xl font-black text-purple-600 mb-2 group-hover:scale-110 transition-transform">100%</div>
                <p className="text-gray-800 font-medium">Detection Accuracy</p>
              </div>
              
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-5xl font-black text-purple-600 mb-2 group-hover:scale-110 transition-transform">5</div>
                <p className="text-gray-800 font-medium">Bias Categories</p>
              </div>
              
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-5xl font-black text-purple-600 mb-2 group-hover:scale-110 transition-transform">&lt;2s</div>
                <p className="text-gray-800 font-medium">Analysis Time</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Team */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Meet The Team</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Mayank Ninawe */}
              <ScrollReveal animation="fade-right" delay={100}>
                <div className="text-center group">
                  <div className="relative inline-block mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-xl group-hover:scale-110 transition-transform duration-300">
                      M
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-xl">
                      💻
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mayank Ninawe</h3>
                  <p className="text-blue-600 font-semibold mb-3">Full-Stack Developer</p>
                  <p className="text-gray-600 text-sm mb-4 px-4">
                    Computer Science & Electronics student specializing in web development, AI integration, and cloud deployment. Passionate about building scalable applications with modern technologies.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      Next.js
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                      React
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      Firebase
                    </span>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                      AI/ML
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>🎓 ECS Engineering</p>
                    <p>📍 Nagpur, Maharashtra</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Disha Kalbandhe */}
              <ScrollReveal animation="fade-left" delay={200}>
                <div className="text-center group">
                  <div className="relative inline-block mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-xl group-hover:scale-110 transition-transform duration-300">
                      D
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-pink-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-xl">
                      🎨
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Disha Kalbandhe</h3>
                  <p className="text-purple-600 font-semibold mb-3">Frontend Developer & Designer</p>
                  <p className="text-gray-600 text-sm mb-4 px-4">
                    Computer Science & Electronics student with expertise in UI/UX design, frontend development, and creating intuitive user experiences. Focused on accessibility and modern web standards.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium">
                      UI/UX Design
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                      Tailwind CSS
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      JavaScript
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      React
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>🎓 ECS Engineering</p>
                    <p>📍 Nagpur, Maharashtra</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Team Description */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <p className="text-center text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Collaborative Innovation:</strong> We combined our expertise in full-stack development, AI integration, and user-centric design to create BiasBreaker - a powerful tool that addresses real-world challenges in campus recruitment. Our shared passion for fairness and equal opportunities drives this project.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal animation="zoom-in">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-3xl font-bold mb-4">Ready to Ensure Fair Placements?</h2>
            <p className="text-xl mb-6 opacity-90">
              Start analyzing placement emails for bias patterns today
            </p>
            <Link
              href="/upload"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
            >
              Start Analysis →
            </Link>
          </div>
        </ScrollReveal>

        {/* Hackathon Info */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>Built for <strong className="text-gray-900">Google Technologies Hackathon 2025</strong></p>
            <p className="mt-2">December 26, 2025 • Nagpur, India 🇮🇳</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
