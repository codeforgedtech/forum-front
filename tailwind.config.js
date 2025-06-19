module.exports = {
    theme: {
      extend: {
        animation: {
          'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        },
        darkMode: 'class',
        keyframes: {
          pulseGlow: {
            '0%, 100%': { opacity: 1, boxShadow: '0 0 5px 2px rgba(239, 68, 68, 0.7)' },
            '50%': { opacity: 0.7, boxShadow: '0 0 15px 6px rgba(239, 68, 68, 1)' },
          },
        },
      },
    },
  };
  