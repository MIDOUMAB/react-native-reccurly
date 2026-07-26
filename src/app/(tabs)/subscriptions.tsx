import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "../../../components/SubscriptionCard";
import { useSubscriptions } from "../../context/subscriptions-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) => {
      const searchableText = [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.paymentMethod,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery, subscriptions]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView className="flex-1 bg-background p-5">
        <Text className="mb-4 text-2xl font-sans-bold text-primary">Subscriptions</Text>

        <View className="mb-4 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm shadow-black/5">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search subscriptions"
            placeholderTextColor="#8A8A8A"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            selectionColor="#ea7a53"
            className="text-base font-sans-medium text-primary"
          />
        </View>

        <FlatList
          className="flex-1"
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => {
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id
                );
              }}
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
          ListEmptyComponent={
            <Text className="py-6 text-center text-sm font-sans-medium text-muted-foreground">
              No subscriptions found.
            </Text>
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Subscriptions;
