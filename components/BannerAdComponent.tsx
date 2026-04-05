import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import mobileAds, {
    BannerAd,
    BannerAdSize,
    TestIds,
} from "react-native-google-mobile-ads";

const AD_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-2239637684721708/2716595030";

export default function BannerAdComponent() {
  const [adLoaded, setAdLoaded] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [adKey, setAdKey] = useState(0);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log("MobileAds SDK ready");
        setSdkReady(true);
      })
      .catch((error) => {
        console.log("MobileAds init failed:", error);
      });
  }, []);

  if (!sdkReady) {
    return null;
  }

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        key={adKey}
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log("Ad loaded successfully");
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.log("Ad failed to load:", error);
          setAdLoaded(false);
          // Retry after 30 seconds
          setTimeout(() => setAdKey((k) => k + 1), 30000);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  hidden: {
    opacity: 0,
  },
});
