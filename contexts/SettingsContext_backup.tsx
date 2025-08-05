import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const translations = {
  tr: {
    // Hesap Makinesi
    calculator: 'Hesap Makinesi',
    history: 'Geçmiş',
    clear: 'Temizle',
    noHistory: 'Henüz işlem geçmişi yok',
    copied: 'Kopyalandı',
    resultCopied: 'Sonuç panoya kopyalandı',
    error: 'Hata',
    copyFailed: 'Kopyalama işlemi başarısız',
    ok: 'Tamam',
    
    // Bilimsel Hesap Makinesi
    scientific: 'Bilimsel',
    scientificHistory: 'Bilimsel Geçmiş',
    degree: 'Derece',
    radian: 'Radyan',
    calculationError: 'Hesaplama Hatası',
    
    // Araçlar
    tools: 'Araçlar',
    currency: 'Döviz',
    unit: 'Birim',
    bmi: 'VKE',
    discount: 'İndirim',
    binary: 'Binary',
    base: 'Taban',
    
    // Settings
    settings: 'Ayarlar',
    appearance: 'Görünüm',
    darkMode: 'Karanlık Mod',
    darkModeDesc: 'Uygulamayı karanlık temada kullan',
    showDecimals: 'Ondalık Sayıları Göster',
    showDecimalsDesc: 'Sonuçlarda ondalık kısmı göster',
    language: 'Dil',
    languageDesc: 'Uygulama dili',
    calculation: 'Hesaplama',
    defaultAngleUnit: 'Varsayılan Açı Birimi',
    defaultAngleUnitDesc: 'Trigonometrik fonksiyonlar için',
    interaction: 'Etkileşim',
    vibration: 'Titreşim',
    vibrationDesc: 'Tuşlara basıldığında titreşim',
    dataManagement: 'Veri Yönetimi',
    clearHistory: 'Geçmişi Temizle',
    clearHistoryTitle: 'Geçmişi Temizle',
    clearHistoryDesc: 'Hesap makinesi geçmişini temizlemek istediğinizden emin misiniz?',
    clearScientificHistory: 'Bilimsel Geçmişi Temizle',
    clearScientificHistoryTitle: 'Bilimsel Geçmişi Temizle',
    clearScientificHistoryDesc: 'Bilimsel hesap makinesi geçmişini temizlemek istediğinizden emin misiniz?',
    resetSettings: 'Ayarları Sıfırla',
    resetSettingsTitle: 'Ayarları Sıfırla',
    resetSettingsDesc: 'Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?',
    cancel: 'İptal',
    reset: 'Sıfırla',
    historyCleared: 'Geçmiş temizlendi.',
    scientificHistoryCleared: 'Bilimsel geçmiş temizlendi.',
    settingsReset: 'Ayarlar sıfırlandı.',
    
    // Döviz Çevirici
    currencyConverter: 'Döviz Çevirici',
    amount: 'Miktar',
    from: 'Kimden',
    to: 'Kime',
    convertedAmount: 'Çevrilmiş Miktar',
    
    // Para Birimi Adları
    usdName: 'Amerikan Doları',
    eurName: 'Euro',
    tryName: 'Türk Lirası',
    gbpName: 'İngiliz Sterlini',
    jpyName: 'Japon Yeni',
    chfName: 'İsviçre Frangı',
    cadName: 'Kanada Doları',
    audName: 'Avustralya Doları',
    
    // Birim Adları
    meter: 'Metre',
    centimeter: 'Santimetre',
    kilometer: 'Kilometre',
    inch: 'İnç',
    feet: 'Feet',
    yard: 'Yard',
    
    // VKE Kategorileri
    underweight: 'Zayıf',
    normal: 'Normal',
    overweight: 'Fazla kilolu',
    obese: 'Obez',
    
    // Hata Mesajları
    enterValidAmount: 'Geçerli bir miktar girin',
    enterValidHeightWeight: 'Geçerli boy ve kilo değerleri girin',
    invalidNumberFormat: 'Geçersiz sayı formatı',
    enterValidValues: 'Geçerli değerler girin',
    exchangeRatesError: 'Döviz kurları yüklenemedi, lütfen tekrar deneyin',
    baseRangeError: 'Taban 2-36 arasında olmalı',
    conversionError: 'Dönüşüm hatası',
    
    // Diğer
    refresh: 'Yenile',
    exchangeRates: 'Döviz Kurları',
    dataSource: 'Veri Kaynağı: Avrupa Merkez Bankası',
    calculate: 'Hesapla',
    finalPrice: 'Son Fiyat',
    discountAmount: 'İndirim Tutarı',
    enterValue: 'Bir değer girin',
    hex: 'Hex',
  },
  en: {
    // Calculator
    calculator: 'Calculator',
    history: 'History',
    clear: 'Clear',
    noHistory: 'No calculation history yet',
    copied: 'Copied',
    resultCopied: 'Result copied to clipboard',
    error: 'Error',
    copyFailed: 'Copy operation failed',
    ok: 'OK',
    
    // Scientific Calculator
    scientific: 'Scientific',
    scientificHistory: 'Scientific History',
    degree: 'Degree',
    radian: 'Radian',
    calculationError: 'Calculation Error',
    
    // Tools
    tools: 'Tools',
    currency: 'Currency',
    unit: 'Unit',
    bmi: 'BMI',
    discount: 'Discount',
    binary: 'Binary',
    base: 'Base',
    
    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use the app in dark theme',
    showDecimals: 'Show Decimals',
    showDecimalsDesc: 'Show decimal places in results',
    language: 'Language',
    languageDesc: 'Application language',
    calculation: 'Calculation',
    defaultAngleUnit: 'Default Angle Unit',
    defaultAngleUnitDesc: 'For trigonometric functions',
    interaction: 'Interaction',
    vibration: 'Vibration',
    vibrationDesc: 'Vibrate when buttons are pressed',
    dataManagement: 'Data Management',
    clearHistory: 'Clear History',
    clearHistoryTitle: 'Clear History',
    clearHistoryDesc: 'Are you sure you want to clear the calculator history?',
    clearScientificHistory: 'Clear Scientific History',
    clearScientificHistoryTitle: 'Clear Scientific History',
    clearScientificHistoryDesc: 'Are you sure you want to clear the scientific calculator history?',
    resetSettings: 'Reset Settings',
    resetSettingsTitle: 'Reset Settings',
    resetSettingsDesc: 'Are you sure you want to reset all settings to default values?',
    cancel: 'Cancel',
    reset: 'Reset',
    historyCleared: 'History cleared.',
    scientificHistoryCleared: 'Scientific history cleared.',
    settingsReset: 'Settings reset.',
    
    // Currency Converter
    currencyConverter: 'Currency Converter',
    amount: 'Amount',
    from: 'From',
    to: 'To',
    convertedAmount: 'Converted Amount',
    
    // Currency Names
    usdName: 'US Dollar',
    eurName: 'Euro',
    tryName: 'Turkish Lira',
    gbpName: 'British Pound',
    jpyName: 'Japanese Yen',
    chfName: 'Swiss Franc',
    cadName: 'Canadian Dollar',
    audName: 'Australian Dollar',
    
    // Unit Names
    meter: 'Meter',
    centimeter: 'Centimeter',
    kilometer: 'Kilometer',
    inch: 'Inch',
    feet: 'Feet',
    yard: 'Yard',
    
    // BMI Categories
    underweight: 'Underweight',
    normal: 'Normal',
    overweight: 'Overweight',
    obese: 'Obese',
    
    // Error Messages
    enterValidAmount: 'Enter a valid amount',
    enterValidHeightWeight: 'Enter valid height and weight values',
    invalidNumberFormat: 'Invalid number format',
    enterValidValues: 'Enter valid values',
    exchangeRatesError: 'Exchange rates could not be loaded, please try again',
    baseRangeError: 'Base must be between 2-36',
    conversionError: 'Conversion error',
    
    // Other
    refresh: 'Refresh',
    exchangeRates: 'Exchange Rates',
    dataSource: 'Data Source: European Central Bank',
    calculate: 'Calculate',
    finalPrice: 'Final Price',
    discountAmount: 'Discount Amount',
    enterValue: 'Enter a value',
    hex: 'Hex',
  }
};

