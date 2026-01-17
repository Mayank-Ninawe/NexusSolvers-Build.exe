import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import RoleBasedNav from '@/components/shared/RoleBasedNav';
import Footer from '@/components/shared/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'BiasBreaker - AI-Powered Campus Placement Bias Detection',
  description: 'Detect and eliminate bias in campus placement processes using Google Gemini AI. Analyze recruitment emails for gender bias, department discrimination, and more with 100% accuracy.',
  keywords: ['bias detection', 'campus placement', 'AI', 'Gemini', 'recruitment', 'fairness', 'discrimination', 'equal opportunity'],
  authors: [{ name: 'Mayank Ninawe & Disha Kalbandhe' }],
  creator: 'BiasBreaker Team',
  publisher: 'BiasBreaker',
  
  // OpenGraph
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://biasbreaker.vercel.app',
    title: 'BiasBreaker - AI Campus Placement Bias Detection',
    description: 'Detect discrimination in placement emails using Google Gemini AI. Ensure fair opportunities for all students.',
    siteName: 'BiasBreaker',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'BiasBreaker - AI Campus Placement Bias Detection',
    description: 'Detect discrimination in placement emails using Google Gemini AI',
    creator: '@biasbreaker',
  },
  
  // Additional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Simple icons - comment out or remove until you create actual files
  // icons: {
  //   icon: '/favicon.ico',
  //   shortcut: '/favicon-16x16.png',
  //   apple: '/apple-touch-icon.png',
  // },
  
  // manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Simple emoji favicon as fallback */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {/* Role-based Navigation */}
          <RoleBasedNav />
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          {/* Main Content Area */}
          <main id="main-content" className="min-h-screen pt-16">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
