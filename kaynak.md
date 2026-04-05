npx react-native run-android

cd android; .\gradlew.bat bundleRelease

# alternatif: proje kökünden doğrudan

.\android\gradlew.bat bundleRelease

git add . && git commit -m "fixed" && git push
