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
    stock: 'Hisse',
    
    // Settings
    settings: 'Ayarlar',
    appearance: 'Görünüm',
    darkMode: 'Karanlık Mod',
    darkModeDesc: 'Uygulamayı karanlık temada kullan',
    highContrast: 'Yüksek Kontrast',
    highContrastDesc: 'Daha iyi görünürlük için yüksek kontrast modu',
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
    unitConverter: 'Birim Çevirici',
    bmiCalculator: 'VKE Hesaplayıcı',
    discountCalculator: 'İndirim Hesaplayıcı',
    binaryConverter: 'Binary Çevirici',
    baseConverter: 'Taban Çevirici',
    stockCalculator: 'Hisse Tavan-Taban',
    convert: 'Çevir',
    amount: 'Miktar',
    enterAmount: 'Miktar girin',
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
    sekName: 'İsveç Kronu',
    nokName: 'Norveç Kronu',
    dkkName: 'Danimarka Kronu',
    plnName: 'Polonya Zlotisi',
    czkName: 'Çek Kronu',
    hufName: 'Macar Forinti',
    rubName: 'Rus Rublesi',
    cnyName: 'Çin Yuanı',
    inrName: 'Hindistan Rupisi',
    krwName: 'Güney Kore Wonu',
    sgdName: 'Singapur Doları',
    hkdName: 'Hong Kong Doları',
    mxnName: 'Meksika Pezosu',
    brlName: 'Brezilya Reali',
    zarName: 'Güney Afrika Randı',
    nzdName: 'Yeni Zelanda Doları',
    ilsName: 'İsrail Şekeli',
    thbName: 'Tayland Bahtı',
    myrName: 'Malezya Ringgiti',
    phpName: 'Filipin Pezosu',
    idrName: 'Endonezya Rupiahı',
    sarName: 'Suudi Arabistan Riyali',
    aedName: 'BAE Dirhemi',
    egpName: 'Mısır Paundu',
    qarName: 'Katar Riyali',
    kwdName: 'Kuveyt Dinarı',
    bhdName: 'Bahreyn Dinarı',
    omrName: 'Umman Riyali',
    jodName: 'Ürdün Dinarı',
    lbpName: 'Lübnan Paundu',
    
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
    
    // BMI ve İndirim
    height: 'Boy (cm)',
    weight: 'Kilo (kg)',
    originalPrice: 'Orijinal Fiyat',
    discountPercent: 'İndirim Yüzdesi (%)',
    discountPercentage: 'İndirim Yüzdesi (%)',
    
    // Hata Mesajları
    enterValidAmount: 'Geçerli bir miktar girin',
    enterValidHeightWeight: 'Geçerli boy ve kilo değerleri girin',
    invalidNumberFormat: 'Geçersiz sayı formatı',
    enterValidValues: 'Geçerli değerler girin',
    exchangeRatesError: 'Döviz kurları yüklenemedi, lütfen tekrar deneyin',
    baseRangeError: 'Taban 2-36 arasında olmalı',
    conversionError: 'Dönüşüm hatası',
    
    // Hisse Tavan-Taban Hesaplayıcı
    stockName: 'Hisse Adı',
    stockPrice: 'Hisse Fiyatı',
    stockQuantity: 'Hisse Adedi',
    ceilingPrice: 'Tavan Fiyatı',
    floorPrice: 'Taban Fiyatı',
    dailyLimit: 'Günlük Limit',
    calculateStock: 'Hesapla',
    enterValidStock: 'Geçerli hisse fiyatı ve adedi girin',
    analysis: 'Analiz',
    price: 'Fiyat',
    quantity: 'Adet',
    capital: 'Sermaye',
    ceilingLevels: 'TAVAN SEVİYELERİ',
    floorLevels: 'TABAN SEVİYELERİ',
    
    // Diğer
    refresh: 'Yenile',
    exchangeRates: 'Döviz Kurları',
    dataSource: 'Veri Kaynağı: Avrupa Merkez Bankası',
    calculate: 'Hesapla',
    finalPrice: 'Son Fiyat',
    discountAmount: 'İndirim Tutarı',
    enterValue: 'Bir değer girin',
    hex: 'Hex',
    
    // Binary ve Base Converter
    numberToConvert: 'Çevrilecek Sayı',
    sourceBase: 'Kaynak Taban',
    targetBase: 'Hedef Taban',
    decimal: 'Ondalık',
    octal: 'Sekizlik',
    
    // Not Ekleme
    addNote: 'Not Ekle',
    note: 'Not',
    notes: 'Notlar',
    editNote: 'Notu Düzenle',
    deleteNote: 'Notu Sil',
    saveNote: 'Notu Kaydet',
    noteAdded: 'Not eklendi',
    noteUpdated: 'Not güncellendi',
    noteDeleted: 'Not silindi',
    enterNote: 'Notunuzu girin',
    noNoteText: 'Bu hesaplama için not yok',
    deleteNoteConfirm: 'Bu notu silmek istediğinizden emin misiniz?',
    noteHint: 'Bu sonuca not ekleyebilirsiniz',
    
    // Tarih Hesaplayıcı
    dateCalculator: 'Tarih Hesaplayıcı',
    startDate: 'Başlangıç Tarihi',
    endDate: 'Bitiş Tarihi',
    calculateDays: 'Gün Hesapla',
    daysBetween: 'Aralarındaki Gün',
    addDays: 'Gün Ekle',
    subtractDays: 'Gün Çıkar',
    daysToAdd: 'Eklenecek Gün Sayısı',
    resultDate: 'Sonuç Tarihi',
    enterStartDate: 'Başlangıç (GG.AA.YYYY)',
    enterEndDate: 'Bitiş (GG.AA.YYYY)',
    enterValidDates: 'Geçerli tarihler girin',
    enterDaysCount: 'Gün sayısı girin',
    dateInPast: 'Tarih geçmişte',
    dateInFuture: 'Tarih gelecekte',
    today: 'Bugün',
    day: 'gün',
    days: 'gün',
    year: 'yıl',
    years: 'yıl',
    month: 'ay',
    months: 'ay',
    week: 'hafta',
    weeks: 'hafta',
    detailed: 'Detaylı',
    dateStatus: 'Tarih Durumu',
    weekDisplay: 'Hafta',
    
    // Uygulama Bilgileri
    application: 'Uygulama',
    developer: 'Geliştirici: Nova Orion',
    success: 'Başarılı',
    rateApp: 'Uygulamayı Oyla',
    rateAppDesc: 'Play Store\'da beğenin ve yıldız verin',
    moreApps: 'Diğer Uygulamalarım',
    moreAppsDesc: 'Geliştirici sayfasına göz atın',
    
    // Temalar
    theme: 'Tema',
    themeDesc: 'Renk teması seçin',
    themeNone: 'Hiçbiri',
    themeDefault: 'Varsayılan',
    themeOcean: 'Okyanus',
    themeForest: 'Orman',
    themeSunset: 'Gün Batımı',
    themePurple: 'Mor',
    themeRose: 'Gül',
    themeMidnight: 'Gece Yarısı',
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
    stock: 'Stock',
    
    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use the app in dark theme',
    highContrast: 'High Contrast',
    highContrastDesc: 'High contrast mode for better visibility',
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
    unitConverter: 'Unit Converter',
    bmiCalculator: 'BMI Calculator',
    discountCalculator: 'Discount Calculator',
    binaryConverter: 'Binary Converter',
    baseConverter: 'Base Converter',
    stockCalculator: 'Stock Ceiling-Floor',
    convert: 'Convert',
    amount: 'Amount',
    enterAmount: 'Enter amount',
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
    sekName: 'Swedish Krona',
    nokName: 'Norwegian Krone',
    dkkName: 'Danish Krone',
    plnName: 'Polish Zloty',
    czkName: 'Czech Koruna',
    hufName: 'Hungarian Forint',
    rubName: 'Russian Ruble',
    cnyName: 'Chinese Yuan',
    inrName: 'Indian Rupee',
    krwName: 'South Korean Won',
    sgdName: 'Singapore Dollar',
    hkdName: 'Hong Kong Dollar',
    mxnName: 'Mexican Peso',
    brlName: 'Brazilian Real',
    zarName: 'South African Rand',
    nzdName: 'New Zealand Dollar',
    ilsName: 'Israeli Shekel',
    thbName: 'Thai Baht',
    myrName: 'Malaysian Ringgit',
    phpName: 'Philippine Peso',
    idrName: 'Indonesian Rupiah',
    sarName: 'Saudi Riyal',
    aedName: 'UAE Dirham',
    egpName: 'Egyptian Pound',
    qarName: 'Qatari Riyal',
    kwdName: 'Kuwaiti Dinar',
    bhdName: 'Bahraini Dinar',
    omrName: 'Omani Rial',
    jodName: 'Jordanian Dinar',
    lbpName: 'Lebanese Pound',
    
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
    
    // BMI and Discount
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    originalPrice: 'Original Price',
    discountPercent: 'Discount Percent (%)',
    discountPercentage: 'Discount Percentage (%)',
    
    // Error Messages
    enterValidAmount: 'Enter a valid amount',
    enterValidHeightWeight: 'Enter valid height and weight values',
    invalidNumberFormat: 'Invalid number format',
    enterValidValues: 'Enter valid values',
    exchangeRatesError: 'Exchange rates could not be loaded, please try again',
    baseRangeError: 'Base must be between 2-36',
    conversionError: 'Conversion error',
    
    // Stock Ceiling-Floor Calculator
    stockName: 'Stock Name',
    stockPrice: 'Stock Price',
    stockQuantity: 'Stock Quantity',
    ceilingPrice: 'Ceiling Price',
    floorPrice: 'Floor Price',
    dailyLimit: 'Daily Limit',
    calculateStock: 'Calculate',
    enterValidStock: 'Enter valid stock price and quantity',
    analysis: 'Analysis',
    price: 'Price',
    quantity: 'Quantity',
    capital: 'Capital',
    ceilingLevels: 'CEILING LEVELS',
    floorLevels: 'FLOOR LEVELS',
    
    // Other
    refresh: 'Refresh',
    exchangeRates: 'Exchange Rates',
    dataSource: 'Data Source: European Central Bank',
    calculate: 'Calculate',
    finalPrice: 'Final Price',
    discountAmount: 'Discount Amount',
    enterValue: 'Enter a value',
    hex: 'Hex',
    
    // Binary and Base Converter
    numberToConvert: 'Number to Convert',
    sourceBase: 'Source Base',
    targetBase: 'Target Base',
    decimal: 'Decimal',
    octal: 'Octal',
    
    // Note Adding
    addNote: 'Add Note',
    note: 'Note',
    notes: 'Notes',
    editNote: 'Edit Note',
    deleteNote: 'Delete Note',
    saveNote: 'Save Note',
    noteAdded: 'Note added',
    noteUpdated: 'Note updated',
    noteDeleted: 'Note deleted',
    enterNote: 'Enter your note',
    noNoteText: 'No note for this calculation',
    deleteNoteConfirm: 'Are you sure you want to delete this note?',
    noteHint: 'You can add a note to this result',
    
    // Date Calculator
    dateCalculator: 'Date Calculator',
    startDate: 'Start Date',
    endDate: 'End Date',
    calculateDays: 'Calculate Days',
    daysBetween: 'Days Between',
    addDays: 'Add Days',
    subtractDays: 'Subtract Days',
    daysToAdd: 'Number of Days to Add',
    resultDate: 'Result Date',
    enterStartDate: 'Start (DD.MM.YYYY)',
    enterEndDate: 'End (DD.MM.YYYY)',
    enterValidDates: 'Enter valid dates',
    enterDaysCount: 'Enter number of days',
    dateInPast: 'Date is in the past',
    dateInFuture: 'Date is in the future',
    today: 'Today',
    day: 'day',
    days: 'days',
    year: 'year',
    years: 'years',
    month: 'month',
    months: 'months',
    week: 'week',
    weeks: 'weeks',
    detailed: 'Detailed',
    dateStatus: 'Date Status',
    weekDisplay: 'Week',
    
    // Application Information
    application: 'Application',
    developer: 'Developer: Nova Orion',
    success: 'Success',
    rateApp: 'Rate App',
    rateAppDesc: 'Rate and review us on Play Store',
    moreApps: 'More Apps',
    moreAppsDesc: 'Check out developer page',
    
    // Themes
    theme: 'Theme',
    themeDesc: 'Choose color theme',
    themeNone: 'None',
    themeDefault: 'Default',
    themeOcean: 'Ocean',
    themeForest: 'Forest',
    themeSunset: 'Sunset',
    themePurple: 'Purple',
    themeRose: 'Rose',
    themeMidnight: 'Midnight',
  }
};

