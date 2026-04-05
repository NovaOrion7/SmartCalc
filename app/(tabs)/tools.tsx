import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";

export default function ToolsScreen() {
  const {
    isDarkMode,
    triggerHaptic,
    formatNumber,
    t,
    language,
    getThemeColors,
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

  const tools = [
    { id: "currency", title: t("currency"), icon: "money" as const },
    { id: "unit", title: t("unit"), icon: "arrows-h" as const },
    { id: "bmi", title: t("bmi"), icon: "heart" as const },
    { id: "discount", title: t("discount"), icon: "percent" as const },
    { id: "stock", title: t("stock"), icon: "line-chart" as const },
    { id: "binary", title: t("binary"), icon: "code" as const },
    { id: "base", title: t("base"), icon: "calculator" as const },
    { id: "date", title: t("dateCalculator"), icon: "calendar" as const },
    { id: "kdv", title: t("kdv"), icon: "file-text-o" as const },
    { id: "loan", title: t("loan"), icon: "credit-card" as const },
    { id: "tip", title: t("tip"), icon: "cutlery" as const },
    { id: "age", title: t("age"), icon: "birthday-cake" as const },
  ];

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
      // Frankfurter API kullanıyoruz - Avrupa Merkez Bankası verilerini kullanır
      const response = await fetch("https://api.frankfurter.app/latest");
      const data = await response.json();

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
                {formatNumber(stockData.price)} TL
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
                {formatNumber(stockData.capital)} TL
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
                      {formatNumber(level.price)} TL
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
                      +{formatNumber(level.profit)} TL
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
                      {formatNumber(level.price)} TL
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
                      -{formatNumber(level.loss)} TL
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
      stockName: stockName || "STOCK",
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
              onChangeText={setStockName}
            />
            <TextInput
              style={styles.input}
              placeholder={`${t("stockPrice")} (TL)`}
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
      headerTitle: {
        color: themeColors.text,
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 15,
      },
      toolSelectorScroll: {
        maxHeight: 50,
        marginBottom: 20,
      },
      toolSelectorRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 4,
      },
      toolButton: {
        backgroundColor: themeColors.surface,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginRight: 10,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.18 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      selectedToolButton: {
        backgroundColor: themeColors.primary,
      },
      toolButtonText: {
        color: themeColors.text,
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 6,
      },
      selectedToolButtonText: {
        color: "#fff",
        fontWeight: "bold",
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
    });

  const styles = getStyles();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={styles.headerTitle}>{t("tools")}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.toolSelectorScroll}
          contentContainerStyle={styles.toolSelectorRow}
        >
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolButton,
                selectedTool === tool.id && styles.selectedToolButton,
              ]}
              onPress={() => {
                triggerHaptic();
                setSelectedTool(tool.id);
                setResult("");
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
              }}
            >
              <FontAwesome
                name={tool.icon}
                size={16}
                color={selectedTool === tool.id ? "#fff" : themeColors.text}
              />
              <Text
                style={[
                  styles.toolButtonText,
                  selectedTool === tool.id && styles.selectedToolButtonText,
                ]}
              >
                {tool.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.toolContainer}>
          {renderTool()}

          {result !== "" && selectedTool !== "stock" && (
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
          )}

          {selectedTool === "stock" && stockResults && (
            <StockResultsComponent stockData={stockResults} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
