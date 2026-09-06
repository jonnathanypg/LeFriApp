import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSizeLevel = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
  toggleHighContrast: () => void;
  cycleFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSizeLevel>(() => {
    return (localStorage.getItem('lefri_font_size') as FontSizeLevel) || 'normal';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('lefri_high_contrast') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('lefri_font_size', fontSize);
    const root = document.documentElement;
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    root.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('lefri_high_contrast', String(highContrast));
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast(!highContrast);

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        cycleFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
