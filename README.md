# 🧮 Smart Calc

**Smart Calc** is a modern calculator app built with **React Native** and **Expo**, offering both **scientific features** and practical **daily tools**. It is designed with a clean UI, customizable dark/light theme, haptic feedback, and touch-optimized layout.

---

## ✨ Features

### 🧠 Scientific Calculator
- Arithmetic operations (+, −, ×, ÷)
- Trigonometric functions: `sin`, `cos`, `tan`
- Powers and roots: `x²`, `xʸ`, `√`, `10^x`
- Logarithmic: `log`, `ln`, `exp`
- Constants: `π`, `e`
- Factorial: `n!`
- Absolute: `|x|`
- Inverse: `1/x`
- Modulo and negative toggle: `mod`, `±`
- Degree and radian toggle
- **Copy results to clipboard** with haptic feedback

### 🧰 Tools
Accessible from the **Tools** tab:

- 💱 **Currency Converter** (using [Frankfurter API](https://www.frankfurter.app) with 37+ currencies)
- 📏 **Unit Converter** (Length units: meter, centimeter, kilometer, inch, feet, yard)
- ⚖️ **BMI Calculator** (Body Mass Index with category indicators)
- �️ **Discount Calculator** (Price reduction calculator)

### ⚙️ Settings
Comprehensive settings panel with:

- 🌙 **Dark/Light Theme Toggle**
- 🔢 **Decimal Display Control** (show/hide decimal places)
- 📳 **Haptic Feedback Toggle** (vibration on button press)
- 🔊 **Sound Effects Toggle** (audio feedback)
- 📐 **Default Angle Unit** (degrees/radians for trigonometric functions)
- �️ **Clear History** (reset calculator history)
- ↻ **Reset Settings** (restore default settings)

---

## 🧩 Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **React Context API** for global state management
- **AsyncStorage** for persistent settings
- `expr-eval` for mathematical expression parsing
- `@react-native-picker/picker` for dropdown selections
- `expo-router` for tab-based navigation
- `expo-clipboard` for copy-to-clipboard functionality
- `expo-haptics` for haptic feedback
- `@expo/vector-icons` (FontAwesome) for icons

---

## 📦 Installation

```bash
git clone https://github.com/ismailSoylu/SmartCalc.git
cd SmartCalc
npm install
npx expo start
