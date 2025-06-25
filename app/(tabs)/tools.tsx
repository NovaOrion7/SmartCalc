import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default function ToolsScreen() {
  const [selectedTool, setSelectedTool] = useState('currency');
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('TRY');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState('');

  // Birim dönüştürücü state'leri
  const [unitType, setUnitType] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [unitValue, setUnitValue] = useState('');

  // VKE state'leri
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // İndirim state'leri
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');

  // Sayı sistemi state'leri
  const [numeralInput, setNumeralInput] = useState('');
  const [numeralResult, setNumeralResult] = useState('');
  const [numeralBase, setNumeralBase] = useState('2');

  // Para birimi DropDownPicker state'leri
  const defaultCurrencies = [
    { label: 'TRY - Turkish Lira', value: 'TRY' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
  ];
  const [fromCurrencyOpen, setFromCurrencyOpen] = useState(false);
  const [toCurrencyOpen, setToCurrencyOpen] = useState(false);
  const [fromCurrencyValue, setFromCurrencyValue] = useState('TRY');
  const [toCurrencyValue, setToCurrencyValue] = useState('USD');
  const [currencyItems, setCurrencyItems] = useState(defaultCurrencies);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [currencyError, setCurrencyError] = useState('');

  const [unitTypeOpen, setUnitTypeOpen] = useState(false);
  const [unitTypeValue, setUnitTypeValue] = useState('length');
  const [unitTypeItems] = useState([
    { label: 'Uzunluk', value: 'length' },
    { label: 'Kütle', value: 'mass' },
    { label: 'Sıcaklık', value: 'temperature' },
  ]);

  const [fromUnitOpen, setFromUnitOpen] = useState(false);
  const [toUnitOpen, setToUnitOpen] = useState(false);
  const [fromUnitValue, setFromUnitValue] = useState('m');
  const [toUnitValue, setToUnitValue] = useState('cm');
  const [fromUnitItems, setFromUnitItems] = useState([
    { label: 'Metre (m)', value: 'm' },
    { label: 'Santimetre (cm)', value: 'cm' },
    { label: 'Kilometre (km)', value: 'km' },
  ]);
  const [toUnitItems, setToUnitItems] = useState([
    { label: 'Metre (m)', value: 'm' },
    { label: 'Santimetre (cm)', value: 'cm' },
    { label: 'Kilometre (km)', value: 'km' },
  ]);

  const [numeralBaseOpen, setNumeralBaseOpen] = useState(false);
  const [numeralBaseValue, setNumeralBaseValue] = useState('2');
  const [numeralBaseItems] = useState([
    { label: 'İkilik (2)', value: '2' },
    { label: 'Onluk (10)', value: '10' },
    { label: 'Onaltılık (16)', value: '16' },
  ]);

  const tools = [
    { id: 'currency', name: 'Döviz' },
    { id: 'unit', name: 'Birim' },
    { id: 'numeral', name: 'Sayı Sistemi' },
    { id: 'bmi', name: 'VKE' },
    { id: 'discount', name: 'İndirim' },
  ];

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (unitTypeValue === 'length') {
      setFromUnitItems([
        { label: 'Metre (m)', value: 'm' },
        { label: 'Santimetre (cm)', value: 'cm' },
        { label: 'Kilometre (km)', value: 'km' },
      ]);
      setToUnitItems([
        { label: 'Metre (m)', value: 'm' },
        { label: 'Santimetre (cm)', value: 'cm' },
        { label: 'Kilometre (km)', value: 'km' },
      ]);
      setFromUnitValue('m');
      setToUnitValue('cm');
    } else if (unitTypeValue === 'mass') {
      setFromUnitItems([
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Gram (g)', value: 'g' },
        { label: 'Pound (lb)', value: 'lb' },
      ]);
      setToUnitItems([
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Gram (g)', value: 'g' },
        { label: 'Pound (lb)', value: 'lb' },
      ]);
      setFromUnitValue('kg');
      setToUnitValue('g');
    } else if (unitTypeValue === 'temperature') {
      setFromUnitItems([
        { label: 'Celsius (°C)', value: 'C' },
        { label: 'Fahrenheit (°F)', value: 'F' },
        { label: 'Kelvin (K)', value: 'K' },
      ]);
      setToUnitItems([
        { label: 'Celsius (°C)', value: 'C' },
        { label: 'Fahrenheit (°F)', value: 'F' },
        { label: 'Kelvin (K)', value: 'K' },
      ]);
      setFromUnitValue('C');
      setToUnitValue('F');
    }
  }, [unitTypeValue]);

  useEffect(() => {
    const fetchSymbols = async () => {
      setCurrencyLoading(true);
      setCurrencyError('');
      try {
        const res = await fetch('https://api.frankfurter.app/currencies');
        const data = await res.json();
        if (data && typeof data === 'object') {
          const items = Object.keys(data).map(key => ({
            label: `${key} - ${data[key]}`,
            value: key
          }));
          setCurrencyItems(items);
          if (!items.find(i => i.value === fromCurrencyValue)) setFromCurrencyValue(items[0].value);
          if (!items.find(i => i.value === toCurrencyValue)) setToCurrencyValue(items[1]?.value || items[0].value);
        } else {
          setCurrencyError('Para birimi listesi alınamadı');
          setCurrencyItems(defaultCurrencies);
        }
      } catch (e) {
        setCurrencyError('Bağlantı hatası');
        setCurrencyItems(defaultCurrencies);
      } finally {
        setCurrencyLoading(false);
      }
    };
    fetchSymbols();
  }, []);

  const convertCurrency = async () => {
    setCurrencyError('');
    setResult('');
    if (!amount || isNaN(Number(amount))) {
      setCurrencyError('Geçerli bir miktar girin');
      return;
    }
    if (fromCurrencyValue === toCurrencyValue) {
      setResult(Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      return;
    }
    try {
      setCurrencyLoading(true);
      const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrencyValue}&to=${toCurrencyValue}`);
      const data = await response.json();
      if (data && data.rates && data.rates[toCurrencyValue] !== undefined) {
        setResult(Number(data.rates[toCurrencyValue]).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      } else {
        setCurrencyError('Dönüşüm yapılamadı');
      }
    } catch (error) {
      setCurrencyError('Bağlantı hatası');
    } finally {
      setCurrencyLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num === 0) return '0.00';
    if (Math.abs(num) < 1) return num.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const convertUnit = () => {
    const value = parseFloat(unitValue);
    if (isNaN(value)) {
      setResult('Geçerli bir sayı girin');
      return;
    }

    let result = 0;
    switch (unitTypeValue) {
      case 'length':
        if (fromUnitValue === toUnitValue) result = value;
        else if (fromUnitValue === 'm' && toUnitValue === 'cm') result = value * 100;
        else if (fromUnitValue === 'm' && toUnitValue === 'km') result = value / 1000;
        else if (fromUnitValue === 'cm' && toUnitValue === 'm') result = value / 100;
        else if (fromUnitValue === 'cm' && toUnitValue === 'km') result = value / 100000;
        else if (fromUnitValue === 'km' && toUnitValue === 'm') result = value * 1000;
        else if (fromUnitValue === 'km' && toUnitValue === 'cm') result = value * 100000;
        break;
      case 'mass':
        if (fromUnitValue === toUnitValue) result = value;
        else if (fromUnitValue === 'kg' && toUnitValue === 'g') result = value * 1000;
        else if (fromUnitValue === 'kg' && toUnitValue === 'lb') result = value * 2.20462;
        else if (fromUnitValue === 'g' && toUnitValue === 'kg') result = value / 1000;
        else if (fromUnitValue === 'g' && toUnitValue === 'lb') result = value * 0.00220462;
        else if (fromUnitValue === 'lb' && toUnitValue === 'kg') result = value / 2.20462;
        else if (fromUnitValue === 'lb' && toUnitValue === 'g') result = value * 453.592;
        break;
      case 'temperature':
        if (fromUnitValue === toUnitValue) result = value;
        else if (fromUnitValue === 'C' && toUnitValue === 'F') result = (value * 9/5) + 32;
        else if (fromUnitValue === 'C' && toUnitValue === 'K') result = value + 273.15;
        else if (fromUnitValue === 'F' && toUnitValue === 'C') result = (value - 32) * 5/9;
        else if (fromUnitValue === 'F' && toUnitValue === 'K') result = ((value - 32) * 5/9) + 273.15;
        else if (fromUnitValue === 'K' && toUnitValue === 'C') result = value - 273.15;
        else if (fromUnitValue === 'K' && toUnitValue === 'F') result = ((value - 273.15) * 9/5) + 32;
        break;
    }
    setResult(formatNumber(result));
  };

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // cm'yi m'ye çevir
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w)) {
      setResult('Geçerli değerler girin');
      return;
    }
    const bmi = w / (h * h);
    let category = '';
    if (bmi < 18.5) category = 'Zayıf';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Fazla Kilolu';
    else category = 'Obez';
    setResult(`VKE: ${bmi.toFixed(1)} - ${category}`);
  };

  const calculateDiscount = () => {
    const p = parseFloat(price);
    const d = parseFloat(discount);
    if (isNaN(p) || isNaN(d)) {
      setResult('Geçerli değerler girin');
      return;
    }
    const discountedPrice = p - (p * d / 100);
    setResult(`İndirimli Fiyat: ${discountedPrice.toFixed(2)} TL`);
  };

  const convertNumeral = () => {
    let input = numeralInput.trim().replace(/\s+/g, '');
    if (!input) {
      setNumeralResult('Geçerli bir sayı girin');
      return;
    }
    // Tabana uygunluk kontrolü
    let valid = false;
    if (numeralBaseValue === '2') valid = /^[01]+$/.test(input);
    else if (numeralBaseValue === '10') valid = /^\d+$/.test(input);
    else if (numeralBaseValue === '16') valid = /^[0-9a-fA-F]+$/.test(input);
    if (!valid) {
      setNumeralResult('Geçerli bir sayı girin');
      return;
    }
    try {
      let decimal = 0;
      if (numeralBaseValue === '2') decimal = parseInt(input, 2);
      else if (numeralBaseValue === '10') decimal = parseInt(input, 10);
      else if (numeralBaseValue === '16') decimal = parseInt(input, 16);
      if (isNaN(decimal)) throw new Error();
      const binary = decimal.toString(2);
      const hex = decimal.toString(16).toUpperCase();
      setNumeralResult(`İkilik: ${binary}\nOnluk: ${decimal}\nOnaltılık: ${hex}`);
    } catch {
      setNumeralResult('Geçerli bir sayı girin');
    }
  };

  // Sayı sistemi input kısıtlaması
  const handleNumeralInput = (text: string) => {
    let filtered = text.replace(/\s+/g, '');
    if (numeralBaseValue === '2') filtered = filtered.replace(/[^01]/gi, '');
    else if (numeralBaseValue === '10') filtered = filtered.replace(/[^0-9]/gi, '');
    else if (numeralBaseValue === '16') filtered = filtered.replace(/[^0-9a-fA-F]/gi, '');
    setNumeralInput(filtered);
  };

  // Diğer araçlar için sadece sayı ve tek nokta
  const handleNumericInput = (text: string, setter: (v: string) => void) => {
    let filtered = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    // Sadece bir nokta olsun
    const parts = filtered.split('.');
    if (parts.length > 2) filtered = parts[0] + '.' + parts.slice(1).join('');
    setter(filtered);
  };

  const renderCurrencyConverter = () => (
    <View style={styles.toolContainer}>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={text => handleNumericInput(text, setAmount)}
        keyboardType="numeric"
        placeholder="Miktar girin"
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ flex: 1, zIndex: 9999, overflow: 'visible' }}>
          <DropDownPicker
            open={fromCurrencyOpen}
            value={fromCurrencyValue}
            items={currencyItems}
            setOpen={setFromCurrencyOpen}
            setValue={setFromCurrencyValue}
            setItems={setCurrencyItems}
            placeholder="Kaynak para birimi"
            searchable={true}
            searchPlaceholder="Ara..."
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownBox}
            zIndex={3000}
            listMode="MODAL"
          />
        </View>
        <TouchableOpacity
          style={styles.swapButton}
          onPress={() => {
            const temp = fromCurrencyValue;
            setFromCurrencyValue(toCurrencyValue);
            setToCurrencyValue(temp);
          }}
          activeOpacity={0.7}
        >
          <FontAwesome name="exchange" size={22} color="#ffb300" />
        </TouchableOpacity>
        <View style={{ flex: 1, zIndex: 9998, overflow: 'visible' }}>
          <DropDownPicker
            open={toCurrencyOpen}
            value={toCurrencyValue}
            items={currencyItems}
            setOpen={setToCurrencyOpen}
            setValue={setToCurrencyValue}
            setItems={setCurrencyItems}
            placeholder="Hedef para birimi"
            searchable={true}
            searchPlaceholder="Ara..."
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownBox}
            zIndex={2000}
            listMode="MODAL"
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={convertCurrency} disabled={currencyLoading}>
        <Text style={styles.buttonText}>{currencyLoading ? '...' : 'Dönüştür'}</Text>
      </TouchableOpacity>
      {currencyError ? (
        <Text style={[styles.result, { color: 'red', fontSize: 16 }]}>{currencyError}</Text>
      ) : null}
      {result && !currencyError ? (
        <Text style={styles.result}>{result}</Text>
      ) : null}
    </View>
  );

  const renderUnitConverter = () => (
    <View style={styles.toolContainer}>
      <DropDownPicker
        open={unitTypeOpen}
        value={unitTypeValue}
        items={unitTypeItems}
        setOpen={setUnitTypeOpen}
        setValue={setUnitTypeValue}
        setItems={() => {}}
        style={styles.dropdown}
        containerStyle={{ marginBottom: 8, zIndex: 4000 }}
        dropDownContainerStyle={styles.dropdownBox}
        zIndex={4000}
        disabled={false}
      />
      <TextInput
        style={styles.input}
        value={unitValue}
        onChangeText={text => handleNumericInput(text, setUnitValue)}
        keyboardType="numeric"
        placeholder="Değer girin"
      />
      <View style={styles.pickerContainer}>
        <DropDownPicker
          open={fromUnitOpen}
          value={fromUnitValue}
          items={fromUnitItems}
          setOpen={setFromUnitOpen}
          setValue={setFromUnitValue}
          setItems={setFromUnitItems}
          style={styles.dropdown}
          containerStyle={{ flex: 1, marginRight: 5, zIndex: 3000 }}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={3000}
        />
        <DropDownPicker
          open={toUnitOpen}
          value={toUnitValue}
          items={toUnitItems}
          setOpen={setToUnitOpen}
          setValue={setToUnitValue}
          setItems={setToUnitItems}
          style={styles.dropdown}
          containerStyle={{ flex: 1, marginLeft: 5, zIndex: 2000 }}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={2000}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={convertUnit}>
        <Text style={styles.buttonText}>Dönüştür</Text>
      </TouchableOpacity>
      {result ? <Text style={styles.result}>{result}</Text> : null}
    </View>
  );

  const renderBMICalculator = () => (
    <View style={styles.toolContainer}>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={text => handleNumericInput(text, setHeight)}
        keyboardType="numeric"
        placeholder="Boy (cm)"
      />
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={text => handleNumericInput(text, setWeight)}
        keyboardType="numeric"
        placeholder="Kilo (kg)"
      />
      <TouchableOpacity style={styles.button} onPress={calculateBMI}>
        <Text style={styles.buttonText}>Hesapla</Text>
      </TouchableOpacity>
      {result ? <Text style={styles.result}>{result}</Text> : null}
    </View>
  );

  const renderDiscountCalculator = () => (
    <View style={styles.toolContainer}>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={text => handleNumericInput(text, setPrice)}
        keyboardType="numeric"
        placeholder="Fiyat (TL)"
      />
      <TextInput
        style={styles.input}
        value={discount}
        onChangeText={text => handleNumericInput(text, setDiscount)}
        keyboardType="numeric"
        placeholder="İndirim (%)"
      />
      <TouchableOpacity style={styles.button} onPress={calculateDiscount}>
        <Text style={styles.buttonText}>Hesapla</Text>
      </TouchableOpacity>
      {result ? <Text style={styles.result}>{result}</Text> : null}
    </View>
  );

  const renderNumeralConverter = () => (
    <View style={styles.toolContainer}>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <DropDownPicker
          open={numeralBaseOpen}
          value={numeralBaseValue}
          items={numeralBaseItems}
          setOpen={setNumeralBaseOpen}
          setValue={setNumeralBaseValue}
          setItems={() => {}}
          style={styles.dropdown}
          containerStyle={{ flex: 1, marginRight: 5, zIndex: 3000 }}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={3000}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 8 }]}
          value={numeralInput}
          onChangeText={handleNumeralInput}
          placeholder={numeralBaseValue === '2' ? '1010' : numeralBaseValue === '10' ? '10' : 'A' }
          keyboardType="default"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={convertNumeral}>
        <Text style={styles.buttonText}>Dönüştür</Text>
      </TouchableOpacity>
      {numeralResult ? <Text style={styles.result}>{numeralResult}</Text> : null}
    </View>
  );

  function Header({ title }: { title: string }) {
    return (
      <View style={headerStyles.headerContainer}>
        <FontAwesome name="wrench" size={24} color="#ffb300" style={{ marginRight: 10 }} />
        <Text style={headerStyles.headerTitle}>{title}</Text>
      </View>
    );
  }

  const headerStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#181818',
      paddingTop: Platform.OS === 'android' ? 18 : 10,
      paddingBottom: 10,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#232323',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    headerTitle: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? 32 : 0 }]}>
        <View style={{ backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#232323', paddingBottom: 2 }}>
          <Header title="Araçlar" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolSelectorScroll} contentContainerStyle={styles.toolSelectorRow}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.toolButton,
                selectedTool === tool.id && styles.selectedToolButton,
              ]}
              onPress={() => setSelectedTool(tool.id)}
            >
              <Text style={[
                styles.toolButtonText,
                selectedTool === tool.id && styles.selectedToolButtonText,
              ]} numberOfLines={1} ellipsizeMode="tail">
                {tool.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.scrollContent}>
          {selectedTool === 'currency' && renderCurrencyConverter()}
          {selectedTool === 'unit' && renderUnitConverter()}
          {selectedTool === 'bmi' && renderBMICalculator()}
          {selectedTool === 'discount' && renderDiscountCalculator()}
          {selectedTool === 'numeral' && renderNumeralConverter()}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  toolSelectorScroll: {
    maxHeight: 44,
    marginTop: 8,
    marginBottom: 2,
  },
  toolSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  toolButton: {
    backgroundColor: '#232323',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedToolButton: {
    backgroundColor: '#ffb300',
  },
  toolButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedToolButtonText: {
    color: '#181818',
    fontWeight: 'bold',
  },
  scrollContent: {
    overflow: 'visible',
  },
  toolContainer: {
    padding: 14,
    marginTop: 16,
    backgroundColor: '#232323',
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: '#292929',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
    alignItems: 'center',
  },
  picker: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#222',
    marginHorizontal: 2,
    height: 40,
    fontSize: 12,
    borderRadius: 8,
  },
  pickerLight: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#222',
    marginHorizontal: 2,
    height: 40,
    borderRadius: 8,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#ffb300',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#181818',
    fontSize: 15,
    fontWeight: 'bold',
  },
  result: {
    color: '#fff',
    fontSize: 19,
    textAlign: 'center',
    marginTop: 12,
    backgroundColor: '#292929',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: 'center',
    minWidth: 80,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#aaa',
    minHeight: 40,
    fontSize: 14,
    zIndex: 1000,
    borderRadius: 8,
  },
  dropdownBox: {
    backgroundColor: '#fff',
    borderColor: '#aaa',
    zIndex: 1000,
    borderRadius: 8,
  },
  swapButton: {
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 8,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 2,
  },
}); 