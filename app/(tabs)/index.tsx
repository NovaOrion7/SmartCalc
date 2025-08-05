import { useSettings } from '@/contexts/SettingsContext';
import { FontAwesome } from '@expo/vector-icons';
import { setStringAsync } from 'expo-clipboard';
import { useNavigation } from 'expo-router';
import { Parser } from 'expr-eval';
import React, { useLayoutEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IndexScreen() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [instantResult, setInstantResult] = useState('');
  const navigation = useNavigation();
  const { isDarkMode, defaultAngleUnit, triggerHaptic, formatNumber, addToHistory, getHistory, clearHistory, t } = useSettings();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Input'u kullanıcı dostu formatta göster (10.000 gibi)
  const formatInputDisplay = (input: string) => {
    // Sayıları binlik ayracı ile göster, operatörleri olduğu gibi bırak
    return input.replace(/\b\d{4,}\b/g, (match) => {
      const num = parseInt(match);
      return num.toLocaleString('tr-TR');
    });
  };

  // Anında sonuç hesaplama
  const calculateInstantResult = (input: string) => {
    if (!input || input.length === 0) {
      setInstantResult('');
      return;
    }
    
    try {
      // Basit bir kontrol: son karakter operatör değilse hesapla
      const lastChar = input.slice(-1);
      if (['+', '-', '*', '/', '^', '('].includes(lastChar)) {
        setInstantResult('');
        return;
      }

      let expr = input.replace(/\^/g, '^').replace(/π/g, 'pi');
      if (defaultAngleUnit === 'degree') {
        expr = expr.replace(/(sin|cos|tan)\(([^()]+)\)/g, (match, fn, arg) => `${fn}(((${arg}) * pi / 180))`);
      }
      const parser = new Parser();
      const evalResult = parser.evaluate(expr);
      setInstantResult(formatNumber(evalResult));
    } catch {
      setInstantResult('');
    }
  };

  const handlePress = (value: string) => {
    triggerHaptic();
    
    if (value === '=') {
      try {
        let expr = input.replace(/\^/g, '^').replace(/π/g, 'pi');
        if (defaultAngleUnit === 'degree') {
          // sin(x), cos(x), tan(x) fonksiyonlarının argümanlarını derece modunda radyana çevir
          expr = expr.replace(/(sin|cos|tan)\(([^()]+)\)/g, (match, fn, arg) => `${fn}(((${arg}) * pi / 180))`);
        }
        const parser = new Parser();
        const evalResult = parser.evaluate(expr);
        const formattedResult = formatNumber(evalResult);
        setResult(formattedResult);
        setInstantResult(''); // Anında sonucu temizle
        
        // Geçmişe ekle
        addToHistory(input, formattedResult);
      } catch {
        setResult(t('calculationError'));
        setInstantResult('');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
      setInstantResult('');
    } else if (value === 'CE') {
      setInput('');
      setInstantResult('');
    } else if (value === '⌫') {
      const newInput = input.slice(0, -1);
      setInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === '+/-') {
      if (input) {
        const newInput = input.startsWith('-') ? input.slice(1) : '-' + input;
        setInput(newInput);
        calculateInstantResult(newInput);
      }
    } else if (value === '1/x') {
      const newInput = input + '1/(';
      setInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === 'x^2') {
      const newInput = input + '^2';
      setInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === '√') {
      const newInput = input + 'sqrt(';
      setInput(newInput);
      calculateInstantResult(newInput);
    } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(value)) {
      const newInput = input + value + '(';
      setInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === 'π') {
      const newInput = input + 'pi';
      setInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === 'e') {
      const newInput = input + 'e';
      setInput(newInput);
      calculateInstantResult(newInput);
    } else {
      const newInput = input + value;
      setInput(newInput);
      calculateInstantResult(newInput);
    }
  };

  const copyToClipboard = async () => {
    if (result && result !== t('calculationError')) {
      try {
        await setStringAsync(result);
        triggerHaptic();
        Alert.alert(t('copied'), t('resultCopied'), [{ text: t('ok') }]);
      } catch {
        Alert.alert(t('error'), t('copyFailed'), [{ text: t('ok') }]);
      }
    }
  };

  const useResultInNewCalculation = () => {
    if (result && result !== t('calculationError')) {
      setInput(result);
      setResult('');
      setInstantResult('');
      triggerHaptic();
    }
  };

  // Alert'i kaldırdık, artık butonlar kullanıyoruz

  const buttons = [
    ['(', ')', '^', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', 'C', '=', '.'],
  ];

  const FUNCTION_KEYS = ['C', '=', '+', '-', '*', '/', '^', '(', ')'];

  const getStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#181818' : '#f5f5f5',
      justifyContent: 'flex-start',
      padding: 20,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
    },
    displayContainer: {
      marginBottom: 18,
      minHeight: 90,
      justifyContent: 'flex-end',
    },
    inputText: {
      color: isDarkMode ? '#bbb' : '#333',
      fontSize: 30,
      textAlign: 'right',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 2,
    },
    resultBox: {
      backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginTop: 6,
      flex: 1,
    },
    resultContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginTop: 10,
    },
    resultButtons: {
      flexDirection: 'row',
      marginLeft: 12,
    },
    actionButton: {
      backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
      borderRadius: 8,
      padding: 10,
      marginLeft: 6,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 36,
      minHeight: 36,
    },
    instantResultBox: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      marginTop: 4,
      alignSelf: 'flex-end',
      opacity: 0.8,
    },
    instantResultText: {
      color: isDarkMode ? '#bbb' : '#666',
      fontSize: 20,
      textAlign: 'right',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontStyle: 'italic',
    },
    resultText: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 32,
      textAlign: 'right',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    copyHint: {
      color: isDarkMode ? '#999' : '#666',
      fontSize: 12,
      textAlign: 'right',
      marginTop: 4,
      fontStyle: 'italic',
    },
    keypadScroll: { paddingBottom: 30 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    button: {
      flex: 1,
      margin: 3,
      borderRadius: 16,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.22 : 0.1,
      shadowRadius: 6,
      elevation: 4,
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      paddingVertical: 16,
    },
    numberButton: {
      backgroundColor: isDarkMode ? '#232323' : '#fff',
    },
    functionButton: {
      backgroundColor: isDarkMode ? '#2d2d2d' : '#007AFF',
      borderWidth: 1,
      borderColor: isDarkMode ? '#3a3a3a' : '#0056cc',
    },
    buttonText: {
      fontSize: 18,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    numberButtonText: {
      color: isDarkMode ? '#fff' : '#000',
    },
    functionButtonText: {
      color: isDarkMode ? '#ffb300' : '#fff',
      fontWeight: '600',
    },
    historyPanel: {
      backgroundColor: isDarkMode ? '#232323' : '#f0f0f0',
      maxHeight: 200,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#ddd',
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#ddd',
    },
    historyTitle: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    clearHistoryButton: {
      backgroundColor: '#FF3B30',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
    },
    clearHistoryText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    historyList: {
      maxHeight: 140,
    },
    emptyHistoryText: {
      color: isDarkMode ? '#999' : '#666',
      textAlign: 'center',
      padding: 20,
      fontStyle: 'italic',
    },
    historyItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#eee',
    },
    historyCalculation: {
      color: isDarkMode ? '#bbb' : '#666',
      fontSize: 14,
      marginBottom: 2,
    },
    historyResult: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const styles = getStyles();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? 32 : 0 }]}>
      <View style={{ 
        backgroundColor: isDarkMode ? '#181818' : '#f5f5f5', 
        borderBottomWidth: 1, 
        borderBottomColor: isDarkMode ? '#232323' : '#e0e0e0', 
        paddingBottom: 2 
      }}>
        <Header 
          title={t('calculator')} 
          isDarkMode={isDarkMode} 
          onHistoryPress={() => setShowHistory(!showHistory)}
          historyCount={getHistory().length}
        />
      </View>
      
      {showHistory && (
        <View style={styles.historyPanel}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{t('history')}</Text>
            <TouchableOpacity 
              onPress={() => {
                clearHistory();
                triggerHaptic();
              }}
              style={styles.clearHistoryButton}
            >
              <Text style={styles.clearHistoryText}>{t('clear')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {getHistory().length === 0 ? (
              <Text style={styles.emptyHistoryText}>{t('noHistory')}</Text>
            ) : (
              getHistory().map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.historyItem}
                  onPress={() => {
                    setInput(item.calculation);
                    setResult(item.result);
                    setShowHistory(false);
                    triggerHaptic();
                  }}
                >
                  <Text style={styles.historyCalculation}>{item.calculation}</Text>
                  <Text style={styles.historyResult}>= {item.result}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.displayContainer}>
        <Text style={styles.inputText}>{formatInputDisplay(input) || '0'}</Text>
        
        {/* Anında sonuç göster */}
        {instantResult && !result && (
          <View style={styles.instantResultBox}>
            <Text style={styles.instantResultText}>= {instantResult}</Text>
          </View>
        )}
        
        {/* Nihai sonuç ve butonlar */}
        {result !== '' && (
          <View style={styles.resultContainer}>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>= {result}</Text>
            </View>
            <View style={styles.resultButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
                <FontAwesome name="copy" size={16} color={isDarkMode ? '#ffb300' : '#007AFF'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={useResultInNewCalculation}>
                <FontAwesome name="plus" size={16} color={isDarkMode ? '#ffb300' : '#007AFF'} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.keypadScroll} showsVerticalScrollIndicator={false}>
        {buttons.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((value, j) =>
              value ? (
                <TouchableOpacity
                  key={value + i + j}
                  style={[
                    styles.button,
                    FUNCTION_KEYS.includes(value) ? styles.functionButton : styles.numberButton,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(value)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      FUNCTION_KEYS.includes(value) ? styles.functionButtonText : styles.numberButtonText,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View key={j} style={[styles.button, { backgroundColor: 'transparent' }]} />
              )
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, isDarkMode, onHistoryPress, historyCount }: { 
  title: string; 
  isDarkMode: boolean; 
  onHistoryPress: () => void;
  historyCount: number;
}) {
  const headerStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? '#181818' : '#f5f5f5',
      paddingTop: Platform.OS === 'android' ? 18 : 10,
      paddingBottom: 10,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#232323' : '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.08 : 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    historyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 15,
    },
    historyCount: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 12,
      marginLeft: 5,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={headerStyles.headerContainer}>
      <View style={headerStyles.leftSection}>
        <FontAwesome name="calculator" size={24} color="#ffb300" style={{ marginRight: 10 }} />
        <Text style={headerStyles.headerTitle}>{title}</Text>
      </View>
      <TouchableOpacity style={headerStyles.historyButton} onPress={onHistoryPress}>
        <FontAwesome name="history" size={16} color={isDarkMode ? '#ffb300' : '#666'} />
        <Text style={headerStyles.historyCount}>{historyCount}</Text>
      </TouchableOpacity>
    </View>
  );
}