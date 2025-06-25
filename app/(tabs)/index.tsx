import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Parser } from 'expr-eval';
import React, { useLayoutEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IndexScreen() {
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
        let expr = input.replace(/\^/g, '^').replace(/π/g, 'pi');
        if (isDegree) {
          // sin(x), cos(x), tan(x) fonksiyonlarının argümanlarını derece modunda radyana çevir
          expr = expr.replace(/(sin|cos|tan)\(([^()]+)\)/g, (match, fn, arg) => `${fn}(((${arg}) * pi / 180))`);
        }
        const parser = new Parser();
        const evalResult = parser.evaluate(expr);
        setResult(evalResult.toString());
      } catch {
        setResult('HATA');
      }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === 'CE') {
      setInput('');
    } else if (value === '⌫') {
      setInput(prev => prev.slice(0, -1));
    } else if (value === '+/-') {
      if (input) {
        if (input.startsWith('-')) setInput(input.slice(1));
        else setInput('-' + input);
      }
    } else if (value === '1/x') {
      setInput(prev => prev + '1/(');
    } else if (value === 'x^2') {
      setInput(prev => prev + '^2');
    } else if (value === '√') {
      setInput(prev => prev + 'sqrt(');
    } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(value)) {
      setInput(prev => prev + value + '(');
    } else if (value === 'π') {
      setInput(prev => prev + 'pi');
    } else if (value === 'e') {
      setInput(prev => prev + 'e');
    } else {
      setInput(prev => prev + value);
    }
  };

  const buttons = [
    ['(', ')', '^', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', 'C', '=', '.'],
  ];

  const FUNCTION_KEYS = ['C', '=', '+', '-', '*', '/', '^', '(', ')'];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? 32 : 0 }]}>
      <View style={{ backgroundColor: '#181818', borderBottomWidth: 1, borderBottomColor: '#232323', paddingBottom: 2 }}>
        <Header title="Hesap Makinesi" />
      </View>
      <View style={styles.displayContainer}>
        <Text style={styles.inputText}>{input || '0'}</Text>
        {result !== '' && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>= {result}</Text>
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

function Header({ title }: { title: string }) {
  return (
    <View style={headerStyles.headerContainer}>
      <FontAwesome name="calculator" size={24} color="#ffb300" style={{ marginRight: 10 }} />
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
    minHeight: 90,
    justifyContent: 'flex-end',
  },
  inputText: {
    color: '#bbb',
    fontSize: 30,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 2,
  },
  resultBox: {
    backgroundColor: '#232323',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
    minWidth: 90,
  },
  resultText: {
    color: '#fff',
    fontSize: 32,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: '#232323',
    paddingVertical: 16,
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
    fontSize: 18,
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
});