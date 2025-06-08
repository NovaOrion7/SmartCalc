import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Parser } from 'expr-eval';
import React, { useLayoutEffect, useState } from 'react';
import {
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

function Header({ title }: { title: string }) {
  return (
    <View style={headerStyles.headerContainer}>
      <FontAwesome name="superscript" size={24} color="#ffb300" style={{ marginRight: 10 }} />
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

export default function ScientificScreen() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isDegree, setIsDegree] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handlePress = (value: string) => {
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
        if (isDegree) {
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
        setResult(evalResult.toString());
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

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Bilimsel" />
      <View style={styles.displayContainer}>
        <Text style={styles.inputText}>{input || '0'}</Text>
        {result !== '' && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>= {result}</Text>
          </View>
        )}
      </View>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, isDegree && styles.toggleButtonActive]}
          onPress={() => setIsDegree(true)}
        >
          <Text style={[styles.toggleButtonText, isDegree && styles.toggleButtonTextActive]}>DEG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isDegree && styles.toggleButtonActive]}
          onPress={() => setIsDegree(false)}
        >
          <Text style={[styles.toggleButtonText, !isDegree && styles.toggleButtonTextActive]}>RAD</Text>
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  displayContainer: {
    marginBottom: 18,
    minHeight: 110,
    justifyContent: 'flex-end',
  },
  inputText: {
    color: '#bbb',
    fontSize: 36,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 2,
  },
  resultBox: {
    backgroundColor: '#232323',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
    alignSelf: 'flex-end',
    minWidth: 120,
  },
  resultText: {
    color: '#fff',
    fontSize: 40,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keypadScroll: { paddingBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: {
    flex: 1,
    margin: 4,
    borderRadius: 16,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#232323',
    paddingVertical: 18,
    transitionDuration: '150ms',
  },
  numberButton: {
    backgroundColor: '#232323',
  },
  functionButton: {
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  buttonText: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  numberButtonText: {
    color: '#fff',
  },
  functionButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 0,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#232323',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  toggleButtonActive: {
    backgroundColor: '#ffb300',
    borderColor: '#ffb300',
  },
  toggleButtonText: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButtonTextActive: {
    color: '#181818',
  },
});