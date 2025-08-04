import { useSettings } from '@/contexts/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    isDarkMode,
    showDecimals,
    vibrationEnabled,
    soundEnabled,
    defaultAngleUnit,
    updateSettings,
    triggerHaptic
  } = useSettings();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleDarkModeToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ isDarkMode: value });
  };

  const handleDecimalsToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ showDecimals: value });
  };

  const handleVibrationToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ vibrationEnabled: value });
  };

  const handleSoundToggle = (value: boolean) => {
    triggerHaptic();
    updateSettings({ soundEnabled: value });
  };

  const handleAngleUnitChange = (unit: string) => {
    triggerHaptic();
    updateSettings({ defaultAngleUnit: unit as 'degree' | 'radian' });
  };

  const resetSettings = () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
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
      'Geçmişi Temizle',
      'Hesap makinesi geçmişini temizlemek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              triggerHaptic();
              await AsyncStorage.removeItem('calculator_history');
              Alert.alert('Başarılı', 'Geçmiş temizlendi.');
            } catch {
              Alert.alert('Hata', 'Geçmiş temizlenirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#000' : '#f5f5f5',
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
      marginTop: 20,
      marginBottom: 30,
      textAlign: 'center',
    },
    section: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
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
    resetButton: {
      backgroundColor: '#FF3B30',
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ayarlar</Text>

        {/* Görünüm Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>
          
          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Karanlık Mod</Text>
              <Text style={styles.settingDescription}>Uygulamayı karanlık temada kullan</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Ondalık Sayıları Göster</Text>
              <Text style={styles.settingDescription}>Sonuçlarda ondalık kısmı göster</Text>
            </View>
            <Switch
              value={showDecimals}
              onValueChange={handleDecimalsToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={showDecimals ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Hesaplama Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesaplama</Text>
          
          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Varsayılan Açı Birimi</Text>
              <Text style={styles.settingDescription}>Trigonometrik fonksiyonlar için</Text>
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
                  Derece
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
                  Radyan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Etkileşim Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkileşim</Text>
          
          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Titreşim</Text>
              <Text style={styles.settingDescription}>Tuşlara basıldığında titreşim</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={vibrationEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Ses Efektleri</Text>
              <Text style={styles.settingDescription}>Tuşlara basıldığında ses</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={soundEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Veri Yönetimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Text style={styles.buttonText}>Geçmişi Temizle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.buttonText}>Ayarları Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* Uygulama Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <Text style={styles.versionText}>SmartCalc v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
