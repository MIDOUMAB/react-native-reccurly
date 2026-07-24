import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView as RNSafeAreaView, Text, TextInput, View } from "react-native";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const posthog = usePostHog();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => emailAddress.length > 0 && password.length >= 8 && fetchStatus !== "fetching",
    [emailAddress, password, fetchStatus],
  );

  const handleSignIn = async () => {
    setFormError(null);
    const { error } = await signIn.password({ emailAddress, password });

    if (error) {
      setFormError(error.longMessage || error.message || "Unable to sign in. Please try again.");
      posthog.capture("sign_in_error", {
        error_message: error.message,
      });
      return;
    }

    if (signIn.status === "complete") {
      posthog.identify(signIn.createdSessionId ?? "unknown", {
        $set: { email: emailAddress },
      });
      posthog.capture("user_signed_in", { method: "password" });
      await signIn.finalize({ navigate: () => router.push("/") });
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor: { strategy?: string }) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        posthog.capture("mfa_code_requested", { method: "email_code" });
        setStatusMessage("A verification code was sent to your email.");
        return;
      }
    }

    if (signIn.status === "needs_second_factor") {
      setStatusMessage("A second factor is required. Complete the verification to continue.");
      return;
    }

    setFormError("Unable to complete sign in. Please try again.");
  };

  const handleVerify = async () => {
    setFormError(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code });

    if (error) {
      setFormError(error.longMessage || error.message || "Verification failed. Please try again.");
      return;
    }

    if (signIn.status === "complete") {
      posthog.identify(signIn.createdSessionId ?? "unknown", {
        $set: { email: emailAddress },
      });
      posthog.capture("mfa_verified", { method: "email_code" });
      posthog.capture("user_signed_in", { method: "password_with_mfa" });
      await signIn.finalize({ navigate: () => router.push("/") });
      return;
    }

    setFormError("Verification did not complete. Please try again.");
  };

  const needsVerify = signIn.status === "needs_client_trust";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-5">
        <View className="mt-12 rounded-4xl bg-white px-6 py-8 shadow-sm shadow-black/10">
          <Text className="text-3xl font-sans-extrabold text-primary">Welcome back</Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
            Sign in to continue managing your subscriptions.
          </Text>

          {needsVerify ? (
            <>
              <Text className="mt-8 text-sm font-sans-semibold text-primary">Verification code</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="numeric"
                placeholder="Enter code"
                placeholderTextColor="#9e9ea7"
                value={code}
                onChangeText={setCode}
                className="mt-3 rounded-3xl border border-black/10 bg-background px-4 py-4 text-base text-primary"
              />
              {errors.fields.code && (
                <Text className="mt-2 text-sm font-sans-medium text-destructive">
                  {errors.fields.code.message}
                </Text>
              )}
              <Pressable
                onPress={handleVerify}
                disabled={fetchStatus === "fetching"}
                className={`mt-6 rounded-3xl px-5 py-4 items-center ${fetchStatus === "fetching" ? "bg-primary/40" : "bg-accent"}`}>
                <Text className="text-base font-sans-semibold text-white">Verify code</Text>
              </Pressable>
              <Pressable onPress={() => signIn.mfa.sendEmailCode()} className="mt-3 items-center">
                <Text className="text-sm font-sans-semibold text-primary">Send a new code</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="mt-8 text-sm font-sans-semibold text-primary">Email address</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#9e9ea7"
                value={emailAddress}
                onChangeText={setEmailAddress}
                className="mt-3 rounded-3xl border border-black/10 bg-background px-4 py-4 text-base text-primary"
              />
              {errors.fields.identifier && (
                <Text className="mt-2 text-sm font-sans-medium text-destructive">
                  {errors.fields.identifier.message}
                </Text>
              )}

              <Text className="mt-5 text-sm font-sans-semibold text-primary">Password</Text>
              <TextInput
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor="#9e9ea7"
                value={password}
                onChangeText={setPassword}
                className="mt-3 rounded-3xl border border-black/10 bg-background px-4 py-4 text-base text-primary"
              />
              {errors.fields.password && (
                <Text className="mt-2 text-sm font-sans-medium text-destructive">
                  {errors.fields.password.message}
                </Text>
              )}
              <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
                Password must be at least 8 characters.
              </Text>
              <Pressable
                onPress={handleSignIn}
                disabled={!canSubmit}
                className={`mt-8 rounded-3xl px-5 py-4 items-center ${canSubmit ? "bg-accent" : "bg-primary/30"}`}>
                <Text className="text-base font-sans-semibold text-white">Continue</Text>
              </Pressable>
            </>
          )}

          {(formError || statusMessage) && (
            <View className="mt-5 rounded-3xl bg-muted p-4">
              <Text className={`text-sm ${formError ? "text-destructive" : "text-primary"}`}>
                {formError ?? statusMessage}
              </Text>
            </View>
          )}

          <View className="mt-8 flex-row items-center justify-center gap-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">New here?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Text className="text-sm font-sans-semibold text-accent">Create account</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
