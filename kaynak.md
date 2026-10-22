# SmartCalc - Hızlı Başvuru & Komut Kaynağı

### 1. Uygulamayı Geliştirme Modunda Çalıştırma
```powershell
# Android cihazda / emülatörde yerel derleyip başlatma
npx expo run:android

# Metro önbelleğini temizleyerek çalıştırma
npx expo start -c
```

---

### 2. Google Play & APK Çıktıları Alma (Tek Satırda)
```powershell
# Google Play için imzalı AAB (Bundle) üretme ve geri dönme:
cd android; .\gradlew.bat bundleRelease; cd ..
# Çıktı Yolu: android/app/build/outputs/bundle/release/app-release.aab

# Telefona doğrudan yüklemek için imzalı Release APK üretme:
cd android; .\gradlew.bat assembleRelease; cd ..
# Çıktı Yolu: android/app/build/outputs/apk/release/app-release.apk

# Hızlı test için Debug APK üretme:
cd android; .\gradlew.bat assembleDebug; cd ..
# Çıktı Yolu: android/app/build/outputs/apk/debug/app-debug.apk
```

---

### 3. Build / Derleme Hatalarını Çözme & Önbellek Temizleme (Tek Satırda)
```powershell
# Kilitli Gradle işlemlerini durdurup temizleme (File Lock / .ninja_deps hatalarında):
cd android; .\gradlew.bat --stop; .\gradlew.bat clean; cd ..

# Tam temizlik yapıp Metro önbelleğiyle sıfırdan başlatma:
cd android; .\gradlew.bat clean; cd .. ; npx expo start -c
```

---

### 4. Git İşlemleri (Tek Satırda)
```powershell
# Değişiklikleri hızlıca ekle, commit at ve GitHub'a gönder:
git add . && git commit -m "fixed" && git push

# Versiyon güncellemesi veya yeni özellik sonrası push:
git add . && git commit -m "update: new features and fixes" && git push

# Değişen dosyaları kontrol etme:
git status
```

---

### 5. Yeni Versiyon Çıkarken Dikkat Edilecekler (Play Store)
Play Store'a yeni bir AAB yüklemeden önce `versionCode` değerini her seferinde **+1 artırmak zorunludur**.

Şu iki dosyada aynı değerlerin olduğundan emin olun:
1. `app.json`:
   - `"version": "1.2.7"`
   - `"versionCode": 21` (android objesi altında)
2. `android/app/build.gradle` (`defaultConfig` bloğu):
   - `versionCode 21`
   - `versionName "1.2.7"`

---

### 6. Keystore & İmzalama Bilgileri
- **Keystore Dosyası:** `@ismailjacob__SmartCalc.jks` (Proje kök dizininde yer almalı)
- **Yapılandırma:** `android/gradle.properties` dosyasında tanımlıdır (`bundleRelease` ve `assembleRelease` şifreleri otomatik çeker).

---

### 7. Cihaz & ADB Kontrolleri
```powershell
# Bağlı fiziksel/sanal cihazları listeleme:
adb devices

# Anlık Android hata loglarını izleme:
adb logcat *:E
```
