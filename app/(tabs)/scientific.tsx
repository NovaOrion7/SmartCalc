import NoteModal from '@/components/NoteModal';
import { useSettings } from '@/contexts/SettingsContext';
import { FontAwesome } from '@expo/vector-icons';
import { setStringAsync } from 'expo-clipboard';
import { useNavigation } from 'expo-router';
import { Parser } from 'expr-eval';
import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const buttons = [
  ['2^nd', 'π', 'e', 'C', '⌫'],
  ['x^2', '1/x', '|x|', 'exp', 'mod'],
  ['√', '(', ')', 'n!', '/'],
  ['x^y', '7', '8', '9', '*'],
  ['10^x', '4', '5', '6', '-'],
  ['log', '1', '2', '3', '+'],
  ['ln', '0', '.', '='],
  ['sin', 'cos', 'tan', '+/-'],
];

const FUNCTION_KEYS = ['C', '⌫', '=', '+/-', 'mod', 'n!', 'exp', 'log', 'ln', 'sin', 'cos', 'tan', '√', 'x^2', 'x^y', '10^x', '|x|', '1/x'];

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
        <FontAwesome name="superscript" size={24} color="#ffb300" style={{ marginRight: 10 }} />
        <Text style={headerStyles.headerTitle}>{title}</Text>
      </View>
      <TouchableOpacity style={headerStyles.historyButton} onPress={onHistoryPress}>
        <FontAwesome name="history" size={16} color={isDarkMode ? '#ffb300' : '#666'} />
        <Text style={headerStyles.historyCount}>{historyCount}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ScientificScreen() {
  const [input, setInput] = useState(''); // Ham input - hesaplamalar için
  const [displayInput, setDisplayInput] = useState(''); // Formatlanmış input - görüntüleme için
  const [result, setResult] = useState('');
  const [instantResult, setInstantResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentCalculation, setCurrentCalculation] = useState('');
  const [currentResult, setCurrentResult] = useState('');
  const navigation = useNavigation();
  const { isDarkMode, defaultAngleUnit, highContrast, triggerHaptic, formatNumber, addToScientificHistory, getScientificHistory, clearScientificHistory, addNoteToScientificHistory, updateNoteInScientificHistory, deleteNoteFromScientificHistory, t } = useSettings();

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
      const lastChar = input.slice(-1);
      if (['+', '-', '*', '/', '^', '('].includes(lastChar)) {
        setInstantResult('');
        return;
      }

      let expr = input
        .replace(/π/g, 'pi')
        .replace(/mod\(([^()]+),([^()]+)\)/g, '($1 % $2)')
        .replace(/factorial\(([^()]+)\)/g, '($1)!');

      if (defaultAngleUnit === 'degree') {
        expr = expr.replace(/(sin|cos|tan)\(([^()]+)\)/g, (match, fn, arg) => {
          return `${fn}(((${arg}) * pi / 180))`;
        });
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
        // ✅ Boş veya sonu eksik ifadeleri engelle
        if (!input || /[+\-*/^.]$/.test(input.trim())) {
          setResult(t('calculationError'));
          setInstantResult('');
          return;
        }

        let expr = input
          .replace(/π/g, 'pi')
          .replace(/mod\(([^()]+),([^()]+)\)/g, '($1 % $2)')
          .replace(/factorial\(([^()]+)\)/g, '($1)!');

        // ✅ Trig fonksiyonlarını derece moduna göre dönüştür
        if (defaultAngleUnit === 'degree') {
          expr = expr.replace(/(sin|cos|tan)\(([^()]+)\)/g, (match, fn, arg) => {
            return `${fn}(((${arg}) * pi / 180))`;
          });
        }

        const parser = new Parser({
          operators: {
            factorial: true,
          },
        });

        // ✅ pi ve e sabitlerini tanımla
        parser.consts.pi = Math.PI;
        parser.consts.e = Math.E;

        const evalResult = parser.evaluate(expr);
        const formattedResult = formatNumber(evalResult);
        setResult(formattedResult);
        setInstantResult(''); // Anında sonucu temizle
        
        // Geçmişe ekle
        addToScientificHistory(input, formattedResult);
      } catch (err) {
        console.log('HATA:', err);
        setResult(t('calculationError'));
        setInstantResult('');
      }
    } else if (value === 'C') {
      setInput('');
      setDisplayInput('');
      setResult('');
      setInstantResult('');
    } else if (value === '⌫') {
      const newInput = input.slice(0, -1);
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === '+/-') {
      if (input) {
        const newInput = input.startsWith('-') ? input.slice(1) : '-' + input;
        setInput(newInput);
        updateDisplayInput(newInput);
        calculateInstantResult(newInput);
      }
    } else if (value === '1/x') {
      const newInput = input + '1/(';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === 'x^2') {
      const newInput = input + '^2';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === '√') {
      const newInput = input + 'sqrt(';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === '|x|') {
      const newInput = input + 'abs(';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === 'n!') {
      const newInput = input + 'factorial(';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'mod'].includes(value)) {
      const newInput = input + value + '(';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === 'π') {
      const newInput = input + 'pi';
      setInput(newInput);
      updateDisplayInput(newInput);
      calculateInstantResult(newInput);
    } else if (value === 'e') {
      const newInput = input + 'e';
      setInput(newInput);
      updateDisplayInput(newInput);
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

  const handleAddNote = () => {
    if (result && result !== t('calculationError')) {
      setCurrentCalculation(displayInput);
      setCurrentResult(result);
      setShowNoteModal(true);
    }
  };

  const handleSaveNote = (note: string) => {
    const historyItems = getScientificHistory();
    const existingIndex = historyItems.findIndex(item => 
      item.calculation === currentCalculation && item.result === currentResult
    );
    
    if (existingIndex !== -1) {
      // Mevcut notu güncelle
      updateNoteInScientificHistory(existingIndex, note);
      Alert.alert(t('success'), t('noteUpdated'), [{ text: t('ok') }]);
    } else {
      // Yeni not ekle (en son hesaplama için)
      if (historyItems.length > 0) {
        addNoteToScientificHistory(0, note);
        Alert.alert(t('success'), t('noteAdded'), [{ text: t('ok') }]);
      }
    }
  };

  const handleDeleteNote = () => {
    const historyItems = getScientificHistory();
    const index = historyItems.findIndex(item => 
      item.calculation === currentCalculation && item.result === currentResult
    );
    if (index !== -1) {
      deleteNoteFromScientificHistory(index);
      Alert.alert(t('success'), t('noteDeleted'), [{ text: t('ok') }]);
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

  const getStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode 
        ? (highContrast ? '#000000' : '#181818') 
        : (highContrast ? '#ffffff' : '#f5f5f5'),
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
      fontSize: 22,
      textAlign: 'right',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 2,
      lineHeight: 28,
      flexShrink: 1,
    },
    resultBox: {
      backgroundColor: isDarkMode ? '#232323' : '#e0e0e0',
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginTop: 6,
      alignSelf: 'flex-end',
      minWidth: 90,
    },
    instantResultBox: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
      borderRadius: 8,
      paddingTop: 14,
      paddingBottom: 16,
      paddingHorizontal: 16,
      marginTop: 8,
      alignSelf: 'flex-end',
      minWidth: 60,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    instantResultText: {
      color: isDarkMode ? '#888' : '#666',
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
    resultContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 6,
    },
    actionButton: {
      backgroundColor: isDarkMode ? '#444' : '#ddd',
      borderRadius: 6,
      padding: 8,
      marginLeft: 8,
      minWidth: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    resultText: {
      color: isDarkMode ? '#fff' : '#000',
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
    keypadScroll: { paddingBottom: 30 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    button: {
      flex: 1,
      margin: 2,
      borderRadius: 12,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.22 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      backgroundColor: isDarkMode ? '#232323' : '#fff',
      paddingVertical: 12,
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
      fontSize: 14,
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
    angleToggle: {
      alignSelf: 'flex-end',
      backgroundColor: isDarkMode ? '#2d2d2d' : '#007AFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#3a3a3a' : '#0056cc',
      marginBottom: 10,
    },
    angleText: {
      color: isDarkMode ? '#ffb300' : '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    historyPanel: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 12,
      maxHeight: 250,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    historyTitle: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: 'bold',
    },
    clearHistoryButton: {
      backgroundColor: isDarkMode ? '#ff4444' : '#ff6b6b',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    clearHistoryText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    historyList: {
      maxHeight: 180,
    },
    emptyHistoryText: {
      color: isDarkMode ? '#888' : '#666',
      textAlign: 'center',
      fontStyle: 'italic',
      padding: 20,
    },
    historyItem: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
    },
    historyCalculation: {
      color: isDarkMode ? '#ccc' : '#555',
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    historyResult: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
          title={t('scientific')} 
          isDarkMode={isDarkMode} 
          onHistoryPress={() => setShowHistory(!showHistory)}
          historyCount={getScientificHistory().length}
        />
      </View>
      
      {/* Geçmiş Paneli */}
      {showHistory && (
        <View style={styles.historyPanel}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{t('scientificHistory')}</Text>
            <TouchableOpacity 
              onPress={() => {
                clearScientificHistory();
                triggerHaptic();
              }}
              style={styles.clearHistoryButton}
            >
              <Text style={styles.clearHistoryText}>{t('clear')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {getScientificHistory().length === 0 ? (
              <Text style={styles.emptyHistoryText}>{t('noHistory')}</Text>
            ) : (
              getScientificHistory().map((item, index) => (
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
      
      <TouchableOpacity 
        style={styles.angleToggle} 
        onPress={() => triggerHaptic()}
      >
        <Text style={styles.angleText}>
          {defaultAngleUnit === 'degree' ? t('degree').toUpperCase().slice(0, 3) : t('radian').toUpperCase().slice(0, 3)}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.displayContainer}>
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
                <FontAwesome name="copy" size={14} color={isDarkMode ? '#ffb300' : '#007AFF'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddNote}>
                <FontAwesome name="sticky-note" size={14} color={isDarkMode ? '#ffb300' : '#007AFF'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={useResultInNewCalculation}>
                <FontAwesome name="plus" size={14} color={isDarkMode ? '#ffb300' : '#007AFF'} />
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
      
      <NoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        initialNote={(() => {
          const historyItems = getScientificHistory();
          const existingItem = historyItems.find(item => 
            item.calculation === currentCalculation && item.result === currentResult
          );
          return existingItem?.note || '';
        })()}
        calculation={currentCalculation}
        result={currentResult}
        isEditing={(() => {
          const historyItems = getScientificHistory();
          const existingItem = historyItems.find(item => 
            item.calculation === currentCalculation && item.result === currentResult
          );
          return !!existingItem?.note;
        })()}
      />
    </SafeAreaView>
  );
}