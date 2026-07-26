import { styled } from "nativewind";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const router = useRouter();
  const { isLoaded, signOut } = useAuth();
  const posthog = usePostHog();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (!isLoaded || isSigningOut || !signOut) return;
    setIsSigningOut(true);

    try {
      posthog.capture("user_signed_out");
      posthog.reset();
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="mt-6 rounded-4xl bg-white p-6 shadow-sm shadow-black/10">
        <Text className="mb-4 text-lg font-semibold text-primary">Settings</Text>
        <Text className="mb-6 text-base text-secondary">
          Sign out to retest the authentication flow from the start.
        </Text>
        <Pressable
          onPress={handleLogout}
          disabled={!isLoaded || isSigningOut}
          className={`rounded-3xl px-5 py-4 items-center ${isSigningOut ? "bg-primary/40" : "bg-accent"}`}>
          <Text className="text-base font-semibold text-white">
            {isSigningOut ? "Signing out..." : "Log out"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
