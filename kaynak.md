npx react-native run-android

cd android; .\gradlew.bat bundleRelease

git add . && git commit -m "fixed" && git push

version code ve numarası app.json ve android/app/src/build gradle de ikisi de ayarlanmalı.
