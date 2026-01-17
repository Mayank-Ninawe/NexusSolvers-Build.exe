'use client'

export const setupKeyboardShortcuts = (router) => {
  if (typeof window === 'undefined') return;

  const handleKeyPress = (e) => {
    // Ignore if user is typing in input/textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    // Alt + U = Upload page
    if (e.altKey && e.key === 'u') {
      e.preventDefault();
      router.push('/upload');
    }

    // Alt + D = Dashboard
    if (e.altKey && e.key === 'd') {
      e.preventDefault();
      router.push('/dashboard');
    }

    // Alt + R = Reports
    if (e.altKey && e.key === 'r') {
      e.preventDefault();
      router.push('/reports');
    }

    // Alt + H = Home
    if (e.altKey && e.key === 'h') {
      e.preventDefault();
      router.push('/');
    }

    // Escape = Go back
    if (e.key === 'Escape') {
      window.history.back();
    }
  };

  document.addEventListener('keydown', handleKeyPress);

  return () => {
    document.removeEventListener('keydown', handleKeyPress);
  };
};
