import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { setStringAsync } from "expo-clipboard";
import { useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "../../contexts/SettingsContext";

export default function ToolsScreen() {
  const {
    isDarkMode,
    triggerHaptic,
    formatNumber,
    t,
    language,
    getThemeColors,
    currency,
    setCurrency,
  } = useSettings();
  const themeColors = getThemeColors();
  const navigation = useNavigation();

  const [selectedTool, setSelectedTool] = useState("currency");
  const [amount, setAmount] = useState("");
  const [amount2, setAmount2] = useState(""); // BMI için kilo
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Döviz için
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("TRY");
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(
    {},
  );

  // Birim çevirici için
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("centimeter");

  // İndirim hesaplayıcı için
  const [discountPercent, setDiscountPercent] = useState("");

  // Hisse tavan-taban hesaplayıcı için
  const [stockName, setStockName] = useState("");

  // Tarih hesaplayıcı için
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysBetweenResult, setDaysBetweenResult] = useState("");
  const [addDaysResult, setAddDaysResult] = useState("");
  const [subtractDaysResult, setSubtractDaysResult] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockResults, setStockResults] = useState<any>(null);

  // Binary/Base converter için
  const [binaryInput, setBinaryInput] = useState("");
  const [baseFrom, setBaseFrom] = useState("10"); // Decimal
  const [baseTo, setBaseTo] = useState("2"); // Binary

  // Yeni araçlar için
  const [kdvRateState, setKdvRateState] = useState("20");
  const [loanInterest, setLoanInterest] = useState("");
  const [loanTermInput, setLoanTermInput] = useState("");
  const [tipPeople, setTipPeople] = useState("");

  // Alış maliyeti hesaplayıcı için
  const [costMode, setCostMode] = useState<"fromRate" | "fromPrices">("fromRate");
  const [costCurrentPrice, setCostCurrentPrice] = useState("");
  const [costRate, setCostRate] = useState("");
  const [costIsProfit, setCostIsProfit] = useState(true);
  const [costQuantity, setCostQuantity] = useState("");
  const [costBuyPrice, setCostBuyPrice] = useState("");

  // Stopaj hesaplayıcı için (3 modlu)
  const [stopajMode, setStopajMode] = useState<
    "fromBalanceProfit" | "fromProfit" | "fromBuySell"
  >("fromBalanceProfit");
  const [stopajTotalBalance, setStopajTotalBalance] = useState("");
  const [stopajProfitPortion, setStopajProfitPortion] = useState("");
  const [stopajProfit, setStopajProfit] = useState("");
  const [stopajRate, setStopajRate] = useState("17.5");
  const [stopajBuyAmount, setStopajBuyAmount] = useState("");
  const [stopajSellAmount, setStopajSellAmount] = useState("");

  // Sonuç kartı ve kopyalama
  const [analysisCard, setAnalysisCard] = useState<{
    title: string;
    heroLabel: string;
    heroValue: string;
    subHero?: string;
    rows: {
      label: string;
      value: string;
      isProfit?: boolean;
      isLoss?: boolean;
    }[];
    rawText: string;
  } | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedToastText, setCopiedToastText] = useState("");

  type ToolCategory = "all" | "favorites" | "finance" | "converter" | "life";

  interface ToolItem {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ComponentProps<typeof FontAwesome>["name"];
    category: "finance" | "converter" | "life";
  }

  const allToolItems: ToolItem[] = [
    {
      id: "currency",
      title: t("currency"),
      subtitle: t("currencyConverter"),
      icon: "money",
      category: "finance",
    },
    {
      id: "stopaj",
      title: t("stopaj"),
      subtitle: t("stopajCalculator"),
      icon: "pie-chart",
      category: "finance",
    },
    {
      id: "cost",
      title: t("cost"),
      subtitle: t("costCalculator"),
      icon: "tags",
      category: "finance",
    },
    {
      id: "kdv",
      title: t("kdv"),
      subtitle: t("kdvCalculator"),
      icon: "file-text-o",
      category: "finance",
    },
    {
      id: "loan",
      title: t("loan"),
      subtitle: t("loanCalculator"),
      icon: "credit-card",
      category: "finance",
    },
    {
      id: "discount",
      title: t("discount"),
      subtitle: t("discountCalculator"),
      icon: "percent",
      category: "finance",
    },
    {
      id: "stock",
      title: t("stock"),
      subtitle: t("stockCalculator"),
      icon: "line-chart",
      category: "finance",
    },
    {
      id: "unit",
      title: t("unit"),
      subtitle: t("unitConverter"),
      icon: "arrows-h",
      category: "converter",
    },
    {
      id: "binary",
      title: t("binary"),
      subtitle: t("binaryConverter"),
      icon: "code",
      category: "converter",
    },
    {
      id: "base",
      title: t("base"),
      subtitle: t("baseConverter"),
      icon: "calculator",
      category: "converter",
    },
    {
      id: "date",
      title: t("date"),
      subtitle: t("dateCalculator"),
      icon: "calendar",
      category: "life",
    },
    {
      id: "age",
      title: t("age"),
      subtitle: t("ageCalculator"),
      icon: "birthday-cake",
      category: "life",
    },
    {
      id: "bmi",
      title: t("bmi"),
      subtitle: t("bmiCalculator"),
      icon: "heart",
      category: "life",
    },
    {
      id: "tip",
      title: t("tip"),
      subtitle: t("tipCalculator"),
      icon: "cutlery",
      category: "life",
    },
  ];

  const categories: {
    id: ToolCategory;
    title: string;
    icon: React.ComponentProps<typeof FontAwesome>["name"];
  }[] = [
    { id: "all", title: t("categoryAll"), icon: "th" },
    { id: "favorites", title: t("favorites"), icon: "star" },
    { id: "finance", title: t("categoryFinance"), icon: "line-chart" },
    { id: "converter", title: t("categoryConverter"), icon: "exchange" },
    { id: "life", title: t("categoryLife"), icon: "heartbeat" },
  ];

  const toolScrollRef = useRef<ScrollView>(null);
  const modalGridScrollRef = useRef<ScrollView>(null);

  const [favoriteTools, setFavoriteTools] = useState<string[]>([
    "currency",
    "stopaj",
    "cost",
    "kdv",
  ]);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("all");
  const [isGridModalVisible, setIsGridModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    toolScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [activeCategory]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await AsyncStorage.getItem("@smartcalc_favorite_tools");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFavoriteTools(parsed);
          }
        }
      } catch (e) {
        console.log("Error loading favorite tools", e);
      }
    };
    loadFavorites();
  }, []);

  const toggleFavorite = async (toolId: string) => {
    triggerHaptic();
    let updated: string[];
    const isFav = favoriteTools.includes(toolId);
    if (isFav) {
      updated = favoriteTools.filter((id) => id !== toolId);
      setCopiedToastText(t("favoriteRemoved"));
      if (activeCategory === "favorites" && selectedTool === toolId) {
        if (updated.length > 0) {
          switchTool(updated[0]);
        }
      }
    } else {
      updated = [...favoriteTools, toolId];
      setCopiedToastText(t("favoriteAdded"));
    }
    setFavoriteTools(updated);
    setCopiedToast(true);
    setTimeout(() => {
      setCopiedToast(false);
    }, 1800);
    try {
      await AsyncStorage.setItem(
        "@smartcalc_favorite_tools",
        JSON.stringify(updated),
      );
    } catch (e) {
      console.log("Error saving favorite tools", e);
    }
  };

  const switchTool = (toolId: string) => {
    triggerHaptic();
    setSelectedTool(toolId);
    setResult("");
    setAnalysisCard(null);
    setCopiedToast(false);
    setCopiedKey(null);
    setCopiedToastText("");
    setAmount("");
    setAmount2("");
    setStockName("");
    setStockPrice("");
    setStockQuantity("");
    setStockResults(null);
    setBinaryInput("");
    setStartDate("");
    setEndDate("");
    setDaysBetweenResult("");
    setAddDaysResult("");
    setSubtractDaysResult("");
    setKdvRateState("20");
    setLoanInterest("");
    setLoanTermInput("");
    setTipPeople("");
    setCostMode("fromRate");
    setCostCurrentPrice("");
    setCostRate("");
    setCostIsProfit(true);
    setCostQuantity("");
    setCostBuyPrice("");
    setStopajMode("fromBalanceProfit");
    setStopajTotalBalance("");
    setStopajProfitPortion("");
    setStopajProfit("");
    setStopajRate("17.5");
    setStopajBuyAmount("");
    setStopajSellAmount("");
  };

  const handleCategoryChange = (newCat: ToolCategory) => {
    triggerHaptic();
    setActiveCategory(newCat);

    // Yeni kategorideki araçları hesapla
    const toolsInCat = allToolItems.filter((tool) => {
      if (newCat === "all") return true;
      if (newCat === "favorites") return favoriteTools.includes(tool.id);
      return tool.category === newCat;
    });

    // Eğer şu anki seçili araç bu kategoride yoksa, otomatik olarak bu kategorinin ilk aracını seç
    if (toolsInCat.length > 0 && !toolsInCat.some((t) => t.id === selectedTool)) {
      switchTool(toolsInCat[0].id);
    }

    // Yatay araç listesini en başa sıfırla
    toolScrollRef.current?.scrollTo({ x: 0, animated: true });
  };

  const filteredTools = allToolItems.filter((tool) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "favorites") return favoriteTools.includes(tool.id);
    return tool.category === activeCategory;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    const aFav = favoriteTools.includes(a.id);
    const bFav = favoriteTools.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const gridModalFilteredTools = allToolItems
    .filter((tool) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.subtitle.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (activeCategory === "all") return true;
      if (activeCategory === "favorites") return favoriteTools.includes(tool.id);
      return tool.category === activeCategory;
    })
    .sort((a, b) => {
      const aFav = favoriteTools.includes(a.id);
      const bFav = favoriteTools.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  const getCurrencies = () => {
    // API'den gelen para birimlerine göre filtreleme yap
    const availableCurrencies = [
      { label: "USD", value: "USD", fullName: t("usdName") },
      { label: "EUR", value: "EUR", fullName: t("eurName") },
      { label: "TRY", value: "TRY", fullName: t("tryName") },
      { label: "GBP", value: "GBP", fullName: t("gbpName") },
      { label: "JPY", value: "JPY", fullName: t("jpyName") },
      { label: "CHF", value: "CHF", fullName: t("chfName") },
      { label: "CAD", value: "CAD", fullName: t("cadName") },
      { label: "AUD", value: "AUD", fullName: t("audName") },
      { label: "SEK", value: "SEK", fullName: t("sekName") },
      { label: "NOK", value: "NOK", fullName: t("nokName") },
      { label: "DKK", value: "DKK", fullName: t("dkkName") },
      { label: "PLN", value: "PLN", fullName: t("plnName") },
      { label: "CZK", value: "CZK", fullName: t("czkName") },
      { label: "HUF", value: "HUF", fullName: t("hufName") },
      { label: "CNY", value: "CNY", fullName: t("cnyName") },
      { label: "INR", value: "INR", fullName: t("inrName") },
      { label: "KRW", value: "KRW", fullName: t("krwName") },
      { label: "SGD", value: "SGD", fullName: t("sgdName") },
      { label: "HKD", value: "HKD", fullName: t("hkdName") },
      { label: "MXN", value: "MXN", fullName: t("mxnName") },
      { label: "BRL", value: "BRL", fullName: t("brlName") },
      { label: "ZAR", value: "ZAR", fullName: t("zarName") },
      { label: "NZD", value: "NZD", fullName: t("nzdName") },
      { label: "ILS", value: "ILS", fullName: t("ilsName") },
      { label: "THB", value: "THB", fullName: t("thbName") },
      { label: "MYR", value: "MYR", fullName: t("myrName") },
      { label: "PHP", value: "PHP", fullName: t("phpName") },
      { label: "IDR", value: "IDR", fullName: t("idrName") },
      { label: "BGN", value: "BGN", fullName: "Bulgarian Lev" },
      { label: "RON", value: "RON", fullName: "Romanian Leu" },
      { label: "ISK", value: "ISK", fullName: "Icelandic Króna" },
    ];

    // Sadece API'den gelen para birimlerini döndür
    return availableCurrencies.filter(
      (currency) =>
        exchangeRates && exchangeRates[currency.value] !== undefined,
    );
  };

  const getLengthUnits = () => [
    { label: t("meter"), value: "meter", toMeter: 1 },
    { label: t("centimeter"), value: "centimeter", toMeter: 0.01 },
    { label: t("kilometer"), value: "kilometer", toMeter: 1000 },
    { label: t("inch"), value: "inch", toMeter: 0.0254 },
    { label: t("feet"), value: "feet", toMeter: 0.3048 },
    { label: t("yard"), value: "yard", toMeter: 0.9144 },
  ];

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      let response = await fetch("https://api.frankfurter.dev/v1/latest");
      if (!response.ok) {
        response = await fetch("https://api.frankfurter.app/latest");
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!data || !data.rates || !data.rates.USD) {
        throw new Error("Invalid response format");
      }

      // Frankfurter EUR bazlı kur veriyor, USD bazlı yapmak için dönüştürüyoruz
      const eurToUsd = 1 / data.rates.USD;
      const usdBasedRates: { [key: string]: number } = {
        EUR: eurToUsd,
        USD: 1,
      };

      // Diğer dövizleri USD bazlı hesapla - sadece API'den gelen kurları kullan
      Object.keys(data.rates).forEach((currency) => {
        if (currency !== "USD") {
          usdBasedRates[currency] = data.rates[currency] * eurToUsd;
        }
      });

      setExchangeRates(usdBasedRates);
    } catch (error) {
      console.error("Döviz kurları alınamadı:", error);
      // Hata durumunda varsayılan kurlar (yaklaşık değerler) - sadece API'de desteklenen para birimleri
      setExchangeRates({
        USD: 1,
        EUR: 0.92,
        TRY: 30.5,
        GBP: 0.79,
        JPY: 149,
        CHF: 0.88,
        CAD: 1.35,
        AUD: 1.52,
        SEK: 10.8,
        NOK: 10.9,
        DKK: 6.86,
        PLN: 4.02,
        CZK: 22.4,
        HUF: 360,
        CNY: 7.24,
        INR: 83.1,
        KRW: 1340,
        SGD: 1.34,
        HKD: 7.82,
        MXN: 17.1,
        BRL: 5.45,
        ZAR: 18.8,
        NZD: 1.64,
        ILS: 3.65,
        THB: 35.8,
        MYR: 4.47,
        PHP: 56.3,
        IDR: 15420,
        BGN: 1.96,
        RON: 4.97,
        ISK: 138,
      });
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const convertCurrency = () => {
    if (!amount || isNaN(Number(amount))) {
      setResult(t("enterValidAmount"));
      return;
    }

    if (!exchangeRates[toCurrency] || !exchangeRates[fromCurrency]) {
      setResult(t("exchangeRatesError"));
      return;
    }

    const amountInUSD = Number(amount) / exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRates[toCurrency];

    // Kur bilgisini de göster
    const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];

    setResult(
      `${formatNumber(convertedAmount)} ${toCurrency}\n\n💱 ${t("exchangeRates")}: 1 ${fromCurrency} = ${formatNumber(rate)} ${toCurrency}`,
    );
    triggerHaptic();
  };

  const calculateBMI = () => {
    const height = parseFloat(amount); // boy (cm)
    const weight = parseFloat(amount2); // kilo (kg)

    if (!height || !weight || height <= 0 || weight <= 0) {
      setResult(t("enterValidHeightWeight"));
      return;
    }

    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    let category = "";
    let color = "";

    if (bmi < 18.5) {
      category = t("underweight");
      color = "🔵";
    } else if (bmi < 25) {
      category = t("normal");
      color = "🟢";
    } else if (bmi < 30) {
      category = t("overweight");
      color = "🟡";
    } else {
      category = t("obese");
      color = "🔴";
    }

    setResult(`${color} ${t("bmi")}: ${formatNumber(bmi)} (${category})`);
    triggerHaptic();
  };

  const calculateDiscount = () => {
    const price = parseFloat(amount);
    const discount = parseFloat(discountPercent);

    if (!price || !discount || price <= 0 || discount < 0 || discount > 100) {
      setResult(t("enterValidValues"));
      return;
    }

    const discountAmount = price * (discount / 100);
    const finalPrice = price - discountAmount;
    setResult(
      `${t("discountAmount")}: ${formatNumber(discountAmount)}\n${t("finalPrice")}: ${formatNumber(finalPrice)}`,
    );
    triggerHaptic();
  };

  // Tarih formatı için otomatik nokta ekleme
  const formatDateInput = (text: string): string => {
    // Sadece rakamları al
    const numbers = text.replace(/[^0-9]/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return numbers.slice(0, 2) + "." + numbers.slice(2);
    } else if (numbers.length <= 8) {
      return (
        numbers.slice(0, 2) +
        "." +
        numbers.slice(2, 4) +
        "." +
        numbers.slice(4, 8)
      );
    }

    return (
      numbers.slice(0, 2) +
      "." +
      numbers.slice(2, 4) +
      "." +
      numbers.slice(4, 8)
    );
  };

  // Tarih hesaplama fonksiyonları
  const parseDate = (dateStr: string): Date | null => {
    // DD.MM.YYYY formatını parse et
    const parts = dateStr.split(".");
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript months are 0-based
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    const date = new Date(year, month, day);
    // Validate the date
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const calculateDaysBetween = () => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
      setDaysBetweenResult(t("enterValidDates"));
      return;
    }

    // Tarihleri sırala (start her zaman end'den küçük olsun)
    const earlierDate = start <= end ? start : end;
    const laterDate = start <= end ? end : start;

    // Tam gün farkı hesapla
    const timeDiff = laterDate.getTime() - earlierDate.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Yıl, ay, gün hesaplama
    let years = laterDate.getFullYear() - earlierDate.getFullYear();
    let months = laterDate.getMonth() - earlierDate.getMonth();
    let days = laterDate.getDate() - earlierDate.getDate();

    // Negatif değerleri düzelt
    if (days < 0) {
      months--;
      const daysInPreviousMonth = new Date(
        laterDate.getFullYear(),
        laterDate.getMonth(),
        0,
      ).getDate();
      days += daysInPreviousMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Hafta hesaplama
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;

    // Sonuç metnini oluştur
    let resultText = `📅 ${t("daysBetween")}: ${totalDays} ${totalDays === 1 ? t("day") : t("days")}`;

    // Detaylı hesaplama ekle
    if (years > 0 || months > 0 || days > 0) {
      resultText += `\n\n📊 ${t("detailed")}:`;
      const parts = [];

      if (years > 0) {
        parts.push(`${years} ${years === 1 ? t("year") : t("years")}`);
      }
      if (months > 0) {
        parts.push(`${months} ${months === 1 ? t("month") : t("months")}`);
      }
      if (days > 0) {
        parts.push(`${days} ${days === 1 ? t("day") : t("days")}`);
      }

      if (parts.length > 0) {
        resultText += `\n${parts.join(", ")}`;
      }
    }

    // Hafta hesaplama ekle
    if (weeks > 0) {
      resultText += `\n\n📆 ${t("weekDisplay")}: ${weeks} ${weeks === 1 ? t("week") : t("weeks")}`;
      if (remainingDays > 0) {
        resultText += `, ${remainingDays} ${remainingDays === 1 ? t("day") : t("days")}`;
      }
    }

    // Tarih durumu bilgisi
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    resultText += `\n\n📍 ${t("dateStatus")}:`;

    // Orijinal start tarihi durumu
    if (start.getTime() === today.getTime()) {
      resultText += `\n${t("startDate")}: ${t("today")}`;
    } else if (start.getTime() < today.getTime()) {
      resultText += `\n${t("startDate")}: ${t("dateInPast")}`;
    } else {
      resultText += `\n${t("startDate")}: ${t("dateInFuture")}`;
    }

    // Orijinal end tarihi durumu
    if (end.getTime() === today.getTime()) {
      resultText += `\n${t("endDate")}: ${t("today")}`;
    } else if (end.getTime() < today.getTime()) {
      resultText += `\n${t("endDate")}: ${t("dateInPast")}`;
    } else {
      resultText += `\n${t("endDate")}: ${t("dateInFuture")}`;
    }

    setDaysBetweenResult(resultText);
    triggerHaptic();
  };

  const addDaysToDate = () => {
    const baseDate = parseDate(startDate);
    const days = parseInt(amount);

    if (!baseDate || isNaN(days)) {
      setAddDaysResult(t("enterValidDates"));
      return;
    }

    const resultDate = new Date(baseDate);
    resultDate.setDate(resultDate.getDate() + days);

    const resultText = `${t("resultDate")}: ${formatDate(resultDate)}`;
    setAddDaysResult(resultText);
    triggerHaptic();
  };

  const subtractDaysFromDate = () => {
    const baseDate = parseDate(startDate);
    const days = parseInt(amount);

    if (!baseDate || isNaN(days)) {
      setSubtractDaysResult(t("enterValidDates"));
      return;
    }

    const resultDate = new Date(baseDate);
    resultDate.setDate(resultDate.getDate() - days);

    const resultText = `${t("resultDate")}: ${formatDate(resultDate)}`;
    setSubtractDaysResult(resultText);
    triggerHaptic();
  };

  // Padding utility function for formatted numbers
  const StockResultsComponent = ({ stockData }: { stockData: any }) => {
    return (
      <View style={styles.stockResultsContainer}>
        {/* Header */}
        <View style={styles.stockHeader}>
          <View style={styles.stockIconContainer}>
            <FontAwesome
              name="line-chart"
              size={24}
              color={themeColors.primary}
            />
          </View>
          <View style={styles.stockHeaderText}>
            <Text style={styles.stockTitle}>{stockData.stockName}</Text>
            <Text style={styles.stockSubtitle}>{t("analysis")}</Text>
          </View>
        </View>

        {/* Current Status */}
        <View style={styles.stockCurrentStatus}>
          <View style={styles.stockCurrentRow}>
            <View style={styles.stockCurrentItem}>
              <Text style={styles.stockCurrentLabel}>{t("price")}</Text>
              <Text style={styles.stockCurrentValue}>
                {formatNumber(stockData.price)} {currency}
              </Text>
            </View>
            <View style={styles.stockCurrentItem}>
              <Text style={styles.stockCurrentLabel}>{t("quantity")}</Text>
              <Text style={styles.stockCurrentValue}>
                {formatNumber(stockData.quantity)}
              </Text>
            </View>
            <View style={styles.stockCurrentItem}>
              <Text style={styles.stockCurrentLabel}>{t("capital")}</Text>
              <Text style={styles.stockCurrentValue}>
                {formatNumber(stockData.capital)} {currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Ceiling Levels */}
        <View style={styles.stockSection}>
          <View style={styles.stockSectionHeader}>
            <View style={styles.stockSectionIcon}>
              <Text style={styles.stockSectionEmoji}>🟢</Text>
            </View>
            <Text style={styles.stockSectionTitle}>{t("ceilingLevels")}</Text>
          </View>
          <ScrollView
            style={styles.stockLevelsScroll}
            showsVerticalScrollIndicator={false}
          >
            {stockData.ceilingLevels.map((level: any, index: number) => (
              <View key={index} style={styles.stockLevelItem}>
                <View style={styles.stockLevelNumber}>
                  <Text style={styles.stockLevelNumberText}>{level.level}</Text>
                </View>
                <View style={styles.stockLevelContent}>
                  <View style={styles.stockLevelPrice}>
                    <Text style={styles.stockLevelPriceText}>
                      {formatNumber(level.price)} {currency}
                    </Text>
                    <Text style={styles.stockLevelPriceSubtext}>
                      {t("price")}
                    </Text>
                  </View>
                  <View style={styles.stockLevelProfit}>
                    <Text
                      style={[
                        styles.stockLevelProfitText,
                        { color: "#22C55E" },
                      ]}
                    >
                      +{formatNumber(level.profit)} {currency}
                    </Text>
                    <Text
                      style={[
                        styles.stockLevelProfitPercent,
                        { color: "#22C55E" },
                      ]}
                    >
                      +{formatNumber(level.profitPercent)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Floor Levels */}
        <View style={styles.stockSection}>
          <View style={styles.stockSectionHeader}>
            <View style={styles.stockSectionIcon}>
              <Text style={styles.stockSectionEmoji}>🔴</Text>
            </View>
            <Text style={styles.stockSectionTitle}>{t("floorLevels")}</Text>
          </View>
          <ScrollView
            style={styles.stockLevelsScroll}
            showsVerticalScrollIndicator={false}
          >
            {stockData.floorLevels.map((level: any, index: number) => (
              <View key={index} style={styles.stockLevelItem}>
                <View style={styles.stockLevelNumber}>
                  <Text style={styles.stockLevelNumberText}>{level.level}</Text>
                </View>
                <View style={styles.stockLevelContent}>
                  <View style={styles.stockLevelPrice}>
                    <Text style={styles.stockLevelPriceText}>
                      {formatNumber(level.price)} {currency}
                    </Text>
                    <Text style={styles.stockLevelPriceSubtext}>
                      {t("price")}
                    </Text>
                  </View>
                  <View style={styles.stockLevelProfit}>
                    <Text
                      style={[
                        styles.stockLevelProfitText,
                        { color: "#EF4444" },
                      ]}
                    >
                      -{formatNumber(level.loss)} {currency}
                    </Text>
                    <Text
                      style={[
                        styles.stockLevelProfitPercent,
                        { color: "#EF4444" },
                      ]}
                    >
                      -{formatNumber(level.lossPercent)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const calculateStock = () => {
    const price = parseFloat(stockPrice);
    const quantity = parseFloat(stockQuantity);

    if (!price || !quantity || price <= 0 || quantity <= 0) {
      setResult(t("enterValidStock"));
      setStockResults(null);
      return;
    }

    // Calculate capital (initial investment)
    const capital = price * quantity;

    // Turkish stock market daily limit percentage
    const dailyLimitPercent = 10;

    // Calculate ceiling levels
    const ceilingLevels = [];
    for (let i = 1; i <= 10; i++) {
      const ceilingPrice = price * Math.pow(1 + dailyLimitPercent / 100, i);
      const profit = (ceilingPrice - price) * quantity;
      const profitPercent = ((ceilingPrice - price) / price) * 100;
      ceilingLevels.push({
        level: i,
        price: ceilingPrice,
        profit,
        profitPercent,
      });
    }

    // Calculate floor levels
    const floorLevels = [];
    for (let i = 1; i <= 10; i++) {
      const floorPrice = price * Math.pow(1 - dailyLimitPercent / 100, i);
      const loss = (price - floorPrice) * quantity;
      const lossPercent = ((price - floorPrice) / price) * 100;
      floorLevels.push({
        level: i,
        price: floorPrice,
        loss,
        lossPercent,
      });
    }

    setStockResults({
      stockName: stockName.trim().toUpperCase() || (language === "tr" ? "HİSSE" : "STOCK"),
      price,
      quantity,
      capital,
      ceilingLevels,
      floorLevels,
    });

    setResult("calculated"); // Just a flag to show results
    triggerHaptic();
  };

  const convertBinary = () => {
    const input = binaryInput.trim();
    if (!input) {
      setResult(t("enterValue"));
      return;
    }

    try {
      if (selectedTool === "binary") {
        // Binary converter - sadece 0 ve 1 kabul et
        if (!/^[01]+$/.test(input)) {
          setResult(t("enterValidValues"));
          return;
        }
        const decimal = parseInt(input, 2);
        const hex = decimal.toString(16).toUpperCase();
        const octal = decimal.toString(8);
        setResult(
          `${t("decimal")}: ${decimal}\n${t("hex")}: ${hex}\n${t("octal")}: ${octal}`,
        );
      } else {
        // Base converter
        const fromBase = parseInt(baseFrom);
        const toBase = parseInt(baseTo);

        if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
          setResult(t("baseRangeError"));
          return;
        }

        const decimal = parseInt(input, fromBase);
        if (isNaN(decimal)) {
          setResult(t("invalidNumberFormat"));
          return;
        }

        const converted = decimal.toString(toBase).toUpperCase();
        setResult(
          `${input} (${t("base")} ${fromBase}) = ${converted} (${t("base")} ${toBase})`,
        );
      }
      triggerHaptic();
    } catch {
      setResult(t("conversionError"));
    }
  };

  const convertUnit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setResult(t("enterValidAmount"));
      return;
    }

    const lengthUnits = getLengthUnits();
    const fromUnitData = lengthUnits.find((u) => u.value === fromUnit);
    const toUnitData = lengthUnits.find((u) => u.value === toUnit);

    if (!fromUnitData || !toUnitData) {
      setResult(t("calculationError"));
      return;
    }

    // Önce metre cinsine çevir, sonra hedef birime
    const valueInMeters = value * fromUnitData.toMeter;
    const convertedValue = valueInMeters / toUnitData.toMeter;

    setResult(
      `${formatNumber(convertedValue)} ${toUnitData.label.toLowerCase()}`,
    );
    triggerHaptic();
  };

  const calculateKdv = () => {
    const price = parseFloat(amount);
    const rate = parseFloat(kdvRateState);

    if (!price || price <= 0) {
      setResult(t("enterValidAmount"));
      return;
    }

    const kdvAmount = price * (rate / 100);
    const totalWithKdv = price + kdvAmount;

    setResult(
      `${t("priceWithoutKdv")}: ${formatNumber(price)}\n` +
        `${t("kdvRate")}: %${rate}\n` +
        `${t("kdvAmount")}: ${formatNumber(kdvAmount)}\n` +
        `${t("totalWithKdv")}: ${formatNumber(totalWithKdv)}`,
    );
    triggerHaptic();
  };

  const calculateLoan = () => {
    const principal = parseFloat(amount);
    const annualRate = parseFloat(loanInterest);
    const months = parseInt(loanTermInput);

    if (
      !principal ||
      principal <= 0 ||
      !annualRate ||
      annualRate <= 0 ||
      !months ||
      months <= 0
    ) {
      setResult(t("enterValidValues"));
      return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = payment * months;
    const totalInterest = totalPayment - principal;

    setResult(
      `💰 ${t("monthlyPayment")}: ${formatNumber(payment)}\n\n` +
        `📊 ${t("totalPayment")}: ${formatNumber(totalPayment)}\n` +
        `📈 ${t("totalInterest")}: ${formatNumber(totalInterest)}`,
    );
    triggerHaptic();
  };

  const calculateTip = () => {
    const bill = parseFloat(amount);
    const tipPercent = parseFloat(discountPercent);
    const people = parseInt(tipPeople) || 1;

    if (!bill || bill <= 0) {
      setResult(t("enterValidAmount"));
      return;
    }

    if (!tipPercent || tipPercent < 0) {
      setResult(t("enterValidValues"));
      return;
    }

    const tipAmt = bill * (tipPercent / 100);
    const total = bill + tipAmt;
    const perPersonAmt = total / people;

    let resultText =
      `💵 ${t("tipAmount")}: ${formatNumber(tipAmt)}\n` +
      `💰 ${t("totalWithTip")}: ${formatNumber(total)}`;

    if (people > 1) {
      resultText +=
        `\n\n👥 ${t("numberOfPeople")}: ${people}\n` +
        `🧾 ${t("perPerson")}: ${formatNumber(perPersonAmt)}`;
    }

    setResult(resultText);
    triggerHaptic();
  };

  const calculateAge = () => {
    const birthDateParsed = parseDate(startDate);

    if (!birthDateParsed) {
      setResult(t("enterValidDates"));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birthDateParsed > today) {
      setResult(t("enterValidDates"));
      return;
    }

    let years = today.getFullYear() - birthDateParsed.getFullYear();
    let months = today.getMonth() - birthDateParsed.getMonth();
    let days = today.getDate() - birthDateParsed.getDate();

    if (days < 0) {
      months--;
      const daysInPrevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      ).getDate();
      days += daysInPrevMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor(
      (today.getTime() - birthDateParsed.getTime()) / (1000 * 60 * 60 * 24),
    );

    let nextBday = new Date(
      today.getFullYear(),
      birthDateParsed.getMonth(),
      birthDateParsed.getDate(),
    );
    if (nextBday <= today) {
      nextBday = new Date(
        today.getFullYear() + 1,
        birthDateParsed.getMonth(),
        birthDateParsed.getDate(),
      );
    }
    const daysUntil = Math.ceil(
      (nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    let resultText = `🎂 ${t("yourAge")}:\n`;
    resultText += `${years} ${t("years")}, ${months} ${t("months")}, ${days} ${t("days")}\n\n`;
    resultText += `📅 ${t("detailed")}:\n`;
    resultText += `${formatNumber(totalDays)} ${t("days")}\n\n`;
    resultText += `🎉 ${t("daysUntilBirthday")}:\n`;
    resultText += `${daysUntil} ${t("days")}`;

    setResult(resultText);
    triggerHaptic();
  };

  const cleanNumericValue = (val: string): string => {
    if (!val) return "";
    // Eğer çok satırlı bir metinse (tüm özet vb.), olduğu gibi bırak
    if (val.includes("\n")) return val;

    let s = val.trim();

    // 1. Seçili para birimini (TRY, USD vb.) temizle
    if (currency) {
      s = s.split(currency).join(" ");
    }

    // 2. Ekstra yüzde getiri parantezlerini temizle: örn. (+%1,55) veya (-%10)
    s = s.replace(/\([+-]?%?[-\d.,]+\)/g, "");

    // 3. Tüm para birimi kodlarını temizle (TRY, USD, EUR, GBP, TL vb.)
    s = s.replace(
      /\b(TRY|USD|EUR|GBP|TL|JPY|CAD|AUD|CHF|SEK|NOK|DKK|PLN|CZK|HUF|CNY|INR|KRW|SGD|HKD|MXN|BRL|ZAR|NZD|ILS|THB|MYR|PHP|IDR)\b/gi,
      "",
    );

    // 4. Para birimi sembollerini temizle
    s = s.replace(/[₺$€£¥₹₽₩]/g, "");

    // 5. Pozitif + ve % işaretlerini temizle
    s = s.replace(/[%+]/g, "").trim();

    // 6. Sayıyı (varsa eksi işaretini ve basamak ayıraçlarını koruyarak) bul
    const match = s.match(/-?[\d.,]+/);
    if (match) {
      return match[0].replace(/[.,]$/, "").trim();
    }

    return s.trim();
  };

  const handleCopy = async (
    customText?: string,
    key: string = "result",
    toastLabel?: string,
  ) => {
    const rawTarget =
      customText !== undefined
        ? customText
        : (analysisCard?.heroValue || result);
    if (!rawTarget) return;

    // Eğer tüm özet (summary) veya düz sonuç değilse para birimini ayıkla, YALNIZCA sayıyı kopyala
    const textToCopy =
      key === "summary" || key === "plain"
        ? rawTarget
        : cleanNumericValue(rawTarget);

    await setStringAsync(textToCopy);
    triggerHaptic();
    setCopiedKey(key);
    setCopiedToast(true);
    setCopiedToastText(toastLabel || `${t("copied")}: ${textToCopy}`);
    setTimeout(() => {
      setCopiedToast(false);
      setCopiedKey(null);
    }, 2000);
  };

  const calculateCost = () => {
    if (costMode === "fromRate") {
      const currentPriceNum = parseFloat(costCurrentPrice.replace(",", "."));
      const rateNum = parseFloat(costRate.replace(",", "."));
      const qtyNum = parseFloat(costQuantity.replace(",", "."));

      if (isNaN(currentPriceNum) || currentPriceNum <= 0) {
        setResult(t("enterValidPrice"));
        setAnalysisCard(null);
        return;
      }
      if (isNaN(rateNum) || rateNum < 0) {
        setResult(t("enterValidRate"));
        setAnalysisCard(null);
        return;
      }
      if (!costIsProfit && rateNum >= 100) {
        setResult(t("rateCannotExceed100"));
        setAnalysisCard(null);
        return;
      }

      const costPrice = costIsProfit
        ? currentPriceNum / (1 + rateNum / 100)
        : currentPriceNum / (1 - rateNum / 100);

      const unitDiff = currentPriceNum - costPrice;
      const hasQty = !isNaN(qtyNum) && qtyNum > 0;

      const rows: { label: string; value: string; isProfit?: boolean; isLoss?: boolean }[] = [
        {
          label: `🏷️ ${t("unitCostPrice")}`,
          value: `${formatNumber(costPrice)} ${currency}`,
        },
        {
          label: `💲 ${t("currentPrice")}`,
          value: `${formatNumber(currentPriceNum)} ${currency}`,
        },
        {
          label: `📊 ${t("profitLossRate")}`,
          value: `${costIsProfit ? "+" : "-"}%${formatNumber(rateNum)}`,
          isProfit: costIsProfit,
          isLoss: !costIsProfit,
        },
        {
          label: costIsProfit ? `🟢 ${t("unitProfit")}` : `🔴 ${t("unitLoss")}`,
          value: `${costIsProfit ? "+" : "-"}${formatNumber(Math.abs(unitDiff))} ${currency}`,
          isProfit: costIsProfit,
          isLoss: !costIsProfit,
        },
      ];

      let rawText = `🎯 ${t("costCalculator").toUpperCase()}\n\n`;
      rawText += `🏷️ ${t("unitCostPrice")}: ${formatNumber(costPrice)} ${currency}\n\n`;
      rawText += `💲 ${t("currentPrice")}: ${formatNumber(currentPriceNum)} ${currency}\n\n`;
      rawText += `📊 ${t("profitLossRate")}: ${costIsProfit ? "+" : "-"}%${formatNumber(rateNum)}\n\n`;
      rawText += costIsProfit
        ? `🟢 ${t("unitProfit")}: +${formatNumber(unitDiff)} ${currency}\n\n`
        : `🔴 ${t("unitLoss")}: -${formatNumber(Math.abs(unitDiff))} ${currency}\n\n`;

      if (hasQty) {
        const totalCostVal = costPrice * qtyNum;
        const totalCurrentVal = currentPriceNum * qtyNum;
        const totalDiffVal = totalCurrentVal - totalCostVal;

        rows.push(
          { label: `📦 ${t("quantity")}`, value: formatNumber(qtyNum) },
          {
            label: `💼 ${t("totalInvestment")}`,
            value: `${formatNumber(totalCostVal)} ${currency}`,
          },
          {
            label: `💰 ${t("currentTotalValue")}`,
            value: `${formatNumber(totalCurrentVal)} ${currency}`,
          },
          {
            label: costIsProfit ? `📈 ${t("totalProfit")}` : `📉 ${t("totalLoss")}`,
            value: `${costIsProfit ? "+" : "-"}${formatNumber(Math.abs(totalDiffVal))} ${currency}`,
            isProfit: costIsProfit,
            isLoss: !costIsProfit,
          },
        );

        rawText += `📦 ${t("quantity")}: ${formatNumber(qtyNum)}\n\n`;
        rawText += `💼 ${t("totalInvestment")}: ${formatNumber(totalCostVal)} ${currency}\n\n`;
        rawText += `💰 ${t("currentTotalValue")}: ${formatNumber(totalCurrentVal)} ${currency}\n\n`;
        rawText += costIsProfit
          ? `📈 ${t("totalProfit")}: +${formatNumber(totalDiffVal)} ${currency}`
          : `📉 ${t("totalLoss")}: -${formatNumber(Math.abs(totalDiffVal))} ${currency}`;
      }

      setAnalysisCard({
        title: `🎯 ${t("costCalculator")}`,
        heroLabel: t("unitCostPrice"),
        heroValue: `${formatNumber(costPrice)} ${currency}`,
        subHero: costIsProfit
          ? `+${formatNumber(unitDiff)} ${currency} (+%${formatNumber(rateNum)})`
          : `-${formatNumber(Math.abs(unitDiff))} ${currency} (-%${formatNumber(rateNum)})`,
        rows,
        rawText,
      });

      setResult(rawText);
      triggerHaptic();
    } else {
      // fromPrices
      const buyPriceNum = parseFloat(costBuyPrice.replace(",", "."));
      const currentPriceNum = parseFloat(costCurrentPrice.replace(",", "."));
      const qtyNum = parseFloat(costQuantity.replace(",", "."));

      if (isNaN(buyPriceNum) || buyPriceNum <= 0) {
        setResult(t("enterValidPrice"));
        setAnalysisCard(null);
        return;
      }
      if (isNaN(currentPriceNum) || currentPriceNum <= 0) {
        setResult(t("enterValidPrice"));
        setAnalysisCard(null);
        return;
      }

      const unitDiff = currentPriceNum - buyPriceNum;
      const rateNum = ((currentPriceNum - buyPriceNum) / buyPriceNum) * 100;
      const isProfitable = unitDiff > 0;
      const isLoss = unitDiff < 0;
      const hasQty = !isNaN(qtyNum) && qtyNum > 0;

      const rows: { label: string; value: string; isProfit?: boolean; isLoss?: boolean }[] = [
        {
          label: `🏷️ ${t("buyPrice")}`,
          value: `${formatNumber(buyPriceNum)} ${currency}`,
        },
        {
          label: `💲 ${t("currentPrice")}`,
          value: `${formatNumber(currentPriceNum)} ${currency}`,
        },
        {
          label: `📊 ${t("profitLossRate")}`,
          value: isProfitable
            ? `+ %${formatNumber(rateNum)}`
            : isLoss
              ? `- %${formatNumber(Math.abs(rateNum))}`
              : "%0",
          isProfit: isProfitable,
          isLoss,
        },
        {
          label: isProfitable ? `🟢 ${t("unitProfit")}` : `🔴 ${t("unitLoss")}`,
          value: isProfitable
            ? `+${formatNumber(unitDiff)} ${currency}`
            : isLoss
              ? `-${formatNumber(Math.abs(unitDiff))} ${currency}`
              : `0 ${currency}`,
          isProfit: isProfitable,
          isLoss,
        },
      ];

      let rawText = `📊 ${t("costCalculator").toUpperCase()}\n\n`;
      rawText += `🏷️ ${t("buyPrice")}: ${formatNumber(buyPriceNum)} ${currency}\n\n`;
      rawText += `💲 ${t("currentPrice")}: ${formatNumber(currentPriceNum)} ${currency}\n\n`;
      rawText += isProfitable
        ? `🟢 ${t("statusInProfit")}: +%${formatNumber(rateNum)}\n\n`
        : isLoss
          ? `🔴 ${t("statusInLoss")}: -%${formatNumber(Math.abs(rateNum))}\n\n`
          : `⚪ ${t("statusBreakEven")}: %0\n\n`;

      if (hasQty) {
        const totalCostVal = buyPriceNum * qtyNum;
        const totalCurrentVal = currentPriceNum * qtyNum;
        const totalDiffVal = totalCurrentVal - totalCostVal;

        rows.push(
          { label: `📦 ${t("quantity")}`, value: formatNumber(qtyNum) },
          {
            label: `💼 ${t("totalInvestment")}`,
            value: `${formatNumber(totalCostVal)} ${currency}`,
          },
          {
            label: `💰 ${t("currentTotalValue")}`,
            value: `${formatNumber(totalCurrentVal)} ${currency}`,
          },
          {
            label: totalDiffVal > 0 ? `📈 ${t("totalProfit")}` : `📉 ${t("totalLoss")}`,
            value: `${totalDiffVal >= 0 ? "+" : "-"}${formatNumber(Math.abs(totalDiffVal))} ${currency}`,
            isProfit: totalDiffVal > 0,
            isLoss: totalDiffVal < 0,
          },
        );

        rawText += `📦 ${t("quantity")}: ${formatNumber(qtyNum)}\n\n`;
        rawText += `💼 ${t("totalInvestment")}: ${formatNumber(totalCostVal)} ${currency}\n\n`;
        rawText += `💰 ${t("currentTotalValue")}: ${formatNumber(totalCurrentVal)} ${currency}\n\n`;
        rawText += totalDiffVal >= 0
          ? `📈 ${t("totalProfit")}: +${formatNumber(totalDiffVal)} ${currency}`
          : `📉 ${t("totalLoss")}: -${formatNumber(Math.abs(totalDiffVal))} ${currency}`;
      }

      setAnalysisCard({
        title: `📊 ${t("costCalculator")}`,
        heroLabel: isProfitable ? t("statusInProfit") : isLoss ? t("statusInLoss") : t("statusBreakEven"),
        heroValue: isProfitable
          ? `+%${formatNumber(rateNum)}`
          : isLoss
            ? `-%${formatNumber(Math.abs(rateNum))}`
            : "%0",
        subHero: isProfitable
          ? `+${formatNumber(unitDiff)} ${currency} (${t("unitProfit")})`
          : isLoss
            ? `-${formatNumber(Math.abs(unitDiff))} ${currency} (${t("unitLoss")})`
            : undefined,
        rows,
        rawText,
      });

      setResult(rawText);
      triggerHaptic();
    }
  };

  const calculateStopaj = () => {
    const rateNum = parseFloat(stopajRate.replace(",", "."));
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setResult(t("enterValidRate"));
      setAnalysisCard(null);
      return;
    }

    if (stopajMode === "fromBalanceProfit") {
      const totalVal = parseFloat(stopajTotalBalance.replace(",", "."));
      const profitVal = parseFloat(stopajProfitPortion.replace(",", "."));

      if (isNaN(totalVal) || totalVal <= 0) {
        setResult(t("enterValidBalance"));
        setAnalysisCard(null);
        return;
      }
      if (isNaN(profitVal) || profitVal < 0) {
        setResult(t("enterValidProfit"));
        setAnalysisCard(null);
        return;
      }
      if (profitVal > totalVal) {
        setResult(
          language === "tr"
            ? "Kâr tutarı toplam portföy tutarından büyük olamaz"
            : "Profit amount cannot exceed total balance",
        );
        setAnalysisCard(null);
        return;
      }

      const taxAmount = profitVal * (rateNum / 100);
      const netProfitVal = profitVal - taxAmount;
      const netPayoutVal = totalVal - taxAmount;
      const principalVal = totalVal - profitVal;
      const netReturn = principalVal > 0 ? (netProfitVal / principalVal) * 100 : 0;

      const rows = [
        {
          label: `💼 ${t("totalPortfolioValue")}`,
          value: `${formatNumber(totalVal)} ${currency}`,
        },
        {
          label: `📈 ${t("profitPortion")}`,
          value: `+${formatNumber(profitVal)} ${currency}`,
          isProfit: true,
        },
        {
          label: `🏦 ${t("principalAmount")}`,
          value: `${formatNumber(principalVal)} ${currency}`,
        },
        {
          label: `✂️ ${t("stopajRate")}`,
          value: `%${formatNumber(rateNum)}`,
        },
        {
          label: `🏛️ ${t("stopajAmount")}`,
          value: `-${formatNumber(taxAmount)} ${currency}`,
          isLoss: true,
        },
        {
          label: `💰 ${t("netProfit")}`,
          value: `+${formatNumber(netProfitVal)} ${currency} (+%${formatNumber(netReturn)})`,
          isProfit: true,
        },
      ];

      let rawText = `🏛️ ${t("stopajCalculator").toUpperCase()}\n\n`;
      rawText += `💼 ${t("totalPortfolioValue")}: ${formatNumber(totalVal)} ${currency}\n\n`;
      rawText += `📈 ${t("profitPortion")}: +${formatNumber(profitVal)} ${currency}\n\n`;
      rawText += `🏦 ${t("principalAmount")}: ${formatNumber(principalVal)} ${currency}\n\n`;
      rawText += `✂️ ${t("stopajRate")}: %${formatNumber(rateNum)}\n\n`;
      rawText += `🏛️ ${t("stopajAmount")}: -${formatNumber(taxAmount)} ${currency}\n\n`;
      rawText += `💰 ${t("netProfit")}: +${formatNumber(netProfitVal)} ${currency} (+%${formatNumber(netReturn)})\n\n`;
      rawText += `------------------------------------\n\n`;
      rawText += `💳 ${t("netPayoutIfSold")}: ${formatNumber(netPayoutVal)} ${currency}`;

      setAnalysisCard({
        title: `🏛️ ${t("stopajCalculator")}`,
        heroLabel: t("netPayoutIfSold"),
        heroValue: `${formatNumber(netPayoutVal)} ${currency}`,
        subHero: `${t("netProfit")}: +${formatNumber(netProfitVal)} ${currency} (+%${formatNumber(netReturn)})`,
        rows,
        rawText,
      });

      setResult(rawText);
      triggerHaptic();
    } else if (stopajMode === "fromProfit") {
      const profitNum = parseFloat(stopajProfit.replace(",", "."));
      if (isNaN(profitNum) || profitNum <= 0) {
        setResult(t("enterValidProfit"));
        setAnalysisCard(null);
        return;
      }

      const taxAmount = profitNum * (rateNum / 100);
      const netProfitVal = profitNum - taxAmount;

      const rows = [
        {
          label: `💵 ${t("grossProfit")}`,
          value: `${formatNumber(profitNum)} ${currency}`,
        },
        {
          label: `✂️ ${t("stopajRate")}`,
          value: `%${formatNumber(rateNum)}`,
        },
        {
          label: `🏛️ ${t("stopajAmount")}`,
          value: `-${formatNumber(taxAmount)} ${currency}`,
          isLoss: true,
        },
      ];

      let rawText = `🏛️ ${t("stopajCalculator").toUpperCase()}\n\n`;
      rawText += `💵 ${t("grossProfit")}: ${formatNumber(profitNum)} ${currency}\n\n`;
      rawText += `✂️ ${t("stopajRate")}: %${formatNumber(rateNum)}\n\n`;
      rawText += `🏛️ ${t("stopajAmount")}: -${formatNumber(taxAmount)} ${currency}\n\n`;
      rawText += `------------------------------------\n\n`;
      rawText += `💰 ${t("netProfit")}: ${formatNumber(netProfitVal)} ${currency}`;

      setAnalysisCard({
        title: `🏛️ ${t("stopajCalculator")}`,
        heroLabel: t("netProfit"),
        heroValue: `${formatNumber(netProfitVal)} ${currency}`,
        subHero: `${t("stopajAmount")}: -${formatNumber(taxAmount)} ${currency} (%${formatNumber(rateNum)})`,
        rows,
        rawText,
      });

      setResult(rawText);
      triggerHaptic();
    } else {
      // fromBuySell
      const buyNum = parseFloat(stopajBuyAmount.replace(",", "."));
      const sellNum = parseFloat(stopajSellAmount.replace(",", "."));

      if (isNaN(buyNum) || buyNum <= 0 || isNaN(sellNum) || sellNum < 0) {
        setResult(t("enterValidAmount"));
        setAnalysisCard(null);
        return;
      }

      const grossProfit = sellNum - buyNum;
      const isProfitable = grossProfit > 0;

      let rawText = `🏛️ ${t("stopajCalculator").toUpperCase()}\n\n`;
      rawText += `💼 ${t("principalOrBuyAmount")}: ${formatNumber(buyNum)} ${currency}\n\n`;
      rawText += `💲 ${t("saleOrTotalAmount")}: ${formatNumber(sellNum)} ${currency}\n\n`;

      const rows: {
        label: string;
        value: string;
        isProfit?: boolean;
        isLoss?: boolean;
      }[] = [
        {
          label: `💼 ${t("principalOrBuyAmount")}`,
          value: `${formatNumber(buyNum)} ${currency}`,
        },
        {
          label: `💲 ${t("saleOrTotalAmount")}`,
          value: `${formatNumber(sellNum)} ${currency}`,
        },
      ];

      if (isProfitable) {
        const grossReturn = (grossProfit / buyNum) * 100;
        const taxAmount = grossProfit * (rateNum / 100);
        const netProfitVal = grossProfit - taxAmount;
        const netPayoutVal = buyNum + netProfitVal;
        const netReturn = (netProfitVal / buyNum) * 100;

        rows.push(
          {
            label: `📈 ${t("grossProfit")}`,
            value: `+${formatNumber(grossProfit)} ${currency} (+%${formatNumber(grossReturn)})`,
            isProfit: true,
          },
          {
            label: `✂️ ${t("stopajRate")}`,
            value: `%${formatNumber(rateNum)}`,
          },
          {
            label: `🏛️ ${t("stopajAmount")}`,
            value: `-${formatNumber(taxAmount)} ${currency}`,
            isLoss: true,
          },
          {
            label: `💰 ${t("netProfit")}`,
            value: `+${formatNumber(netProfitVal)} ${currency} (+%${formatNumber(netReturn)})`,
            isProfit: true,
          },
        );

        rawText += `📈 ${t("grossProfit")}: +${formatNumber(grossProfit)} ${currency} (+%${formatNumber(grossReturn)})\n\n`;
        rawText += `✂️ ${t("stopajRate")}: %${formatNumber(rateNum)}\n\n`;
        rawText += `🏛️ ${t("stopajAmount")}: -${formatNumber(taxAmount)} ${currency}\n\n`;
        rawText += `💰 ${t("netProfit")}: +${formatNumber(netProfitVal)} ${currency} (+%${formatNumber(netReturn)})\n\n`;
        rawText += `------------------------------------\n\n`;
        rawText += `💳 ${t("netTotalPayout")}: ${formatNumber(netPayoutVal)} ${currency}`;

        setAnalysisCard({
          title: `🏛️ ${t("stopajCalculator")}`,
          heroLabel: t("netTotalPayout"),
          heroValue: `${formatNumber(netPayoutVal)} ${currency}`,
          subHero: `${t("netProfit")}: +${formatNumber(netProfitVal)} ${currency} (+%${formatNumber(netReturn)})`,
          rows,
          rawText,
        });
      } else {
        const lossVal = Math.abs(grossProfit);
        const lossReturn = (lossVal / buyNum) * 100;

        rows.push(
          {
            label: `📉 ${t("totalLoss")}`,
            value: `-${formatNumber(lossVal)} ${currency} (-%${formatNumber(lossReturn)})`,
            isLoss: true,
          },
          {
            label: `ℹ️ ${t("noStopajOnLoss")}`,
            value: `0 ${currency}`,
          },
        );

        rawText += `📉 ${t("totalLoss")}: -${formatNumber(lossVal)} ${currency} (-%${formatNumber(lossReturn)})\n\n`;
        rawText += `ℹ️ ${t("noStopajOnLoss")}\n\n`;
        rawText += `🏛️ ${t("stopajAmount")}: 0 ${currency}\n\n`;
        rawText += `------------------------------------\n\n`;
        rawText += `💳 ${t("netTotalPayout")}: ${formatNumber(sellNum)} ${currency}`;

        setAnalysisCard({
          title: `🏛️ ${t("stopajCalculator")}`,
          heroLabel: t("netTotalPayout"),
          heroValue: `${formatNumber(sellNum)} ${currency}`,
          subHero: `-${formatNumber(lossVal)} ${currency} (-%${formatNumber(lossReturn)})`,
          rows,
          rawText,
        });
      }

      setResult(rawText);
      triggerHaptic();
    }
  };

  const renderCurrencySelector = () => {
    const popularCurrencies = [
      { code: "USD", label: "USD ($)" },
      { code: "EUR", label: "EUR (€)" },
      { code: "TRY", label: "TRY (₺)" },
      { code: "GBP", label: "GBP (£)" },
    ];

    return (
      <View style={styles.currencyBar}>
        <Text style={styles.currencyBarLabel}>💱 {t("selectedCurrency")}:</Text>
        <View style={styles.currencyChips}>
          {popularCurrencies.map((c) => {
            const isSelected = currency === c.code;
            return (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.currencyChip,
                  isSelected && {
                    backgroundColor: themeColors.primary,
                    borderColor: themeColors.primary,
                  },
                ]}
                onPress={() => {
                  setCurrency(c.code);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    styles.currencyChipText,
                    isSelected && styles.currencyChipTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTool = () => {
    const currencies = getCurrencies();
    const lengthUnits = getLengthUnits();

    switch (selectedTool) {
      case "currency":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("currencyConverter")}</Text>

            <View style={styles.refreshContainer}>
              <Text style={styles.dataSourceText}>📊 {t("dataSource")}</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => {
                  fetchExchangeRates();
                  triggerHaptic();
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={themeColors.primary} />
                ) : (
                  <FontAwesome
                    name="refresh"
                    size={14}
                    color={themeColors.primary}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.currencyRow}>
              <View style={styles.currencyColumn}>
                <Text style={styles.inputLabel}>
                  {t("currency")} ({t("from")}):
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={fromCurrency}
                    onValueChange={(value) => setFromCurrency(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={themeColors.text}
                    itemStyle={
                      isDarkMode
                        ? styles.pickerItemDark
                        : styles.pickerItemLight
                    }
                  >
                    {currencies.map((currency) => (
                      <Picker.Item
                        key={currency.value}
                        label={currency.label}
                        value={currency.value}
                        color={themeColors.text}
                        style={
                          Platform.OS === "android"
                            ? { backgroundColor: themeColors.surface }
                            : {}
                        }
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {currencies.find((c) => c.value === fromCurrency)?.fullName ||
                    fromCurrency}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.swapButton}
                onPress={() => {
                  const temp = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(temp);
                  triggerHaptic();
                }}
              >
                <FontAwesome
                  name="exchange"
                  size={20}
                  color={themeColors.primary}
                />
              </TouchableOpacity>

              <View style={styles.currencyColumn}>
                <Text style={styles.inputLabel}>
                  {t("currency")} ({t("to")}):
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={toCurrency}
                    onValueChange={(value) => setToCurrency(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={themeColors.text}
                    itemStyle={
                      isDarkMode
                        ? styles.pickerItemDark
                        : styles.pickerItemLight
                    }
                  >
                    {currencies.map((currency) => (
                      <Picker.Item
                        key={currency.value}
                        label={currency.label}
                        value={currency.value}
                        color={themeColors.text}
                        style={{ backgroundColor: themeColors.surface }}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {currencies.find((c) => c.value === toCurrency)?.fullName ||
                    toCurrency}
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder={`${fromCurrency} ${t("amount")}`}
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={convertCurrency}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>💱 {t("convert")}</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case "unit":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("unitConverter")}</Text>

            <View style={styles.unitRow}>
              <View style={styles.unitColumn}>
                <Text style={styles.inputLabel}>
                  {t("unit")} ({t("from")}):
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={fromUnit}
                    onValueChange={(value) => setFromUnit(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={themeColors.text}
                    itemStyle={
                      isDarkMode
                        ? styles.pickerItemDark
                        : styles.pickerItemLight
                    }
                  >
                    {lengthUnits.map((unit) => (
                      <Picker.Item
                        key={unit.value}
                        label={unit.label}
                        value={unit.value}
                        color={themeColors.text}
                        style={{ backgroundColor: themeColors.surface }}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {lengthUnits.find((u) => u.value === fromUnit)?.label ||
                    fromUnit}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.swapButton}
                onPress={() => {
                  const temp = fromUnit;
                  setFromUnit(toUnit);
                  setToUnit(temp);
                  triggerHaptic();
                }}
              >
                <FontAwesome
                  name="exchange"
                  size={20}
                  color={themeColors.primary}
                />
              </TouchableOpacity>

              <View style={styles.unitColumn}>
                <Text style={styles.inputLabel}>
                  {t("unit")} ({t("to")}):
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={toUnit}
                    onValueChange={(value) => setToUnit(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={themeColors.text}
                    itemStyle={
                      isDarkMode
                        ? styles.pickerItemDark
                        : styles.pickerItemLight
                    }
                  >
                    {lengthUnits.map((unit) => (
                      <Picker.Item
                        key={unit.value}
                        label={unit.label}
                        value={unit.value}
                        color={themeColors.text}
                        style={{ backgroundColor: themeColors.surface }}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {lengthUnits.find((u) => u.value === toUnit)?.label || toUnit}
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder={t("enterAmount")}
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={convertUnit}>
              <Text style={styles.buttonText}>{t("convert")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "bmi":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("bmiCalculator")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("height")}
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t("weight")}
              placeholderTextColor={themeColors.textSecondary}
              value={amount2}
              onChangeText={setAmount2}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={calculateBMI}>
              <Text style={styles.buttonText}>
                {t("calculate")} {t("bmi")}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case "discount":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("discountCalculator")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("originalPrice")}
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t("discountPercentage")}
              placeholderTextColor={themeColors.textSecondary}
              value={discountPercent}
              onChangeText={setDiscountPercent}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={calculateDiscount}>
              <Text style={styles.buttonText}>
                {t("calculate")} {t("discount")}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case "stock":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("stockCalculator")}</Text>
            <TextInput
              style={styles.input}
              placeholder={`${t("stockName")} (${language === "tr" ? "İsteğe bağlı" : "Optional"})`}
              placeholderTextColor={themeColors.textSecondary}
              value={stockName}
              onChangeText={(text) => setStockName(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder={`${t("stockPrice")} (${currency})`}
              placeholderTextColor={themeColors.textSecondary}
              value={stockPrice}
              onChangeText={setStockPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={`${t("stockQuantity")} (${language === "tr" ? "Adet" : "Pieces"})`}
              placeholderTextColor={themeColors.textSecondary}
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={calculateStock}>
              <Text style={styles.buttonText}>📈 {t("calculateStock")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "binary":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("binaryConverter")}</Text>
            <TextInput
              style={styles.input}
              placeholder={`${t("binary")} ${t("numberToConvert")} (0 & 1)`}
              placeholderTextColor={themeColors.textSecondary}
              value={binaryInput}
              onChangeText={setBinaryInput}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={convertBinary}>
              <Text style={styles.buttonText}>{t("convert")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "date":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("dateCalculator")}</Text>

            {/* Gün hesaplama bölümü */}
            <View style={[styles.section, { marginBottom: 20 }]}>
              <Text style={styles.subsectionTitle}>{t("calculateDays")}</Text>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                placeholder={t("enterStartDate")}
                placeholderTextColor={themeColors.textSecondary}
                value={startDate}
                onChangeText={(text) => setStartDate(formatDateInput(text))}
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={[styles.input, { marginBottom: 12 }]}
                placeholder={t("enterEndDate")}
                placeholderTextColor={themeColors.textSecondary}
                value={endDate}
                onChangeText={(text) => setEndDate(formatDateInput(text))}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={calculateDaysBetween}
              >
                <Text style={styles.buttonText}>{t("calculateDays")}</Text>
              </TouchableOpacity>
              {daysBetweenResult ? (
                <View style={[styles.resultContainer, { marginTop: 12 }]}>
                  <Text style={styles.resultText}>{daysBetweenResult}</Text>
                </View>
              ) : null}
            </View>

            {/* Gün ekleme bölümü */}
            <View style={[styles.section, { marginBottom: 20 }]}>
              <Text style={styles.subsectionTitle}>{t("addDays")}</Text>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                placeholder={t("enterStartDate")}
                placeholderTextColor={themeColors.textSecondary}
                value={startDate}
                onChangeText={(text) => setStartDate(formatDateInput(text))}
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={[styles.input, { marginBottom: 12 }]}
                placeholder={t("enterDaysCount")}
                placeholderTextColor={themeColors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button} onPress={addDaysToDate}>
                <Text style={styles.buttonText}>{t("addDays")}</Text>
              </TouchableOpacity>
              {addDaysResult ? (
                <View style={[styles.resultContainer, { marginTop: 12 }]}>
                  <Text style={styles.resultText}>{addDaysResult}</Text>
                </View>
              ) : null}
            </View>

            {/* Gün çıkarma bölümü */}
            <View style={[styles.section, { marginBottom: 20 }]}>
              <Text style={styles.subsectionTitle}>{t("subtractDays")}</Text>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                placeholder={t("enterStartDate")}
                placeholderTextColor={themeColors.textSecondary}
                value={startDate}
                onChangeText={(text) => setStartDate(formatDateInput(text))}
                keyboardType="numeric"
                maxLength={10}
              />
              <TextInput
                style={[styles.input, { marginBottom: 12 }]}
                placeholder={t("enterDaysCount")}
                placeholderTextColor={themeColors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={subtractDaysFromDate}
              >
                <Text style={styles.buttonText}>{t("subtractDays")}</Text>
              </TouchableOpacity>
              {subtractDaysResult ? (
                <View style={[styles.resultContainer, { marginTop: 12 }]}>
                  <Text style={styles.resultText}>{subtractDaysResult}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      case "base":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("baseConverter")}</Text>
            <View style={[styles.pickerContainer, { marginBottom: 12 }]}>
              <Text style={styles.pickerLabel}>{t("sourceBase")}</Text>
              <Picker
                selectedValue={baseFrom}
                onValueChange={setBaseFrom}
                style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]}
              >
                <Picker.Item label={`2 (${t("binary")})`} value="2" />
                <Picker.Item label={`8 (${t("octal")})`} value="8" />
                <Picker.Item label={`10 (${t("decimal")})`} value="10" />
                <Picker.Item label={`16 (${t("hex")})`} value="16" />
              </Picker>
            </View>
            <View style={[styles.pickerContainer, { marginBottom: 12 }]}>
              <Text style={styles.pickerLabel}>{t("targetBase")}</Text>
              <Picker
                selectedValue={baseTo}
                onValueChange={setBaseTo}
                style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]}
              >
                <Picker.Item label={`2 (${t("binary")})`} value="2" />
                <Picker.Item label={`8 (${t("octal")})`} value="8" />
                <Picker.Item label={`10 (${t("decimal")})`} value="10" />
                <Picker.Item label={`16 (${t("hex")})`} value="16" />
              </Picker>
            </View>
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder={t("numberToConvert")}
              placeholderTextColor={themeColors.textSecondary}
              value={binaryInput}
              onChangeText={setBinaryInput}
            />
            <TouchableOpacity style={styles.button} onPress={convertBinary}>
              <Text style={styles.buttonText}>{t("convert")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "kdv":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("kdvCalculator")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterPrice")}
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.inputLabel}>{t("kdvRate")}:</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 15,
              }}
            >
              {["1", "10", "20"].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.button,
                    {
                      flex: 1,
                      marginHorizontal: 4,
                      backgroundColor:
                        kdvRateState === rate
                          ? themeColors.primary
                          : themeColors.surface,
                      borderWidth: 1,
                      borderColor: themeColors.secondary,
                    },
                  ]}
                  onPress={() => {
                    setKdvRateState(rate);
                    triggerHaptic();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color:
                          kdvRateState === rate ? "#fff" : themeColors.text,
                      },
                    ]}
                  >
                    %{rate}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={calculateKdv}>
              <Text style={styles.buttonText}>{t("calculate")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "loan":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("loanCalculator")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("loanAmount")}
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t("interestRate")}
              placeholderTextColor={themeColors.textSecondary}
              value={loanInterest}
              onChangeText={setLoanInterest}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t("loanTerm")}
              placeholderTextColor={themeColors.textSecondary}
              value={loanTermInput}
              onChangeText={setLoanTermInput}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={calculateLoan}>
              <Text style={styles.buttonText}>💰 {t("calculate")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "tip":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("tipCalculator")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("billAmount")}
              placeholderTextColor={themeColors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t("tipPercentage")}
              placeholderTextColor={themeColors.textSecondary}
              value={discountPercent}
              onChangeText={setDiscountPercent}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t("numberOfPeople")}
              placeholderTextColor={themeColors.textSecondary}
              value={tipPeople}
              onChangeText={setTipPeople}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={calculateTip}>
              <Text style={styles.buttonText}>🍽️ {t("calculate")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "age":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("ageCalculator")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterBirthDate")}
              placeholderTextColor={themeColors.textSecondary}
              value={startDate}
              onChangeText={(text) => setStartDate(formatDateInput(text))}
              keyboardType="numeric"
              maxLength={10}
            />
            <TouchableOpacity style={styles.button} onPress={calculateAge}>
              <Text style={styles.buttonText}>🎂 {t("calculate")}</Text>
            </TouchableOpacity>
          </View>
        );
      case "cost":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("costCalculator")}</Text>

            {/* Quick Currency Selector */}
            {renderCurrencySelector()}

            {/* Mode Selector */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  costMode === "fromRate" && {
                    backgroundColor: themeColors.primary,
                  },
                ]}
                onPress={() => {
                  setCostMode("fromRate");
                  setResult("");
                  setAnalysisCard(null);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    costMode === "fromRate" && styles.segmentedTabTextActive,
                  ]}
                >
                  {t("costModeRate")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  costMode === "fromPrices" && {
                    backgroundColor: themeColors.primary,
                  },
                ]}
                onPress={() => {
                  setCostMode("fromPrices");
                  setResult("");
                  setAnalysisCard(null);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    costMode === "fromPrices" && styles.segmentedTabTextActive,
                  ]}
                >
                  {t("costModePrices")}
                </Text>
              </TouchableOpacity>
            </View>

            {costMode === "fromRate" ? (
              <View>
                <Text style={styles.inputLabel}>
                  {t("currentPrice")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 54.50`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={costCurrentPrice}
                  onChangeText={setCostCurrentPrice}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>{t("profitLossRate")}:</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      {
                        backgroundColor: costIsProfit
                          ? "#16A34A"
                          : themeColors.background,
                        borderColor: costIsProfit
                          ? "#16A34A"
                          : themeColors.secondary,
                      },
                    ]}
                    onPress={() => {
                      setCostIsProfit(true);
                      triggerHaptic();
                    }}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        { color: costIsProfit ? "#fff" : themeColors.text },
                      ]}
                    >
                      + {t("isProfit")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      {
                        backgroundColor: !costIsProfit
                          ? "#DC2626"
                          : themeColors.background,
                        borderColor: !costIsProfit
                          ? "#DC2626"
                          : themeColors.secondary,
                      },
                    ]}
                    onPress={() => {
                      setCostIsProfit(false);
                      triggerHaptic();
                    }}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        { color: !costIsProfit ? "#fff" : themeColors.text },
                      ]}
                    >
                      - {t("isLoss")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder={
                    costIsProfit
                      ? `${t("placeholderEg")} 25 (%25 ${t("isProfit")})`
                      : `${t("placeholderEg")} 10 (%10 ${t("isLoss")})`
                  }
                  placeholderTextColor={themeColors.textSecondary}
                  value={costRate}
                  onChangeText={setCostRate}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>
                  {t("stockQuantityOptional")}:
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 1000`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={costQuantity}
                  onChangeText={setCostQuantity}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={styles.button} onPress={calculateCost}>
                  <Text style={styles.buttonText}>🏷️ {t("calculate")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>
                  {t("buyPrice")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 43.60`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={costBuyPrice}
                  onChangeText={setCostBuyPrice}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>
                  {t("currentPrice")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 54.50`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={costCurrentPrice}
                  onChangeText={setCostCurrentPrice}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>
                  {t("stockQuantityOptional")}:
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 1000`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={costQuantity}
                  onChangeText={setCostQuantity}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={styles.button} onPress={calculateCost}>
                  <Text style={styles.buttonText}>📊 {t("calculate")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      case "stopaj":
        return (
          <View>
            <Text style={styles.sectionTitle}>{t("stopajCalculator")}</Text>

            {/* Quick Currency Selector */}
            {renderCurrencySelector()}

            {/* Mode Selector (3 Modes) */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  stopajMode === "fromBalanceProfit" && {
                    backgroundColor: themeColors.primary,
                  },
                ]}
                onPress={() => {
                  setStopajMode("fromBalanceProfit");
                  setResult("");
                  setAnalysisCard(null);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    stopajMode === "fromBalanceProfit" &&
                      styles.segmentedTabTextActive,
                  ]}
                >
                  {t("stopajModeBalanceProfit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  stopajMode === "fromProfit" && {
                    backgroundColor: themeColors.primary,
                  },
                ]}
                onPress={() => {
                  setStopajMode("fromProfit");
                  setResult("");
                  setAnalysisCard(null);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    stopajMode === "fromProfit" &&
                      styles.segmentedTabTextActive,
                  ]}
                >
                  {t("stopajModeProfit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentedTab,
                  stopajMode === "fromBuySell" && {
                    backgroundColor: themeColors.primary,
                  },
                ]}
                onPress={() => {
                  setStopajMode("fromBuySell");
                  setResult("");
                  setAnalysisCard(null);
                  triggerHaptic();
                }}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    stopajMode === "fromBuySell" &&
                      styles.segmentedTabTextActive,
                  ]}
                >
                  {t("stopajModeBuySell")}
                </Text>
              </TouchableOpacity>
            </View>

            {stopajMode === "fromBalanceProfit" ? (
              <View>
                <Text style={styles.inputLabel}>
                  {t("totalPortfolioValue")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 4600`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={stopajTotalBalance}
                  onChangeText={setStopajTotalBalance}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>
                  {t("profitPortion")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 85`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={stopajProfitPortion}
                  onChangeText={setStopajProfitPortion}
                  keyboardType="numeric"
                />
              </View>
            ) : stopajMode === "fromProfit" ? (
              <View>
                <Text style={styles.inputLabel}>
                  {t("grossProfit")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 10000`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={stopajProfit}
                  onChangeText={setStopajProfit}
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <View>
                <Text style={styles.inputLabel}>
                  {t("principalOrBuyAmount")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 100000`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={stopajBuyAmount}
                  onChangeText={setStopajBuyAmount}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>
                  {t("saleOrTotalAmount")} ({currency}):
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${t("placeholderEg")} 117500`}
                  placeholderTextColor={themeColors.textSecondary}
                  value={stopajSellAmount}
                  onChangeText={setStopajSellAmount}
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Quick Stopaj Rates */}
            <Text style={styles.inputLabel}>{t("stopajRate")}:</Text>
            <View style={styles.ratePresetsRow}>
              {["0", "5", "7.5", "10", "15", "17.5", "20"].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.rateChip,
                    stopajRate === rate && {
                      backgroundColor: themeColors.primary,
                      borderColor: themeColors.primary,
                    },
                  ]}
                  onPress={() => {
                    setStopajRate(rate);
                    triggerHaptic();
                  }}
                >
                  <Text
                    style={[
                      styles.rateChipText,
                      stopajRate === rate && styles.rateChipTextActive,
                    ]}
                  >
                    %{rate}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder={`${t("stopajRate")} ${t("placeholderEg")} 17.5`}
              placeholderTextColor={themeColors.textSecondary}
              value={stopajRate}
              onChangeText={setStopajRate}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={calculateStopaj}>
              <Text style={styles.buttonText}>🏛️ {t("calculate")}</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const getStyles = () =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: themeColors.background,
      },
      scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: Platform.OS === "android" ? 40 : 20,
      },
      toolsHeaderContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        marginTop: Platform.OS === "android" ? 5 : 0,
        paddingHorizontal: 2,
      },
      toolsHeaderLeft: {
        flex: 1,
      },
      headerTitle: {
        color: themeColors.text,
        fontSize: 24,
        fontWeight: "bold",
      },
      headerSubtitle: {
        color: isDarkMode ? "#9CA3AF" : "#6B7280",
        fontSize: 12,
        marginTop: 2,
        fontWeight: "500",
      },
      allToolsHeaderButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: themeColors.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
      },
      allToolsHeaderButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 6,
      },
      topFeedbackToast: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDarkMode ? "rgba(22, 163, 74, 0.15)" : "#DCFCE7",
        borderColor: isDarkMode ? "rgba(22, 163, 74, 0.4)" : "#86EFAC",
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 7,
        paddingHorizontal: 12,
        marginBottom: 10,
        alignSelf: "flex-start",
      },
      topFeedbackToastText: {
        color: isDarkMode ? "#4ADE80" : "#16A34A",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 6,
      },
      categoryScrollWrapper: {
        height: 44,
        marginBottom: 10,
        flexShrink: 0,
      },
      categoryRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 2,
        paddingRight: 16,
        height: 44,
      },
      categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 34,
        paddingHorizontal: 12,
        borderRadius: 17,
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
        marginRight: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
      },
      activeCategoryChip: {
        backgroundColor: themeColors.primary,
        borderColor: themeColors.primary,
      },
      categoryChipText: {
        fontSize: 12,
        color: themeColors.text,
        fontWeight: "600",
      },
      activeCategoryChipText: {
        color: "#fff",
        fontWeight: "bold",
      },
      toolSelectorScrollWrapper: {
        height: 50,
        marginBottom: 16,
        flexShrink: 0,
      },
      toolSelectorRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 2,
        paddingRight: 16,
        height: 50,
      },
      toolButton: {
        backgroundColor: themeColors.surface,
        borderRadius: 16,
        height: 40,
        paddingHorizontal: 15,
        marginRight: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.18 : 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "transparent",
      },
      favoriteToolButton: {
        borderColor: isDarkMode ? "rgba(245, 158, 11, 0.45)" : "rgba(245, 158, 11, 0.55)",
        backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.1)" : "#FEF3C7",
      },
      selectedToolButton: {
        backgroundColor: themeColors.primary,
        borderColor: themeColors.primary,
      },
      toolButtonText: {
        color: themeColors.text,
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 6,
      },
      selectedToolButtonText: {
        color: "#fff",
        fontWeight: "bold",
      },
      moreToolsPill: {
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginRight: 10,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.2,
        borderColor: themeColors.primary,
        borderStyle: "dashed",
      },
      moreToolsPillText: {
        color: themeColors.primary,
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 6,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "flex-end",
      },
      modalContent: {
        backgroundColor: themeColors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "86%",
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
      },
      modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        paddingHorizontal: 4,
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: themeColors.text,
      },
      modalCloseButton: {
        padding: 6,
        borderRadius: 14,
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      },
      searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: themeColors.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
        height: 44,
      },
      searchIcon: {
        marginRight: 8,
      },
      searchInput: {
        flex: 1,
        color: themeColors.text,
        fontSize: 14,
        paddingVertical: 8,
      },
      searchClearButton: {
        padding: 4,
      },
      modalCategoryScrollWrapper: {
        height: 44,
        marginBottom: 12,
        flexShrink: 0,
      },
      modalCategoryRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 2,
        paddingRight: 16,
        height: 44,
      },
      gridContainer: {
        paddingBottom: 60,
      },
      gridRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      },
      gridCard: {
        width: "48%",
        backgroundColor: isDarkMode ? "#252528" : "#F3F4F6",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.2 : 0.06,
        shadowRadius: 3,
        elevation: 2,
      },
      selectedGridCard: {
        borderColor: themeColors.primary,
        borderWidth: 2,
      },
      gridCardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      },
      gridIconContainer: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "flex-start",
      },
      gridFavButton: {
        padding: 4,
      },
      gridCardTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: themeColors.text,
        marginBottom: 4,
      },
      selectedGridCardTitle: {
        color: themeColors.primary,
      },
      gridCardSubtitle: {
        fontSize: 11,
        color: isDarkMode ? "#9CA3AF" : "#6B7280",
        lineHeight: 15,
      },
      emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
      },
      emptyText: {
        fontSize: 14,
        color: isDarkMode ? "#9CA3AF" : "#6B7280",
        marginTop: 10,
      },
      toolContainer: {
        backgroundColor: themeColors.surface,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.13 : 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      sectionTitle: {
        color: themeColors.text,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
      },
      input: {
        backgroundColor: themeColors.background,
        color: themeColors.text,
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: themeColors.secondary,
      },
      button: {
        backgroundColor: themeColors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
      },
      buttonDisabled: {
        backgroundColor: "#666",
      },
      buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
      },
      inputLabel: {
        color: themeColors.text,
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
      },
      currencyRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 15,
      },
      currencyColumn: {
        flex: 1,
        minWidth: 0, // Bu önemli: flex child'in overflow olmasını sağlar
      },
      unitRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 15,
      },
      unitColumn: {
        flex: 1,
        minWidth: 0,
      },
      swapButton: {
        backgroundColor: themeColors.surface,
        padding: 8,
        borderRadius: 8,
        marginHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 25, // Label yüksekliği + picker yüksekliğinin yarısı için
      },
      pickerContainer: {
        backgroundColor: themeColors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: themeColors.secondary,
        overflow: "hidden",
        minHeight: 50,
      },
      pickerLabel: {
        color: themeColors.text,
        fontSize: 16,
        marginBottom: 8,
        fontWeight: "500",
      },
      picker: {
        color: themeColors.text,
        backgroundColor: "transparent",
        height: 50,
      },
      pickerDark: {
        backgroundColor: themeColors.surface,
      },
      pickerItemDark: {
        backgroundColor: themeColors.surface,
        color: themeColors.text,
      },
      pickerItemLight: {
        backgroundColor: themeColors.surface,
        color: themeColors.text,
      },
      refreshContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        paddingHorizontal: 5,
      },
      dataSourceText: {
        color: themeColors.textSecondary,
        fontSize: 12,
        fontStyle: "italic",
        flex: 1,
      },
      refreshButton: {
        backgroundColor: themeColors.surface,
        padding: 8,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10,
      },
      selectedCurrencyText: {
        color: themeColors.textSecondary,
        fontSize: 11,
        marginTop: 4,
        textAlign: "center",
        fontStyle: "italic",
      },
      result: {
        backgroundColor: themeColors.surface,
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: themeColors.secondary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      resultScrollView: {
        maxHeight: 350,
        marginTop: 10,
        flex: 1,
      },
      resultScrollContent: {
        flexGrow: 1,
      },
      resultText: {
        color: themeColors.text,
        fontSize: 15,
        fontWeight: "500",
        textAlign: "left",
        lineHeight: 24,
        letterSpacing: 0.5,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        paddingVertical: 2,
      },
      // Stock Results Styles
      stockResultsContainer: {
        backgroundColor: themeColors.surface,
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 5,
      },
      stockHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: themeColors.background,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.secondary,
      },
      stockIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: themeColors.accent + "20",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
      },
      stockHeaderText: {
        flex: 1,
      },
      stockTitle: {
        color: themeColors.text,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 2,
      },
      stockSubtitle: {
        color: themeColors.textSecondary,
        fontSize: 14,
        fontWeight: "500",
      },
      stockCurrentStatus: {
        backgroundColor: themeColors.background,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.secondary,
      },
      stockCurrentRow: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      stockCurrentItem: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 5,
      },
      stockCurrentLabel: {
        color: themeColors.textSecondary,
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      },
      stockCurrentValue: {
        color: themeColors.text,
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
      },
      stockSection: {
        backgroundColor: themeColors.surface,
        marginBottom: 1,
      },
      stockSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: themeColors.background,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.secondary,
      },
      stockSectionIcon: {
        marginRight: 12,
      },
      stockSectionEmoji: {
        fontSize: 20,
      },
      stockSectionTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
      },
      stockLevelsScroll: {
        backgroundColor: themeColors.surface,
      },
      stockLevelItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.secondary,
        backgroundColor: themeColors.surface,
      },
      stockLevelNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: themeColors.background,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
      },
      stockLevelNumberText: {
        color: themeColors.text,
        fontSize: 14,
        fontWeight: "bold",
      },
      stockLevelContent: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
      stockLevelPrice: {
        flex: 1,
      },
      stockLevelPriceText: {
        color: themeColors.text,
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
      },
      stockLevelPriceSubtext: {
        color: themeColors.textSecondary,
        fontSize: 12,
        fontWeight: "500",
      },
      stockLevelProfit: {
        alignItems: "flex-end",
        minWidth: 120,
      },
      stockLevelProfitText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
      },
      stockLevelProfitPercent: {
        fontSize: 12,
        fontWeight: "600",
      },
      // Date calculator styles
      section: {
        backgroundColor: themeColors.background,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: themeColors.secondary,
      },
      subsectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: themeColors.text,
        marginBottom: 12,
        textAlign: "center",
      },
      resultContainer: {
        backgroundColor: themeColors.surface,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: themeColors.accent,
      },
      resultTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: themeColors.primary,
        marginBottom: 8,
        textAlign: "center",
      },
      segmentedContainer: {
        flexDirection: "row",
        backgroundColor: themeColors.background,
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: themeColors.secondary,
      },
      segmentedTab: {
        flex: 1,
        minHeight: 52,
        paddingVertical: 10,
        paddingHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
      },
      segmentedTabText: {
        fontSize: 12,
        fontWeight: "700",
        color: themeColors.textSecondary,
        textAlign: "center",
        lineHeight: 16,
      },
      segmentedTabTextActive: {
        color: "#fff",
        fontWeight: "bold",
      },
      toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
      },
      toggleButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
      },
      toggleButtonText: {
        fontSize: 15,
        fontWeight: "bold",
      },
      ratePresetsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 12,
      },
      rateChip: {
        backgroundColor: themeColors.background,
        borderWidth: 1,
        borderColor: themeColors.secondary,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom: 6,
        minWidth: "15%",
        alignItems: "center",
      },
      rateChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: themeColors.text,
      },
      rateChipTextActive: {
        color: "#fff",
        fontWeight: "bold",
      },
      currencyBar: {
        marginBottom: 16,
      },
      currencyBarLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: themeColors.textSecondary,
        marginBottom: 8,
      },
      currencyChips: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      currencyChip: {
        flex: 1,
        backgroundColor: themeColors.background,
        borderWidth: 1,
        borderColor: themeColors.secondary,
        borderRadius: 8,
        paddingVertical: 8,
        marginHorizontal: 3,
        alignItems: "center",
        justifyContent: "center",
      },
      currencyChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: themeColors.text,
      },
      currencyChipTextActive: {
        color: "#fff",
        fontWeight: "bold",
      },
      analysisCardContainer: {
        marginTop: 20,
        backgroundColor: themeColors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: themeColors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.12,
        shadowRadius: 8,
        elevation: 4,
      },
      cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.08)",
      },
      cardHeaderTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: themeColors.primary,
        flex: 1,
      },
      copyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDarkMode
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.05)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themeColors.secondary,
      },
      copyButtonActive: {
        backgroundColor: "#16A34A",
        borderColor: "#16A34A",
      },
      copyButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: themeColors.text,
        marginLeft: 4,
      },
      copyButtonTextActive: {
        color: "#fff",
        fontWeight: "bold",
      },
      heroBox: {
        backgroundColor: isDarkMode
          ? "rgba(255,255,255,0.04)"
          : "rgba(0,0,0,0.03)",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: isDarkMode
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.08)",
      },
      heroLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: themeColors.textSecondary,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      },
      heroValueRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      heroValue: {
        fontSize: 26,
        fontWeight: "800",
        color: themeColors.primary,
        textAlign: "center",
      },
      heroCopyBadge: {
        marginLeft: 8,
        padding: 6,
        borderRadius: 8,
        backgroundColor: isDarkMode
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.05)",
      },
      heroSubText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#16A34A",
        marginTop: 6,
        textAlign: "center",
      },
      heroTapHint: {
        fontSize: 11,
        color: themeColors.textSecondary,
        marginTop: 6,
      },
      detailRowsContainer: {
        marginBottom: 10,
      },
      detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode
          ? "rgba(255,255,255,0.06)"
          : "rgba(0,0,0,0.05)",
      },
      detailRowLabel: {
        fontSize: 14,
        color: themeColors.textSecondary,
        flex: 1,
        marginRight: 8,
      },
      detailRowValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
      },
      detailRowValue: {
        fontSize: 14,
        fontWeight: "700",
        color: themeColors.text,
        textAlign: "right",
      },
      detailValueProfit: {
        color: "#16A34A",
      },
      detailValueLoss: {
        color: "#DC2626",
      },
      bottomButtonsContainer: {
        marginTop: 14,
        width: "100%",
      },
      primaryCopyButton: {
        width: "100%",
        backgroundColor: themeColors.primary,
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      primaryCopyButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 8,
      },
      secondaryCopyButton: {
        width: "100%",
        marginTop: 8,
        borderWidth: 1.5,
        borderColor: themeColors.secondary,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode
          ? "rgba(255,255,255,0.03)"
          : "rgba(0,0,0,0.02)",
      },
      secondaryCopyButtonText: {
        color: themeColors.text,
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
      },
      copyToastBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(22, 163, 74, 0.12)",
        borderWidth: 1,
        borderColor: "#16A34A",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        justifyContent: "center",
      },
      copyToastBannerText: {
        color: "#16A34A",
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 6,
      },
    });

  const styles = getStyles();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: 260 },
          ]}
        >
          {/* Grid & Quick Search Modal */}
          <Modal
            visible={isGridModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsGridModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalOverlay}
            >
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FontAwesome
                      name="th-large"
                      size={18}
                      color={themeColors.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.modalTitle}>{t("allTools")}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic();
                      setIsGridModalVisible(false);
                    }}
                    style={styles.modalCloseButton}
                  >
                    <FontAwesome name="times" size={18} color={themeColors.text} />
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={styles.searchBarContainer}>
                  <FontAwesome
                    name="search"
                    size={15}
                    color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={t("searchToolsPlaceholder")}
                    placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    clearButtonMode="while-editing"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery("")}
                      style={styles.searchClearButton}
                    >
                      <FontAwesome
                        name="times-circle"
                        size={16}
                        color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Category Pills Inside Modal */}
                <View style={styles.modalCategoryScrollWrapper}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modalCategoryRow}
                  >
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      const count =
                        cat.id === "all"
                          ? allToolItems.length
                          : cat.id === "favorites"
                          ? favoriteTools.length
                          : allToolItems.filter((i) => i.category === cat.id).length;

                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categoryChip,
                            isActive && styles.activeCategoryChip,
                          ]}
                          onPress={() => {
                            handleCategoryChange(cat.id);
                            modalGridScrollRef.current?.scrollTo({ y: 0, animated: true });
                          }}
                        >
                          <FontAwesome
                            name={cat.icon}
                            size={12}
                            color={isActive ? "#fff" : themeColors.text}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.categoryChipText,
                              isActive && styles.activeCategoryChipText,
                            ]}
                          >
                            {cat.title} ({count})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Grid of Tools */}
                <ScrollView
                  ref={modalGridScrollRef}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.gridContainer}
                >
                  {gridModalFilteredTools.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <FontAwesome
                        name="search"
                        size={36}
                        color={isDarkMode ? "#4B5563" : "#D1D5DB"}
                      />
                      <Text style={styles.emptyText}>{t("noMatchingTools")}</Text>
                    </View>
                  ) : (
                    <View style={styles.gridRow}>
                      {gridModalFilteredTools.map((tool) => {
                        const isSelected = selectedTool === tool.id;
                        const isFavorite = favoriteTools.includes(tool.id);

                        return (
                          <TouchableOpacity
                            key={tool.id}
                            style={[
                              styles.gridCard,
                              isSelected && styles.selectedGridCard,
                            ]}
                            onPress={() => {
                              switchTool(tool.id);
                              setIsGridModalVisible(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.gridCardTopRow}>
                              <View style={styles.gridIconContainer}>
                                <FontAwesome
                                  name={tool.icon}
                                  size={20}
                                  color={
                                    isSelected
                                      ? themeColors.primary
                                      : isDarkMode
                                      ? "#E5E7EB"
                                      : "#374151"
                                  }
                                />
                              </View>
                              <TouchableOpacity
                                hitSlop={{
                                  top: 10,
                                  bottom: 10,
                                  left: 10,
                                  right: 10,
                                }}
                                onPress={() => toggleFavorite(tool.id)}
                                style={styles.gridFavButton}
                              >
                                <FontAwesome
                                  name={isFavorite ? "star" : "star-o"}
                                  size={18}
                                  color={
                                    isFavorite
                                      ? "#F59E0B"
                                      : isDarkMode
                                      ? "#6B7280"
                                      : "#9CA3AF"
                                  }
                                />
                              </TouchableOpacity>
                            </View>

                            <Text
                              style={[
                                styles.gridCardTitle,
                                isSelected && styles.selectedGridCardTitle,
                              ]}
                              numberOfLines={1}
                            >
                              {tool.title}
                            </Text>
                            <Text
                              style={styles.gridCardSubtitle}
                              numberOfLines={2}
                            >
                              {tool.subtitle}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Top Header with All Tools (Grid) Button */}
          <View style={styles.toolsHeaderContainer}>
            <View style={styles.toolsHeaderLeft}>
              <Text style={styles.headerTitle}>{t("tools")}</Text>
              <Text style={styles.headerSubtitle}>
                {allToolItems.find((tool) => tool.id === selectedTool)?.subtitle || ""}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.allToolsHeaderButton}
              onPress={() => {
                triggerHaptic();
                setIsGridModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <FontAwesome name="th-large" size={13} color="#fff" />
              <Text style={styles.allToolsHeaderButtonText}>{t("allTools")}</Text>
            </TouchableOpacity>
          </View>

          {/* Toast Banner for Pin/Unpin Feedback */}
          {copiedToast && !analysisCard && (
            <View style={styles.topFeedbackToast}>
              <FontAwesome
                name="star"
                size={13}
                color={isDarkMode ? "#4ADE80" : "#16A34A"}
              />
              <Text style={styles.topFeedbackToastText}>
                {copiedToastText || t("resultCopiedToast")}
              </Text>
            </View>
          )}

          {/* Category Chips Bar */}
          <View style={styles.categoryScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const count =
                  cat.id === "all"
                    ? allToolItems.length
                    : cat.id === "favorites"
                    ? favoriteTools.length
                    : allToolItems.filter((i) => i.category === cat.id).length;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isActive && styles.activeCategoryChip,
                    ]}
                    onPress={() => {
                      handleCategoryChange(cat.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <FontAwesome
                      name={cat.icon}
                      size={12}
                      color={isActive ? "#fff" : themeColors.text}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isActive && styles.activeCategoryChipText,
                      ]}
                    >
                      {cat.title} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Horizontal Tools Bar (Favorites Pinned to the Left) */}
          <View style={styles.toolSelectorScrollWrapper}>
            <ScrollView
              ref={toolScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.toolSelectorRow}
            >
              {sortedTools.map((tool) => {
                const isSelected = selectedTool === tool.id;
                const isFavorite = favoriteTools.includes(tool.id);

                return (
                  <TouchableOpacity
                    key={tool.id}
                    style={[
                      styles.toolButton,
                      isSelected && styles.selectedToolButton,
                      isFavorite && !isSelected && styles.favoriteToolButton,
                    ]}
                    onPress={() => switchTool(tool.id)}
                    onLongPress={() => toggleFavorite(tool.id)}
                    delayLongPress={350}
                    activeOpacity={0.8}
                  >
                    {isFavorite && (
                      <FontAwesome
                        name="star"
                        size={11}
                        color={isSelected ? "#FFD700" : "#F59E0B"}
                        style={{ marginRight: 5 }}
                      />
                    )}
                    <FontAwesome
                      name={tool.icon}
                      size={15}
                      color={isSelected ? "#fff" : themeColors.text}
                    />
                    <Text
                      style={[
                        styles.toolButtonText,
                        isSelected && styles.selectedToolButtonText,
                      ]}
                    >
                      {tool.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Quick 'All Tools' pill at the end of scroll */}
              <TouchableOpacity
                style={styles.moreToolsPill}
                onPress={() => {
                  triggerHaptic();
                  setIsGridModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <FontAwesome name="th-large" size={12} color={themeColors.primary} />
                <Text style={styles.moreToolsPillText}>{t("openAllTools")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.toolContainer}>
            {renderTool()}

            {/* Modern Analysis Card with Copy & Row Spacing */}
            {analysisCard && (
              <View style={styles.analysisCardContainer}>
                {/* Floating Feedback Banner */}
                {copiedToast && (
                  <View style={styles.copyToastBanner}>
                    <FontAwesome name="check-circle" size={14} color="#16A34A" />
                    <Text style={styles.copyToastBannerText}>
                      {copiedToastText || t("resultCopiedToast")}
                    </Text>
                  </View>
                )}

                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeaderTitle}>
                    {analysisCard.title}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.copyButton,
                      copiedKey === "result" && styles.copyButtonActive,
                    ]}
                    onPress={() => handleCopy(analysisCard.heroValue, "result")}
                  >
                    <FontAwesome
                      name={copiedKey === "result" ? "check" : "copy"}
                      size={13}
                      color={copiedKey === "result" ? "#fff" : themeColors.text}
                    />
                    <Text
                      style={[
                        styles.copyButtonText,
                        copiedKey === "result" && styles.copyButtonTextActive,
                      ]}
                    >
                      {copiedKey === "result" ? t("copied") : t("copy")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Hero Box (Tıklanınca Yalnızca Sonucu Kopyalar) */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={[
                    styles.heroBox,
                    copiedKey === "result" && {
                      borderColor: "#16A34A",
                      backgroundColor: "rgba(22, 163, 74, 0.08)",
                    },
                  ]}
                  onPress={() => handleCopy(analysisCard.heroValue, "result")}
                >
                  <Text style={styles.heroLabel}>{analysisCard.heroLabel}</Text>
                  <View style={styles.heroValueRow}>
                    <Text style={styles.heroValue}>{analysisCard.heroValue}</Text>
                    <View style={styles.heroCopyBadge}>
                      <FontAwesome
                        name={copiedKey === "result" ? "check" : "copy"}
                        size={14}
                        color={
                          copiedKey === "result" ? "#16A34A" : themeColors.primary
                        }
                      />
                    </View>
                  </View>
                  {analysisCard.subHero && (
                    <Text style={styles.heroSubText}>
                      {analysisCard.subHero}
                    </Text>
                  )}
                  <Text style={styles.heroTapHint}>
                    {copiedKey === "result"
                      ? `✓ ${t("copied")}`
                      : `👆 ${language === "tr" ? "Sonucu kopyalamak için dokunun" : "Tap to copy result"}`}
                  </Text>
                </TouchableOpacity>

                {/* Detail Rows (Satıra dokunulunca o satırdaki değer kopyalanır) */}
                <View style={styles.detailRowsContainer}>
                  {analysisCard.rows.map((row, idx) => {
                    const isRowCopied = copiedKey === `row_${idx}`;
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.65}
                        style={[
                          styles.detailRow,
                          isRowCopied && {
                            backgroundColor: "rgba(22, 163, 74, 0.08)",
                          },
                        ]}
                        onPress={() => {
                          const cleaned = cleanNumericValue(row.value);
                          handleCopy(
                            row.value,
                            `row_${idx}`,
                            `${row.label}: ${cleaned}`,
                          );
                        }}
                      >
                        <Text style={styles.detailRowLabel}>{row.label}</Text>
                        <View style={styles.detailRowValueContainer}>
                          <Text
                            style={[
                              styles.detailRowValue,
                              row.isProfit && styles.detailValueProfit,
                              row.isLoss && styles.detailValueLoss,
                            ]}
                          >
                            {row.value}
                          </Text>
                          <FontAwesome
                            name={isRowCopied ? "check" : "copy"}
                            size={11}
                            color={
                              isRowCopied
                                ? "#16A34A"
                                : themeColors.textSecondary
                            }
                            style={{
                              marginLeft: 6,
                              opacity: isRowCopied ? 1 : 0.6,
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Alt Kopyalama Butonları: Biri Yalnızca Sonuç, Diğeri Tüm Özet */}
                <View style={styles.bottomButtonsContainer}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={[
                      styles.primaryCopyButton,
                      copiedKey === "result" && { backgroundColor: "#16A34A" },
                    ]}
                    onPress={() => handleCopy(analysisCard.heroValue, "result")}
                  >
                    <FontAwesome
                      name={copiedKey === "result" ? "check" : "copy"}
                      size={14}
                      color="#fff"
                    />
                    <Text style={styles.primaryCopyButtonText}>
                      {copiedKey === "result" ? t("copied") : t("copyResult")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={[
                      styles.secondaryCopyButton,
                      copiedKey === "summary" && {
                        borderColor: "#16A34A",
                        backgroundColor: "rgba(22, 163, 74, 0.15)",
                      },
                    ]}
                    onPress={() =>
                      handleCopy(
                        analysisCard.rawText,
                        "summary",
                        t("summaryCopiedToast"),
                      )
                    }
                  >
                    <FontAwesome
                      name={copiedKey === "summary" ? "check" : "file-text-o"}
                      size={14}
                      color={
                        copiedKey === "summary" ? "#16A34A" : themeColors.text
                      }
                    />
                    <Text
                      style={[
                        styles.secondaryCopyButtonText,
                        copiedKey === "summary" && { color: "#16A34A" },
                      ]}
                    >
                      {copiedKey === "summary" ? t("copied") : t("copySummary")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Plain result for other tools when no analysis card */}
            {result !== "" && !analysisCard && selectedTool !== "stock" && (
              <View style={{ marginTop: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginBottom: 8,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.copyButton,
                      copiedKey === "plain" && styles.copyButtonActive,
                    ]}
                    onPress={() => handleCopy(result, "plain")}
                  >
                    <FontAwesome
                      name={copiedKey === "plain" ? "check" : "copy"}
                      size={13}
                      color={copiedKey === "plain" ? "#fff" : themeColors.text}
                    />
                    <Text
                      style={[
                        styles.copyButtonText,
                        copiedKey === "plain" && styles.copyButtonTextActive,
                      ]}
                    >
                      {copiedKey === "plain" ? t("copied") : t("copy")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  style={styles.resultScrollView}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.resultScrollContent}
                  nestedScrollEnabled={true}
                  bounces={true}
                  scrollEventThrottle={16}
                >
                  <View style={styles.result}>
                    <Text style={styles.resultText}>{result}</Text>
                  </View>
                </ScrollView>
              </View>
            )}

            {selectedTool === "stock" && stockResults && (
              <StockResultsComponent stockData={stockResults} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
