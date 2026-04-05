import BannerAdComponent from "@/components/BannerAdComponent";
import { useSettings } from "@/contexts/SettingsContext";
import { FontAwesome } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabBarWithAd(props: BottomTabBarProps) {
  const { isDarkMode, getThemeColors } = useSettings();
  const themeColors = getThemeColors();
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: isDarkMode ? "#101010" : "#ffffff" }}>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          backgroundColor: themeColors.background,
        }}
      >
        <BannerAdComponent />
      </View>
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? "#333" : "#e0e0e0",
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const color = isFocused
            ? isDarkMode
              ? "#fff"
              : "#007AFF"
            : isDarkMode
              ? "#666"
              : "#999";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: "calculator" | "superscript" | "wrench" | "cog" =
            "calculator";
          let iconSize = 24;
          if (route.name === "index") {
            iconName = "calculator";
          } else if (route.name === "scientific") {
            iconName = "superscript";
            iconSize = 22;
          } else if (route.name === "tools") {
            iconName = "wrench";
          } else if (route.name === "settings") {
            iconName = "cog";
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome name={iconName} size={iconSize} color={color} />
              <Text style={{ color, fontSize: 10, marginTop: 4 }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isDarkMode, t, getThemeColors } = useSettings();
  const themeColors = getThemeColors();

  return (
    <Tabs
      tabBar={(props) => <TabBarWithAd {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("calculator"),
        }}
      />
      <Tabs.Screen
        name="scientific"
        options={{
          title: t("scientific"),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: t("tools"),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
        }}
      />
    </Tabs>
  );
}
