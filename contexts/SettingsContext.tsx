import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  isDarkMode: boolean;
  showDecimals: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  defaultAngleUnit: 'degree' | 'radian';
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  triggerHaptic: () => void;
  formatNumber: (num: number) => string;
}

interface SettingsState {
  isDarkMode: boolean;
  showDecimals: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  defaultAngleUnit: 'degree' | 'radian';
}

const defaultSettings: SettingsState = {
  isDarkMode: true,
  showDecimals: true,
  vibrationEnabled: true,
  soundEnabled: false,
  defaultAngleUnit: 'degree'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Ayarları yükle
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('calculator_settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({
          isDarkMode: parsedSettings.isDarkMode ?? defaultSettings.isDarkMode,
          showDecimals: parsedSettings.showDecimals ?? defaultSettings.showDecimals,
          vibrationEnabled: parsedSettings.vibrationEnabled ?? defaultSettings.vibrationEnabled,
          soundEnabled: parsedSettings.soundEnabled ?? defaultSettings.soundEnabled,
          defaultAngleUnit: parsedSettings.defaultAngleUnit ?? defaultSettings.defaultAngleUnit,
        });
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<SettingsState>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      await AsyncStorage.setItem('calculator_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
    }
  };

  const triggerHaptic = () => {
    if (settings.vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatNumber = (num: number): string => {
    if (!settings.showDecimals) {
      return Math.round(num).toString();
    }
    
    // Çok küçük sayılar için bilimsel notasyon kullan
    if (Math.abs(num) > 0 && Math.abs(num) < 0.0001) {
      return num.toExponential(6);
    }
    
    // Çok büyük sayılar için bilimsel notasyon kullan
    if (Math.abs(num) > 999999999) {
      return num.toExponential(6);
    }
    
    // Normal sayılar için ondalık basamakları sınırla
    const formatted = parseFloat(num.toFixed(10)).toString();
    return formatted;
  };

  const contextValue: SettingsContextType = {
    ...settings,
    updateSettings,
    triggerHaptic,
    formatNumber,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
