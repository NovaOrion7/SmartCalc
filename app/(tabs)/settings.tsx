import { useSettings } from '@/contexts/SettingsContext';
import { useNavigation } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Alert, Animated, Linking, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    isDarkMode,
    showDecimals,
    vibrationEnabled,
    defaultAngleUnit,
    language,
    highContrast,
    updateSettings,
    triggerHaptic,
    clearHistory: clearCalculatorHistory,
    clearScientificHistory,
    t
  } = useSettings();

  // Animation refs
  const rateButtonScale = useRef(new Animated.Value(1)).current;
  const moreAppsButtonScale = useRef(new Animated.Value(1)).current;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Start animations
  useEffect(() => {
    // Rate button pulsing animation (simpler)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rateButtonScale, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: false, // Changed to false for compatibility
        }),
        Animated.timing(rateButtonScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false, // Changed to false for compatibility
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [rateButtonScale]);

  const handleDarkModeToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ isDarkMode: value });
  };

  const handleDecimalsToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ showDecimals: value });
  };

  const handleHighContrastToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ highContrast: value });
  };

  const handleVibrationToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ vibrationEnabled: value });
  };

  const handleAngleUnitChange = (unit: string) => {
    triggerHaptic();
    updateSettings({ defaultAngleUnit: unit as 'degree' | 'radian' });
  };

  const handleLanguageChange = (lang: string) => {
    triggerHaptic();
    updateSettings({ language: lang as 'tr' | 'en' });
  };

  const resetSettings = () => {
    Alert.alert(
      t('resetSettingsTitle'),
      t('resetSettingsDesc'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset'),
          style: 'destructive',
          onPress: () => {
            triggerHaptic();
            updateSettings({
              isDarkMode: true,
              showDecimals: true,
              vibrationEnabled: true,
              soundEnabled: false,
              defaultAngleUnit: 'degree'
            });
          }
        }
      ]
    );
  };

  const clearHistory = () => {
    Alert.alert(
      t('clearHistoryTitle'),
      t('clearHistoryDesc'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              triggerHaptic();
              // Gerçek geçmiş temizleme fonksiyonunu kullan
              clearCalculatorHistory();
              Alert.alert(t('success'), t('historyCleared'));
            } catch {
              Alert.alert(t('error'), 'An error occurred while clearing history.');
            }
          }
        }
      ]
    );
  };

  const clearScientificHistoryConfirm = () => {
    Alert.alert(
      t('clearScientificHistoryTitle'),
      t('clearScientificHistoryDesc'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              triggerHaptic();
              clearScientificHistory();
              Alert.alert(t('success'), t('scientificHistoryCleared'));
            } catch {
              Alert.alert(t('error'), 'An error occurred while clearing scientific history.');
            }
          }
        }
      ]
    );
  };

  const rateApp = () => {
    triggerHaptic();
    // Press animation
    Animated.sequence([
      Animated.timing(rateButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(rateButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.ismailjacob.SmartCalc';
    Linking.openURL(playStoreUrl).catch(() => {
      Alert.alert(t('error'), 'Play Store açılamıyor.');
    });
  };

  const moreApps = () => {
    triggerHaptic();
    // Press animation
    Animated.sequence([
      Animated.timing(moreAppsButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(moreAppsButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    const developerUrl = 'https://play.google.com/store/apps/dev?id=6946359108152061435';
    Linking.openURL(developerUrl).catch(() => {
      Alert.alert(t('error'), 'Play Store açılamıyor.');
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode 
        ? (highContrast ? '#000000' : '#181818') 
        : (highContrast ? '#ffffff' : '#f5f5f5'),
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#fff') 
        : (highContrast ? '#000000' : '#000'),
      marginTop: 20,
      marginBottom: 30,
      textAlign: 'center',
    },
    section: {
      backgroundColor: isDarkMode 
        ? (highContrast ? '#333333' : '#1a1a1a') 
        : (highContrast ? '#f0f0f0' : '#fff'),
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 15,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    lastSettingItem: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
      marginTop: 2,
    },
    angleButtonContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    angleButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? '#666' : '#ccc',
    },
    angleButtonActive: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    angleButtonText: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 14,
    },
    angleButtonTextActive: {
      color: '#fff',
    },
    languageButtonContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    languageButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? '#666' : '#ccc',
    },
    languageButtonActive: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    languageButtonText: {
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 14,
    },
    languageButtonTextActive: {
      color: '#fff',
    },
    resetButton: {
      backgroundColor: '#FF3B30',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    rateButton: {
      backgroundColor: '#34C759',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    moreAppsButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    clearButton: {
      backgroundColor: '#FF9500',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    versionText: {
      textAlign: 'center',
      color: isDarkMode ? '#666' : '#999',
      fontSize: 14,
      marginTop: 20,
    },
    developerText: {
      textAlign: 'center',
      color: isDarkMode ? '#888' : '#777',
      fontSize: 12,
      marginTop: 5,
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settings')}</Text>

        {/* Görünüm Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appearance')}</Text>
          
          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('darkMode')}</Text>
              <Text style={styles.settingDescription}>{t('darkModeDesc')}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('showDecimals')}</Text>
              <Text style={styles.settingDescription}>{t('showDecimalsDesc')}</Text>
            </View>
            <Switch
              value={showDecimals}
              onValueChange={handleDecimalsToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={showDecimals ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('highContrast')}</Text>
              <Text style={styles.settingDescription}>{t('highContrastDesc')}</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={handleHighContrastToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={highContrast ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('language')}</Text>
              <Text style={styles.settingDescription}>{t('languageDesc')}</Text>
            </View>
            <View style={styles.languageButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'tr' && styles.languageButtonActive
                ]}
                onPress={() => handleLanguageChange('tr')}
              >
                <Text style={[
                  styles.languageButtonText,
                  language === 'tr' && styles.languageButtonTextActive
                ]}>
                  TR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'en' && styles.languageButtonActive
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive
                ]}>
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hesaplama Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('calculation')}</Text>
          
          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('defaultAngleUnit')}</Text>
              <Text style={styles.settingDescription}>{t('defaultAngleUnitDesc')}</Text>
            </View>
            <View style={styles.angleButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.angleButton,
                  defaultAngleUnit === 'degree' && styles.angleButtonActive
                ]}
                onPress={() => handleAngleUnitChange('degree')}
              >
                <Text style={[
                  styles.angleButtonText,
                  defaultAngleUnit === 'degree' && styles.angleButtonTextActive
                ]}>
                  {t('degree')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.angleButton,
                  defaultAngleUnit === 'radian' && styles.angleButtonActive
                ]}
                onPress={() => handleAngleUnitChange('radian')}
              >
                <Text style={[
                  styles.angleButtonText,
                  defaultAngleUnit === 'radian' && styles.angleButtonTextActive
                ]}>
                  {t('radian')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Etkileşim Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('interaction')}</Text>
          
          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t('vibration')}</Text>
              <Text style={styles.settingDescription}>{t('vibrationDesc')}</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={vibrationEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Veri Yönetimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dataManagement')}</Text>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Text style={styles.buttonText}>{t('clearHistory')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearScientificHistoryConfirm}>
            <Text style={styles.buttonText}>{t('clearScientificHistory')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.buttonText}>{t('resetSettings')}</Text>
          </TouchableOpacity>
        </View>

        {/* Uygulama Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('application')}</Text>
          
          <Animated.View
            style={{
              transform: [{ scale: rateButtonScale }],
            }}
          >
            <TouchableOpacity style={styles.rateButton} onPress={rateApp}>
              <Text style={styles.buttonText}>⭐ {t('rateApp')}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ scale: moreAppsButtonScale }],
            }}
          >
            <TouchableOpacity style={styles.moreAppsButton} onPress={moreApps}>
              <Text style={styles.buttonText}>📱 {t('moreApps')}</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.versionText}>SmartCalc v1.0.0</Text>
          <Text style={styles.developerText}>{t('developer')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
