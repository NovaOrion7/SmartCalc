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

function Header({ title, isDarkMode }: { title: string; isDarkMode: boolean }) {
  const headerStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
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
    headerTitle: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={headerStyles.headerContainer}>
      <FontAwesome name="superscript" size={24} color="#ffb300" style={{ marginRight: 10 }} />
      <Text style={headerStyles.headerTitle}>{title}</Text>
    </View>
  );
}

export default function ScientificScreen() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const navigation = useNavigation();
  const { isDarkMode, defaultAngleUnit, triggerHaptic, formatNumber } = useSettings();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handlePress = (value: string) => {
    triggerHaptic();
    
    if (value === '=') {
      try {
        // ✅ Boş veya sonu eksik ifadeleri engelle
        if (!input || /[+\-*/^.]$/.test(input.trim())) {
          setResult('HATA');
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
        setResult(formatNumber(evalResult));
      } catch (err) {
        console.log('HATA:', err);
        setResult('HATA');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === '⌫') {
      setInput((prev) => prev.slice(0, -1));
    } else if (value === '+/-') {
      if (input) {
        if (input.startsWith('-')) setInput(input.slice(1));
        else setInput('-' + input);
      }
    } else if (value === '1/x') {
      setInput((prev) => prev + '1/(');
    } else if (value === 'x^2') {
      setInput((prev) => prev + '^2');
    } else if (value === '√') {
      setInput((prev) => prev + 'sqrt(');
    } else if (value === '|x|') {
      setInput((prev) => prev + 'abs(');
    } else if (value === 'n!') {
      setInput((prev) => prev + 'factorial(');
    } else if (['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'mod'].includes(value)) {
      setInput((prev) => prev + value + '(');
    } else if (value === 'π') {
      setInput((prev) => prev + 'pi');
    } else if (value === 'e') {
      setInput((prev) => prev + 'e');
    } else {
      setInput((prev) => prev + value);
    }
  };

  const copyToClipboard = async () => {
    if (result && result !== 'HATA') {
      try {
        await setStringAsync(result);
        triggerHaptic();
        Alert.alert('Kopyalandı', 'Sonuç panoya kopyalandı', [{ text: 'Tamam' }]);
      } catch {
        Alert.alert('Hata', 'Kopyalama işlemi başarısız', [{ text: 'Tamam' }]);
      }
    }
  };

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
      fontSize: 28,
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
      alignSelf: 'flex-end',
      minWidth: 90,
    },
    resultText: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 30,
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
      position: 'absolute',
      top: Platform.OS === 'android' ? 50 : 30,
      right: 20,
      backgroundColor: isDarkMode ? '#2d2d2d' : '#007AFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#3a3a3a' : '#0056cc',
    },
    angleText: {
      color: isDarkMode ? '#ffb300' : '#fff',
      fontSize: 12,
      fontWeight: '600',
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
        <Header title="Bilimsel" isDarkMode={isDarkMode} />
      </View>
      
      <TouchableOpacity 
        style={styles.angleToggle} 
        onPress={() => triggerHaptic()}
      >
        <Text style={styles.angleText}>
          {defaultAngleUnit === 'degree' ? 'DEG' : 'RAD'}
        </Text>
      </TouchableOpacity>
      <View style={styles.displayContainer}>
        <Text style={styles.inputText}>{input || '0'}</Text>
        {result !== '' && (
          <TouchableOpacity style={styles.resultBox} onPress={copyToClipboard}>
            <Text style={styles.resultText}>= {result}</Text>
            <Text style={styles.copyHint}>Kopyalamak için dokunun</Text>
          </TouchableOpacity>
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