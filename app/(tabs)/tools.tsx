import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function ToolsScreen() {
  const { isDarkMode, triggerHaptic, formatNumber } = useSettings();
  const navigation = useNavigation();
  
  const [selectedTool, setSelectedTool] = useState('currency');
  const [amount, setAmount] = useState('');
  const [amount2, setAmount2] = useState(''); // BMI için kilo
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Döviz için
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('TRY');
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  
  // Birim çevirici için
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('centimeter');
  
  // İndirim hesaplayıcı için
  const [discountPercent, setDiscountPercent] = useState('20');

  const tools = [
    { id: 'currency', title: 'Döviz', icon: 'money' as const },
    { id: 'unit', title: 'Birim', icon: 'arrows-h' as const },
    { id: 'bmi', title: 'VKE', icon: 'heart' as const },
    { id: 'discount', title: 'İndirim', icon: 'percent' as const },
  ];

  const currencies = [
    { label: 'USD', value: 'USD', fullName: 'Amerikan Doları' },
    { label: 'EUR', value: 'EUR', fullName: 'Euro' },
    { label: 'TRY', value: 'TRY', fullName: 'Türk Lirası' },
    { label: 'GBP', value: 'GBP', fullName: 'İngiliz Sterlini' },
    { label: 'JPY', value: 'JPY', fullName: 'Japon Yeni' },
    { label: 'CHF', value: 'CHF', fullName: 'İsviçre Frangı' },
    { label: 'CAD', value: 'CAD', fullName: 'Kanada Doları' },
    { label: 'AUD', value: 'AUD', fullName: 'Avustralya Doları' },
    { label: 'SEK', value: 'SEK', fullName: 'İsveç Kronu' },
    { label: 'NOK', value: 'NOK', fullName: 'Norveç Kronu' },
    { label: 'DKK', value: 'DKK', fullName: 'Danimarka Kronu' },
    { label: 'PLN', value: 'PLN', fullName: 'Polonya Zlotisi' },
    { label: 'CZK', value: 'CZK', fullName: 'Çek Kronu' },
    { label: 'HUF', value: 'HUF', fullName: 'Macar Forinti' },
    { label: 'RUB', value: 'RUB', fullName: 'Rus Rublesi' },
    { label: 'CNY', value: 'CNY', fullName: 'Çin Yuanı' },
    { label: 'INR', value: 'INR', fullName: 'Hindistan Rupisi' },
    { label: 'KRW', value: 'KRW', fullName: 'Güney Kore Wonu' },
    { label: 'SGD', value: 'SGD', fullName: 'Singapur Doları' },
    { label: 'HKD', value: 'HKD', fullName: 'Hong Kong Doları' },
    { label: 'MXN', value: 'MXN', fullName: 'Meksika Pesosu' },
    { label: 'BRL', value: 'BRL', fullName: 'Brezilya Reali' },
    { label: 'ZAR', value: 'ZAR', fullName: 'Güney Afrika Randı' },
    { label: 'NZD', value: 'NZD', fullName: 'Yeni Zelanda Doları' },
    { label: 'ILS', value: 'ILS', fullName: 'İsrail Şekeli' },
    { label: 'THB', value: 'THB', fullName: 'Tayland Bahtı' },
    { label: 'MYR', value: 'MYR', fullName: 'Malezya Ringgiti' },
    { label: 'PHP', value: 'PHP', fullName: 'Filipin Pesosu' },
    { label: 'IDR', value: 'IDR', fullName: 'Endonezya Rupiahı' },
    { label: 'SAR', value: 'SAR', fullName: 'Suudi Arabistan Riyali' },
    { label: 'AED', value: 'AED', fullName: 'BAE Dirhemi' },
    { label: 'EGP', value: 'EGP', fullName: 'Mısır Poundu' },
    { label: 'QAR', value: 'QAR', fullName: 'Katar Riyali' },
    { label: 'KWD', value: 'KWD', fullName: 'Kuveyt Dinarı' },
    { label: 'BHD', value: 'BHD', fullName: 'Bahreyn Dinarı' },
    { label: 'OMR', value: 'OMR', fullName: 'Umman Riyali' },
    { label: 'JOD', value: 'JOD', fullName: 'Ürdün Dinarı' },
    { label: 'LBP', value: 'LBP', fullName: 'Lübnan Poundu' },
  ];

  const lengthUnits = [
    { label: 'Metre', value: 'meter', toMeter: 1 },
    { label: 'Santimetre', value: 'centimeter', toMeter: 0.01 },
    { label: 'Kilometre', value: 'kilometer', toMeter: 1000 },
    { label: 'İnç', value: 'inch', toMeter: 0.0254 },
    { label: 'Feet', value: 'feet', toMeter: 0.3048 },
    { label: 'Yard', value: 'yard', toMeter: 0.9144 },
  ];

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      // Frankfurter API kullanıyoruz - Avrupa Merkez Bankası verilerini kullanır
      const response = await fetch('https://api.frankfurter.app/latest');
      const data = await response.json();
      
      // Frankfurter EUR bazlı kur veriyor, USD bazlı yapmak için dönüştürüyoruz
      const eurToUsd = 1 / data.rates.USD;
      const usdBasedRates: {[key: string]: number} = {
        EUR: eurToUsd,
        USD: 1,
      };
      
      // Diğer dövizleri USD bazlı hesapla
      Object.keys(data.rates).forEach(currency => {
        if (currency !== 'USD') {
          usdBasedRates[currency] = data.rates[currency] * eurToUsd;
        }
      });
      
      setExchangeRates(usdBasedRates);
    } catch (error) {
      console.error('Döviz kurları alınamadı:', error);
      // Hata durumunda varsayılan kurlar (yaklaşık değerler)
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
        RUB: 91,
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
        SAR: 3.75,
        AED: 3.67,
        EGP: 48.5,
        QAR: 3.64,
        KWD: 0.31,
        BHD: 0.38,
        OMR: 0.38,
        JOD: 0.71,
        LBP: 89500,
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
      setResult('Geçerli bir miktar girin');
      return;
    }

    if (!exchangeRates[toCurrency] || !exchangeRates[fromCurrency]) {
      setResult('Döviz kurları yüklenemedi, lütfen tekrar deneyin');
      return;
    }

    const amountInUSD = Number(amount) / exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRates[toCurrency];
    
    // Kur bilgisini de göster
    const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    
    setResult(`${formatNumber(convertedAmount)} ${toCurrency}\n\n💱 Kur: 1 ${fromCurrency} = ${formatNumber(rate)} ${toCurrency}`);
    triggerHaptic();
  };

  const calculateBMI = () => {
    const height = parseFloat(amount); // boy (cm)
    const weight = parseFloat(amount2); // kilo (kg)
    
    if (!height || !weight || height <= 0 || weight <= 0) {
      setResult('Geçerli boy ve kilo değerleri girin');
      return;
    }
    
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
      category = 'Zayıf';
      color = '🔵';
    } else if (bmi < 25) {
      category = 'Normal';
      color = '🟢';
    } else if (bmi < 30) {
      category = 'Fazla kilolu';
      color = '🟡';
    } else {
      category = 'Obez';
      color = '🔴';
    }
    
    setResult(`${color} VKE: ${formatNumber(bmi)} (${category})`);
    triggerHaptic();
  };

  const calculateDiscount = () => {
    const price = parseFloat(amount);
    const discount = parseFloat(discountPercent);
    
    if (!price || !discount || price <= 0 || discount < 0 || discount > 100) {
      setResult('Geçerli fiyat ve indirim oranı girin');
      return;
    }
    
    const discountAmount = price * (discount / 100);
    const finalPrice = price - discountAmount;
    setResult(`${formatNumber(discountAmount)} TL indirim\nSon fiyat: ${formatNumber(finalPrice)} TL`);
    triggerHaptic();
  };

  const convertUnit = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setResult('Geçerli bir değer girin');
      return;
    }
    
    const fromUnitData = lengthUnits.find(u => u.value === fromUnit);
    const toUnitData = lengthUnits.find(u => u.value === toUnit);
    
    if (!fromUnitData || !toUnitData) {
      setResult('Birim seçimi hatası');
      return;
    }
    
    // Önce metre cinsine çevir, sonra hedef birime
    const valueInMeters = value * fromUnitData.toMeter;
    const convertedValue = valueInMeters / toUnitData.toMeter;
    
    setResult(`${formatNumber(convertedValue)} ${toUnitData.label.toLowerCase()}`);
    triggerHaptic();
  };

  const renderTool = () => {
    switch (selectedTool) {
      case 'currency':
        return (
          <View>
            <Text style={styles.sectionTitle}>Döviz Dönüştürücü</Text>
            
            <View style={styles.refreshContainer}>
              <Text style={styles.dataSourceText}>📊 Frankfurter API (Avrupa Merkez Bankası)</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={() => {
                  fetchExchangeRates();
                  triggerHaptic();
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <FontAwesome name="refresh" size={14} color="#007AFF" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.currencyRow}>
              <View style={styles.currencyColumn}>
                <Text style={styles.inputLabel}>Kimden:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={fromCurrency}
                    onValueChange={(value) => setFromCurrency(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={isDarkMode ? '#fff' : '#000'}
                    itemStyle={isDarkMode ? styles.pickerItemDark : styles.pickerItemLight}
                  >
                    {currencies.map((currency) => (
                      <Picker.Item 
                        key={currency.value} 
                        label={currency.label} 
                        value={currency.value}
                        color={Platform.OS === 'android' ? (isDarkMode ? '#ffffff' : '#000000') : (isDarkMode ? '#ffffff' : '#000000')}
                        style={Platform.OS === 'android' && isDarkMode ? { backgroundColor: '#333333' } : {}}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {currencies.find(c => c.value === fromCurrency)?.fullName || fromCurrency}
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
                <FontAwesome name="exchange" size={20} color="#007AFF" />
              </TouchableOpacity>
              
              <View style={styles.currencyColumn}>
                <Text style={styles.inputLabel}>Kime:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={toCurrency}
                    onValueChange={(value) => setToCurrency(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={isDarkMode ? '#fff' : '#000'}
                    itemStyle={isDarkMode ? styles.pickerItemDark : styles.pickerItemLight}
                  >
                    {currencies.map((currency) => (
                      <Picker.Item 
                        key={currency.value} 
                        label={currency.label} 
                        value={currency.value}
                        color={isDarkMode ? '#ffffff' : '#000000'}
                        style={isDarkMode ? { backgroundColor: '#333333' } : {}}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {currencies.find(c => c.value === toCurrency)?.fullName || toCurrency}
                </Text>
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder={`${fromCurrency} miktarı`}
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
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
                <Text style={styles.buttonText}>💱 Çevir</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case 'unit':
        return (
          <View>
            <Text style={styles.sectionTitle}>Birim Dönüştürücü</Text>
            
            <View style={styles.unitRow}>
              <View style={styles.unitColumn}>
                <Text style={styles.inputLabel}>Kimden:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={fromUnit}
                    onValueChange={(value) => setFromUnit(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={isDarkMode ? '#fff' : '#000'}
                    itemStyle={isDarkMode ? styles.pickerItemDark : styles.pickerItemLight}
                  >
                    {lengthUnits.map((unit) => (
                      <Picker.Item 
                        key={unit.value} 
                        label={unit.label} 
                        value={unit.value}
                        color={isDarkMode ? '#ffffff' : '#000000'}
                        style={isDarkMode ? { backgroundColor: '#333333' } : {}}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {lengthUnits.find(u => u.value === fromUnit)?.label || fromUnit}
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
                <FontAwesome name="exchange" size={20} color="#007AFF" />
              </TouchableOpacity>
              
              <View style={styles.unitColumn}>
                <Text style={styles.inputLabel}>Kime:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={toUnit}
                    onValueChange={(value) => setToUnit(value)}
                    style={[styles.picker, isDarkMode && styles.pickerDark]}
                    dropdownIconColor={isDarkMode ? '#fff' : '#000'}
                    itemStyle={isDarkMode ? styles.pickerItemDark : styles.pickerItemLight}
                  >
                    {lengthUnits.map((unit) => (
                      <Picker.Item 
                        key={unit.value} 
                        label={unit.label} 
                        value={unit.value}
                        color={isDarkMode ? '#ffffff' : '#000000'}
                        style={isDarkMode ? { backgroundColor: '#333333' } : {}}
                      />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.selectedCurrencyText} numberOfLines={1}>
                  {lengthUnits.find(u => u.value === toUnit)?.label || toUnit}
                </Text>
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Değer girin"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={convertUnit}>
              <Text style={styles.buttonText}>Çevir</Text>
            </TouchableOpacity>
          </View>
        );
      case 'bmi':
        return (
          <View>
            <Text style={styles.sectionTitle}>VKE Hesaplayıcı</Text>
            <TextInput
              style={styles.input}
              placeholder="Boy (cm)"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Kilo (kg)"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={amount2}
              onChangeText={setAmount2}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={calculateBMI}>
              <Text style={styles.buttonText}>VKE Hesapla</Text>
            </TouchableOpacity>
          </View>
        );
      case 'discount':
        return (
          <View>
            <Text style={styles.sectionTitle}>İndirim Hesaplayıcı</Text>
            <TextInput
              style={styles.input}
              placeholder="Fiyat (TL)"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="İndirim oranı (%)"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              value={discountPercent}
              onChangeText={setDiscountPercent}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={calculateDiscount}>
              <Text style={styles.buttonText}>İndirim Hesapla</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const getStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#181818' : '#f5f5f5',
      padding: 20,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
    },
    headerTitle: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 15,
    },
    toolSelectorScroll: {
      maxHeight: 50,
      marginBottom: 20,
    },
    toolSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    toolButton: {
      backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginRight: 10,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.18 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    selectedToolButton: {
      backgroundColor: '#007AFF',
    },
    toolButtonText: {
      color: isDarkMode ? '#fff' : '#333',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
    },
    selectedToolButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    toolContainer: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.13 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      textAlign: 'center',
    },
    input: {
      backgroundColor: isDarkMode ? '#292929' : '#f0f0f0',
      color: isDarkMode ? '#fff' : '#000',
      padding: 12,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#ddd',
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
    },
    buttonDisabled: {
      backgroundColor: '#666',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    inputLabel: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
    },
    currencyRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    currencyColumn: {
      flex: 1,
      minWidth: 0, // Bu önemli: flex child'in overflow olmasını sağlar
    },
    unitRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    unitColumn: {
      flex: 1,
      minWidth: 0,
    },
    swapButton: {
      backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
      padding: 8,
      borderRadius: 8,
      marginHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 25, // Label yüksekliği + picker yüksekliğinin yarısı için
    },
    pickerContainer: {
      backgroundColor: isDarkMode ? '#333333' : '#f0f0f0',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#555555' : '#ddd',
      overflow: 'hidden',
      minHeight: 50,
    },
    picker: {
      color: isDarkMode ? '#fff' : '#000',
      backgroundColor: 'transparent',
      height: 50,
    },
    pickerDark: {
      backgroundColor: '#333333',
    },
    pickerItemDark: {
      backgroundColor: '#333333',
      color: '#ffffff',
    },
    pickerItemLight: {
      backgroundColor: '#ffffff',
      color: '#000000',
    },
    refreshContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      paddingHorizontal: 5,
    },
    dataSourceText: {
      color: isDarkMode ? '#999' : '#666',
      fontSize: 12,
      fontStyle: 'italic',
      flex: 1,
    },
    refreshButton: {
      backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
      padding: 8,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },
    selectedCurrencyText: {
      color: isDarkMode ? '#999' : '#666',
      fontSize: 11,
      marginTop: 4,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    result: {
      backgroundColor: isDarkMode ? '#2d2d2d' : '#e8f4fd',
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#b3d9ff',
    },
    resultText: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  const styles = getStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Araçlar</Text>
      
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
              setResult('');
              setAmount('');
            }}
          >
            <FontAwesome 
              name={tool.icon} 
              size={16} 
              color={selectedTool === tool.id ? '#fff' : (isDarkMode ? '#fff' : '#333')} 
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
        
        {result !== '' && (
          <View style={styles.result}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
