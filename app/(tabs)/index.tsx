import NoteModal from '@/components/NoteModal';
import { useSettings } from '@/contexts/SettingsContext';
import { FontAwesome } from '@expo/vector-icons';
import { setStringAsync } from 'expo-clipboard';
import { useNavigation } from 'expo-router';
import { Parser } from 'expr-eval';
import React, { useLayoutEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IndexScreen() {
  const [input, setInput] = useState(''); // Ham input - hesaplamalar için
  const [displayInput, setDisplayInput] = useState(''); // Formatlanmış input - görüntüleme için
  const [result, setResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [instantResult, setInstantResult] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentCalculation, setCurrentCalculation] = useState('');
  const [currentResult, setCurrentResult] = useState('');
  const navigation = useNavigation();
  const { isDarkMode, defaultAngleUnit, highContrast, triggerHaptic, formatNumber, addToHistory, getHistory, clearHistory, addNoteToHistory, updateNoteInHistory, deleteNoteFromHistory, t } = useSettings();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Display input'u güncelle
  const updateDisplayInput = (rawInput: string) => {
    // Formatlamayı tamamen devre dışı bırak - sadece ham input göster
    setDisplayInput(rawInput);
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

      let expr = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '^').replace(/π/g, 'pi');
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
        let expr = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '^').replace(/π/g, 'pi');
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
        addToHistory(displayInput, formattedResult);
      } catch {
        setResult(t('calculationError'));
        setInstantResult('');
      }
    } else if (value === 'AC') {
      setInput('');
      setDisplayInput('');
      setResult('');
      setInstantResult('');
    } else if (value === '⌫') {
      const newInput = input.slice(0, -1);
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === '( )') {
      // Parantez mantığı - açık parantez sayısını kontrol et
      const openParens = (input.match(/\(/g) || []).length;
      const closeParens = (input.match(/\)/g) || []).length;
      const newInput = openParens > closeParens ? input + ')' : input + '(';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === '%') {
      const newInput = input + '/100';
      setInput(newInput);
      updateDisplayInput(input + '%');
      calculateInstantResult(newInput);
    } else if (value === '×') {
      const newInput = input + '*';
      setInput(newInput);
      updateDisplayInput(input + '×');
      calculateInstantResult(newInput);
    } else if (value === '÷') {
      const newInput = input + '/';
      setInput(newInput);
      updateDisplayInput(input + '÷');
      calculateInstantResult(newInput);
    } else {
      const newInput = input + value;
      setInput(newInput);
      updateDisplayInput(newInput);
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
      // Convert Turkish formatted number back to parser format (comma to dot)
      const parsableResult = result.replace(/\./g, '').replace(',', '.');
      setInput(parsableResult);
      updateDisplayInput(parsableResult);
      setResult('');
      setInstantResult('');
      triggerHaptic();
    }
  };

  const handleAddNote = () => {
    if (result && result !== t('calculationError')) {
      setCurrentCalculation(displayInput);
      setCurrentResult(result);
      setShowNoteModal(true);
    }
  };

  const handleSaveNote = (note: string) => {
    const historyItems = getHistory();
    const existingIndex = historyItems.findIndex(item => 
      item.calculation === currentCalculation && item.result === currentResult
    );
    
    if (existingIndex !== -1) {
      // Mevcut notu güncelle
      updateNoteInHistory(existingIndex, note);
      Alert.alert(t('success'), t('noteUpdated'), [{ text: t('ok') }]);
    } else {
      // Yeni not ekle (en son hesaplama için)
      if (historyItems.length > 0) {
        addNoteToHistory(0, note);
        Alert.alert(t('success'), t('noteAdded'), [{ text: t('ok') }]);
      }
    }
  };

  const handleDeleteNote = () => {
    const historyItems = getHistory();
    const index = historyItems.findIndex(item => 
      item.calculation === currentCalculation && item.result === currentResult
    );
    if (index !== -1) {
      deleteNoteFromHistory(index);
      Alert.alert(t('success'), t('noteDeleted'), [{ text: t('ok') }]);
    }
  };

  const buttons = [
    ['AC', '( )', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ];

  const FUNCTION_KEYS = ['AC', '=', '+', '-', '×', '÷', '%', '( )', '⌫'];

  const getStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode 
        ? (highContrast ? '#000000' : '#181818') 
        : (highContrast ? '#ffffff' : '#f5f5f5'),
      paddingHorizontal: 10,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      justifyContent: 'space-between',
    },
    displayContainer: {
      minHeight: 180,
      maxHeight: 250,
      marginBottom: 30,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    displayScrollView: {
      flex: 1,
    },
    displayScrollContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      paddingBottom: 10,
    },
    inputText: {
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#bbb') 
        : (highContrast ? '#000000' : '#333'),
      fontSize: 22,
      textAlign: 'right',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 5,
      lineHeight: 28,
      flexShrink: 1,
    },
    resultBox: {
      backgroundColor: isDarkMode 
        ? (highContrast ? '#333333' : '#232323') 
        : (highContrast ? '#f0f0f0' : '#e0e0e0'),
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginTop: 6,
      flex: 1,
      minHeight: 50,
    },
    resultContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginTop: 15,
      marginBottom: 10,
    },
    resultButtons: {
      flexDirection: 'row',
      marginLeft: 12,
    },
    actionButton: {
      backgroundColor: isDarkMode 
        ? (highContrast ? '#666666' : '#333') 
        : (highContrast ? '#e0e0e0' : '#f0f0f0'),
      borderRadius: 8,
      padding: 10,
      marginLeft: 6,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 36,
      minHeight: 36,
    },
    instantResultBox: {
      backgroundColor: isDarkMode 
        ? (highContrast ? '#444444' : '#2a2a2a') 
        : (highContrast ? '#e8e8e8' : '#f5f5f5'),
      borderRadius: 8,
      paddingTop: 14,
      paddingBottom: 16,
      paddingHorizontal: 16,
      marginTop: 15,
      marginBottom: 10,
      alignSelf: 'flex-end',
      opacity: 0.9,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    instantResultText: {
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#bbb') 
        : (highContrast ? '#000000' : '#666'),
      fontSize: 14,
      textAlign: 'right',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'sans-serif',
      fontStyle: 'italic',
      lineHeight: Platform.OS === 'android' ? 18 : 16,
      includeFontPadding: false,
      textAlignVertical: 'center',
      paddingVertical: Platform.OS === 'android' ? 2 : 0,
      flexShrink: 1,
    },
    resultText: {
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#fff') 
        : (highContrast ? '#000000' : '#000'),
      fontSize: 14,
      textAlign: 'right',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      lineHeight: 22,
      flexShrink: 1,
    },
    copyHint: {
      color: isDarkMode ? '#999' : '#666',
      fontSize: 12,
      textAlign: 'right',
      marginTop: 4,
      fontStyle: 'italic',
    },
    keypadContainer: { 
      justifyContent: 'flex-end',
      paddingBottom: 20,
      marginTop: 'auto',
    },
    row: { 
      flexDirection: 'row', 
      justifyContent: 'space-evenly', 
      marginBottom: 12,
      paddingHorizontal: 15,
    },
    button: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
      marginHorizontal: 2,
    },
    numberButton: {
      backgroundColor: isDarkMode ? '#333333' : '#fff',
    },
    functionButton: {
      backgroundColor: isDarkMode ? '#a6a6a6' : '#e0e0e0',
    },
    specialButton: {
      backgroundColor: isDarkMode ? '#a6a6a6' : '#d4d4d2',
    },
    equalsButton: {
      backgroundColor: isDarkMode ? '#ff9500' : '#ff9500',
    },
    buttonText: {
      fontSize: 24,
      textAlign: 'center',
      fontWeight: '400',
    },
    numberButtonText: {
      color: isDarkMode ? '#fff' : '#000',
    },
    functionButtonText: {
      color: isDarkMode ? '#fff' : '#000',
      fontWeight: '400',
    },
    specialButtonText: {
      color: '#000',
      fontWeight: '400',
    },
    equalsButtonText: {
      color: '#fff',
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
    historyItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: '100%',
    },
    historyCalculationContainer: {
      flex: 1,
    },
    noteIndicator: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#333333' : '#e8e8e8',
      marginLeft: 8,
    },
    noteContainer: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 8,
      padding: 10,
      marginTop: 8,
      borderLeftWidth: 3,
      borderLeftColor: isDarkMode ? '#ffb300' : '#007AFF',
    },
    noteText: {
      color: isDarkMode ? '#cccccc' : '#666666',
      fontSize: 14,
      fontStyle: 'italic',
      lineHeight: 20,
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
                    updateDisplayInput(item.calculation);
                    setResult(item.result);
                    setShowHistory(false);
                    triggerHaptic();
                  }}
                >
                  <View style={styles.historyItemHeader}>
                    <View style={styles.historyCalculationContainer}>
                      <Text style={styles.historyCalculation}>{item.calculation}</Text>
                      <Text style={styles.historyResult}>= {item.result}</Text>
                    </View>
                    {item.note && (
                      <TouchableOpacity
                        style={styles.noteIndicator}
                        onPress={() => {
                          setCurrentCalculation(item.calculation);
                          setCurrentResult(item.result);
                          setShowNoteModal(true);
                        }}
                      >
                        <FontAwesome name="sticky-note" size={14} color={isDarkMode ? '#ffb300' : '#007AFF'} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {item.note && (
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.displayContainer}>
        <ScrollView 
          style={styles.displayScrollView}
          contentContainerStyle={styles.displayScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.inputText}>{displayInput || '0'}</Text>
          
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
                <TouchableOpacity style={styles.actionButton} onPress={handleAddNote}>
                  <FontAwesome name="sticky-note" size={16} color={isDarkMode ? '#ffb300' : '#007AFF'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={useResultInNewCalculation}>
                  <FontAwesome name="plus" size={16} color={isDarkMode ? '#ffb300' : '#007AFF'} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
      <View style={styles.keypadContainer}>
        {buttons.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((value, j) => {
              const isSpecial = ['AC', '( )', '%'].includes(value);
              const isEquals = value === '=';
              const isFunction = FUNCTION_KEYS.includes(value) && !isSpecial && !isEquals;
              const isNumber = !FUNCTION_KEYS.includes(value);
              
              return value ? (
                <TouchableOpacity
                  key={value + i + j}
                  style={[
                    styles.button,
                    isNumber ? styles.numberButton : null,
                    isFunction ? styles.functionButton : null,
                    isSpecial ? styles.specialButton : null,
                    isEquals ? styles.equalsButton : null,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handlePress(value)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isNumber ? styles.numberButtonText : null,
                      isFunction ? styles.functionButtonText : null,
                      isSpecial ? styles.specialButtonText : null,
                      isEquals ? styles.equalsButtonText : null,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ) : null;
            })}
          </View>
        ))}
      </View>
      
      <NoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        initialNote={(() => {
          const historyItems = getHistory();
          const existingItem = historyItems.find(item => 
            item.calculation === currentCalculation && item.result === currentResult
          );
          return existingItem?.note || '';
        })()}
        calculation={currentCalculation}
        result={currentResult}
        isEditing={(() => {
          const historyItems = getHistory();
          const existingItem = historyItems.find(item => 
            item.calculation === currentCalculation && item.result === currentResult
          );
          return !!existingItem?.note;
        })()}
      />
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