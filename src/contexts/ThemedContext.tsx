import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  inputBg: string;
  accent: string;
  border: string;
  muted: string;
};

type ThemeContextType = {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const lightColors: ThemeColors = {
  background: '#f0f2f5',
  card: '#ffffff',
  text: '#1F2937',
  inputBg: '#ffffff',
  accent: '#4285F4',
  border: '#d1d5db',
  muted: '#6b7280',
};

const darkColors: ThemeColors = {
  background: '#000000',
  card: '#1F2937',
  text: '#ffffff',
  inputBg: '#1e1e1e',
  accent: '#A78BFA',
  border: '#374151',
  muted: '#9ca3af',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(systemTheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    setTheme(systemTheme === 'dark' ? 'dark' : 'light');
  }, [systemTheme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => React.useContext(ThemeContext);