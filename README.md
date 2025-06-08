# 🧮 SmartCalc

**SmartCalc** is a modern calculator app built with **React Native** and **Expo**, offering both **scientific features** and practical **daily tools**. It is designed with a clean UI, dark theme, and touch-optimized layout.

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

### 🧰 Tools
Accessible from the **Tools** tab:

- 💱 **Currency Converter** (using [Frankfurter API](https://www.frankfurter.app))
- 📏 **Unit Converter** (Length, Mass, Temperature)
- 🔢 **Numeral System Converter** (Binary, Decimal, Hexadecimal)
- ⚖️ **BMI Calculator** (Body Mass Index)
- 🛍️ **Discount Calculator**

---

## 🧩 Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- `expr-eval` for mathematical parsing
- `react-native-dropdown-picker` for dropdowns
- `expo-router` for navigation
- `@expo/vector-icons` for icons

---

## 📦 Installation

```bash
git clone https://github.com/ismailSoylu/SmartCalc.git
cd SmartCalc
npm install
npx expo start