interface SettingsContextType {
  isDarkMode: boolean;
  showDecimals: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  defaultAngleUnit: 'degree' | 'radian';
  language: 'tr' | 'en';
  highContrast: boolean;
  theme: 'none' | 'default' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'midnight';
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  triggerHaptic: () => void;
  formatNumber: (num: number) => string;
  addToHistory: (calculation: string, result: string) => void;
  getHistory: () => { calculation: string; result: string; timestamp: Date; note?: string }[];
  clearHistory: () => void;
  addToScientificHistory: (calculation: string, result: string) => void;
  getScientificHistory: () => { calculation: string; result: string; timestamp: Date; note?: string }[];
  clearScientificHistory: () => void;
  addNoteToHistory: (index: number, note: string) => void;
  updateNoteInHistory: (index: number, note: string) => void;
  deleteNoteFromHistory: (index: number) => void;
  addNoteToScientificHistory: (index: number, note: string) => void;
  updateNoteInScientificHistory: (index: number, note: string) => void;
  deleteNoteFromScientificHistory: (index: number) => void;
  t: (key: string) => string;
  getThemeColors: () => ThemeColors;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface SettingsState {
  isDarkMode: boolean;
  showDecimals: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  defaultAngleUnit: 'degree' | 'radian';
  language: 'tr' | 'en';
  highContrast: boolean;
  theme: 'none' | 'default' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'midnight';
}

const defaultSettings: SettingsState = {
  isDarkMode: true,
  showDecimals: true,
  vibrationEnabled: true,
  soundEnabled: false,
  defaultAngleUnit: 'degree',
  language: 'tr',
  highContrast: false,
  theme: 'default'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [history, setHistory] = useState<{ calculation: string; result: string; timestamp: Date; note?: string }[]>([]);
  const [scientificHistory, setScientificHistory] = useState<{ calculation: string; result: string; timestamp: Date; note?: string }[]>([]);

  // Ayarları ve geçmişi yükle
  useEffect(() => {
    loadSettings();
    loadHistory();
    loadScientificHistory();
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
          highContrast: parsedSettings.highContrast ?? defaultSettings.highContrast,
          theme: parsedSettings.theme ?? defaultSettings.theme,
        });
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('calculator_history');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // timestamp'leri Date objesine çevir
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Geçmiş yüklenirken hata:', error);
    }
  };

  const loadScientificHistory = async () => {
    try {
      const storedScientificHistory = await AsyncStorage.getItem('calculator_scientific_history');
      if (storedScientificHistory) {
        const parsedScientificHistory = JSON.parse(storedScientificHistory);
        // timestamp'leri Date objesine çevir
        const historyWithDates = parsedScientificHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setScientificHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Bilimsel geçmiş yüklenirken hata:', error);
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
  const addToHistory = async (calculation: string, result: string) => {
    const newEntry = { calculation, result, timestamp: new Date() };
    const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Son 10 işlemi sakla
    setHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Geçmiş kaydedilirken hata:', error);
    }
  };

  const getHistory = () => {
    return history;
  };

  const clearHistory = async () => {
    setHistory([]);
    try {
      await AsyncStorage.removeItem('calculator_history');
    } catch (error) {
      console.error('Geçmiş temizlenirken hata:', error);
    }
  };

  // Bilimsel hesap makinesi geçmişi
  const addToScientificHistory = async (calculation: string, result: string) => {
    const newEntry = { calculation, result, timestamp: new Date() };
    const updatedHistory = [newEntry, ...scientificHistory.slice(0, 9)]; // Son 10 işlemi sakla
    setScientificHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_scientific_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Bilimsel geçmiş kaydedilirken hata:', error);
    }
  };

  const getScientificHistory = () => {
    return scientificHistory;
  };

  const clearScientificHistory = async () => {
    setScientificHistory([]);
    try {
      await AsyncStorage.removeItem('calculator_scientific_history');
    } catch (error) {
      console.error('Bilimsel geçmiş temizlenirken hata:', error);
    }
  };

  // Not yönetimi fonksiyonları
  const addNoteToHistory = async (index: number, note: string) => {
    const updatedHistory = history.map((item, i) => 
      i === index ? { ...item, note } : item
    );
    setHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Not eklenirken hata:', error);
    }
  };

  const updateNoteInHistory = async (index: number, note: string) => {
    const updatedHistory = history.map((item, i) => 
      i === index ? { ...item, note } : item
    );
    setHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Not güncellenirken hata:', error);
    }
  };

  const deleteNoteFromHistory = async (index: number) => {
    const updatedHistory = history.map((item, i) => 
      i === index ? { ...item, note: undefined } : item
    );
    setHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Not silinirken hata:', error);
    }
  };

  // Bilimsel hesap makinesi not yönetimi fonksiyonları
  const addNoteToScientificHistory = async (index: number, note: string) => {
    const updatedHistory = scientificHistory.map((item, i) => 
      i === index ? { ...item, note } : item
    );
    setScientificHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_scientific_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Bilimsel not eklenirken hata:', error);
    }
  };

  const updateNoteInScientificHistory = async (index: number, note: string) => {
    const updatedHistory = scientificHistory.map((item, i) => 
      i === index ? { ...item, note } : item
    );
    setScientificHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_scientific_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Bilimsel not güncellenirken hata:', error);
    }
  };

  const deleteNoteFromScientificHistory = async (index: number) => {
    const updatedHistory = scientificHistory.map((item, i) => 
      i === index ? { ...item, note: undefined } : item
    );
    setScientificHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem('calculator_scientific_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Bilimsel not silinirken hata:', error);
    }
  };

  const t = (key: string): string => {
    const currentTranslations = translations[settings.language];
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  const getThemeColors = (): ThemeColors => {
    const { theme, isDarkMode, highContrast } = settings;
    
    // Eğer "Hiçbiri" seçiliyse, normal karanlık/açık tema renklerini döndür
    if (theme === 'none') {
      if (isDarkMode) {
        return {
          primary: '#ff9500',                    // Turuncu eşittir butonu
          secondary: highContrast ? '#a0a0a0' : '#757575',  // Orta gri fonksiyon butonları
          accent: highContrast ? '#d0d0d0' : '#c0c0c0',     // Açık gri AC/parantez butonları
          background: highContrast ? '#000000' : '#1c1c1c', // Siyah arkaplan
          surface: highContrast ? '#2a2a2a' : '#404040',    // Koyu gri sayı butonları
          text: '#ffffff',                       // Beyaz metin
          textSecondary: highContrast ? '#e0e0e0' : '#999999', // Gri ikincil metin
        };
      } else {
        return {
          primary: '#ff9500',                    // Turuncu eşittir butonu
          secondary: highContrast ? '#5c5c5c' : '#757575',  // Orta gri fonksiyon butonları
          accent: highContrast ? '#a8a8a8' : '#c0c0c0',     // Açık gri AC/parantez butonları
          background: highContrast ? '#ffffff' : '#f0f0f0', // Beyaz/açık gri arkaplan
          surface: highContrast ? '#e8e8e8' : '#ffffff',    // Beyaz sayı butonları
          text: '#000000',                       // Siyah metin
          textSecondary: highContrast ? '#333333' : '#666666', // Gri ikincil metin
        };
      }
    }
    
    // Tema renk paletleri
    const themes = {
      default: {
        light: {
          primary: '#ff9500',
          secondary: '#007AFF',
          accent: '#ffb300',
          background: '#f5f5f5',
          surface: '#ffffff',
          text: '#000000',
          textSecondary: '#666666',
        },
        dark: {
          primary: '#ff9500',
          secondary: '#0A84FF',
          accent: '#ffb300',
          background: '#181818',
          surface: '#232323',
          text: '#ffffff',
          textSecondary: '#bbbbbb',
        }
      },
      ocean: {
        light: {
          primary: '#0077BE',
          secondary: '#00A8E8',
          accent: '#00C9FF',
          background: '#E8F4F8',
          surface: '#ffffff',
          text: '#003459',
          textSecondary: '#4A6FA5',
        },
        dark: {
          primary: '#00A8E8',
          secondary: '#0077BE',
          accent: '#00C9FF',
          background: '#001D3D',
          surface: '#003459',
          text: '#E8F4F8',
          textSecondary: '#80B5D8',
        }
      },
      forest: {
        light: {
          primary: '#2D6A4F',
          secondary: '#40916C',
          accent: '#52B788',
          background: '#E8F5E9',
          surface: '#ffffff',
          text: '#1B4332',
          textSecondary: '#52796F',
        },
        dark: {
          primary: '#52B788',
          secondary: '#40916C',
          accent: '#74C69D',
          background: '#081C15',
          surface: '#1B4332',
          text: '#D8F3DC',
          textSecondary: '#95D5B2',
        }
      },
      sunset: {
        light: {
          primary: '#FF6B35',
          secondary: '#F7931E',
          accent: '#FFB84D',
          background: '#FFF5E6',
          surface: '#ffffff',
          text: '#5C2E00',
          textSecondary: '#8B4513',
        },
        dark: {
          primary: '#FF6B35',
          secondary: '#F7931E',
          accent: '#FFB84D',
          background: '#1A0F00',
          surface: '#2E1A00',
          text: '#FFE5CC',
          textSecondary: '#FFB84D',
        }
      },
      purple: {
        light: {
          primary: '#7209B7',
          secondary: '#B5179E',
          accent: '#F72585',
          background: '#F0E6FF',
          surface: '#ffffff',
          text: '#3C096C',
          textSecondary: '#6A4C93',
        },
        dark: {
          primary: '#B5179E',
          secondary: '#7209B7',
          accent: '#F72585',
          background: '#10002B',
          surface: '#240046',
          text: '#E0AAFF',
          textSecondary: '#C77DFF',
        }
      },
      rose: {
        light: {
          primary: '#E63946',
          secondary: '#F4A7BB',
          accent: '#FF8FA3',
          background: '#FFF0F3',
          surface: '#ffffff',
          text: '#590D22',
          textSecondary: '#A4133C',
        },
        dark: {
          primary: '#FF8FA3',
          secondary: '#E63946',
          accent: '#F4A7BB',
          background: '#1A0005',
          surface: '#2E0011',
          text: '#FFE5EC',
          textSecondary: '#FFCCD5',
        }
      },
      midnight: {
        light: {
          primary: '#2C3E50',
          secondary: '#34495E',
          accent: '#5DADE2',
          background: '#ECF0F1',
          surface: '#ffffff',
          text: '#1C2833',
          textSecondary: '#566573',
        },
        dark: {
          primary: '#5DADE2',
          secondary: '#85C1E9',
          accent: '#AED6F1',
          background: '#0B0C10',
          surface: '#1F2833',
          text: '#C5C6C7',
          textSecondary: '#8B9296',
        }
      }
    };
    
    return themes[theme][isDarkMode ? 'dark' : 'light'];
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
    addNoteToHistory,
    updateNoteInHistory,
    deleteNoteFromHistory,
    addNoteToScientificHistory,
    updateNoteInScientificHistory,
    deleteNoteFromScientificHistory,
    t,
    getThemeColors,
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