interface SettingsContextType {
  isDarkMode: boolean;
  showDecimals: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  defaultAngleUnit: 'degree' | 'radian';
  language: 'tr' | 'en';
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  triggerHaptic: () => void;
  formatNumber: (num: number) => string;
  addToHistory: (calculation: string, result: string) => void;
  getHistory: () => { calculation: string; result: string; timestamp: Date }[];
  clearHistory: () => void;
  addToScientificHistory: (calculation: string, result: string) => void;
  getScientificHistory: () => { calculation: string; result: string; timestamp: Date }[];
  clearScientificHistory: () => void;
  t: (key: string) => string;
}

interface SettingsState {
  isDarkMode: boolean;
  showDecimals: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  defaultAngleUnit: 'degree' | 'radian';
  language: 'tr' | 'en';
}

const defaultSettings: SettingsState = {
  isDarkMode: true,
  showDecimals: true,
  vibrationEnabled: true,
  soundEnabled: false,
  defaultAngleUnit: 'degree',
  language: 'tr'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [history, setHistory] = useState<{ calculation: string; result: string; timestamp: Date }[]>([]);
  const [scientificHistory, setScientificHistory] = useState<{ calculation: string; result: string; timestamp: Date }[]>([]);

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
          language: parsedSettings.language ?? defaultSettings.language,
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
      const rounded = Math.round(num);
      // Binlik ayracı ekle (1.000, 10.000 formatı)
      return rounded.toLocaleString('tr-TR');
    }
    
    // Çok küçük sayılar için bilimsel notasyon kullan
    if (Math.abs(num) > 0 && Math.abs(num) < 0.0001) {
      return num.toExponential(6);
    }
    
    // Çok büyük sayılar için bilimsel notasyon kullan
    if (Math.abs(num) > 999999999) {
      return num.toExponential(6);
    }
    
    // Normal sayılar için ondalık basamakları sınırla ve binlik ayracı ekle
    const formatted = parseFloat(num.toFixed(10));
    return formatted.toLocaleString('tr-TR');
  };

  // Normal hesap makinesi geçmişi
  const addToHistory = (calculation: string, result: string) => {
    const newEntry = { calculation, result, timestamp: new Date() };
    setHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Son 10 işlemi sakla
  };

  const getHistory = () => {
    return history;
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Bilimsel hesap makinesi geçmişi
  const addToScientificHistory = (calculation: string, result: string) => {
    const newEntry = { calculation, result, timestamp: new Date() };
    setScientificHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Son 10 işlemi sakla
  };

  const getScientificHistory = () => {
    return scientificHistory;
  };

  const clearScientificHistory = () => {
    setScientificHistory([]);
  };

  const t = (key: string): string => {
    const currentTranslations = translations[settings.language];
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  const contextValue: SettingsContextType = {
    ...settings,
    updateSettings,
    triggerHaptic,
    formatNumber,
    addToHistory,
    getHistory,
    clearHistory,
    addToScientificHistory,
    getScientificHistory,
    clearScientificHistory,
    t,
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
