import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView as RNSafeAreaView, Text, TextInput, View } from "react-native";

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = useMemo(
    () => emailAddress.length > 0 && password.length >= 8 && passwordsMatch && fetchStatus !== "fetching",
    [emailAddress, password, passwordsMatch, fetchStatus],
  );

  const handleSignUp = async () => {
    setFormError(null);
    if (!passwordsMatch) {
      setFormError("Passwords must match.");
      return;
    }

    const { error } = await signUp.password({ emailAddress, password });

    if (error) {
      setFormError(error.longMessage || error.message || "Unable to create account.");
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: () => router.push("/") });
      return;
    }

    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields?.includes("email_address") &&
      signUp.missingFields.length === 0
    ) {
      await signUp.verifications.sendEmailCode();
      setStatusMessage("A verification code has been sent to your email.");
      return;
    }

    setFormError("Unable to continue. Please verify your email and try again.");
  };

  const handleVerify = async () => {
    setFormError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });

    if (error) {
      setFormError(error.longMessage || error.message || "Verification failed. Please try again.");
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({ navigate: () => router.push("/") });
      return;
    }

    setFormError("Verification did not complete. Please try again.");
  };

  const needsVerify =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    signUp.missingFields.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-5">
        <View className="mt-12 rounded-4xl bg-white px-6 py-8 shadow-sm shadow-black/10">
          <Text className="text-3xl font-sans-extrabold text-primary">Create your account</Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
            Start managing your subscriptions with a secure account.
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
              <Pressable onPress={() => signUp.verifications.sendEmailCode()} className="mt-3 items-center">
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
              {errors.fields.emailAddress && (
                <Text className="mt-2 text-sm font-sans-medium text-destructive">
                  {errors.fields.emailAddress.message}
                </Text>
              )}

              <Text className="mt-5 text-sm font-sans-semibold text-primary">Password</Text>
              <TextInput
                secureTextEntry
                placeholder="Create a password"
                placeholderTextColor="#9e9ea7"
                value={password}
                onChangeText={setPassword}
                className="mt-3 rounded-3xl border border-black/10 bg-background px-4 py-4 text-base text-primary"
              />
              <Text className="mt-4 text-sm font-sans-semibold text-primary">Confirm password</Text>
              <TextInput
                secureTextEntry
                placeholder="Confirm password"
                placeholderTextColor="#9e9ea7"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="mt-3 rounded-3xl border border-black/10 bg-background px-4 py-4 text-base text-primary"
              />
              {!passwordsMatch && confirmPassword.length > 0 && (
                <Text className="mt-2 text-sm font-sans-medium text-destructive">Passwords must match.</Text>
              )}
              {errors.fields.password && (
                <Text className="mt-2 text-sm font-sans-medium text-destructive">
                  {errors.fields.password.message}
                </Text>
              )}
              <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
                Use at least 8 characters to keep your account secure.
              </Text>
              <Pressable
                onPress={handleSignUp}
                disabled={!canSubmit}
                className={`mt-8 rounded-3xl px-5 py-4 items-center ${canSubmit ? "bg-accent" : "bg-primary/30"}`}>
                <Text className="text-base font-sans-semibold text-white">Create account</Text>
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
            <Text className="text-sm font-sans-medium text-muted-foreground">Already have an account?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Text className="text-sm font-sans-semibold text-accent">Sign in</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
