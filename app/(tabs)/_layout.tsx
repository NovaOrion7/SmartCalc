import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: '#101010' },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#666',
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
    </Tabs>
  );
}
