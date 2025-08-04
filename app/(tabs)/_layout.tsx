import { useSettings } from '@/contexts/SettingsContext';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { isDarkMode } = useSettings();
  
  return (
    <Tabs screenOptions={{
      tabBarStyle: { 
        backgroundColor: isDarkMode ? '#101010' : '#ffffff',
        borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
      },
      tabBarActiveTintColor: isDarkMode ? '#fff' : '#007AFF',
      tabBarInactiveTintColor: isDarkMode ? '#666' : '#999',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hesap Makinesi',
          tabBarIcon: ({ color }) => <FontAwesome name="calculator" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scientific"
        options={{
          title: 'Bilimsel',
          tabBarIcon: ({ color }) => <FontAwesome name="superscript" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Araçlar',
          tabBarIcon: ({ color }) => <FontAwesome name="wrench" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
