import "@/global.css";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { icons } from "../../constants/icons";

type Frequency = "Monthly" | "Yearly";
type Category =
  | "Entertainment"
  | "AI Tools"
  | "Developer Tools"
  | "Design"
  | "Productivity"
  | "Cloud"
  | "Music"
  | "Other";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const frequencyOptions: Frequency[] = ["Monthly", "Yearly"];
const categoryOptions: Category[] = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const categoryColors: Record<Category, string> = {
  Entertainment: "#f6c4f2",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#8fd1bd",
  Cloud: "#dcecff",
  Music: "#f7cf7c",
  Other: "#f3e3d3",
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Other");

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const parsedPrice = Number(price);

    if (!trimmedName || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return;
    }

    const startDate = dayjs().toISOString();
    const renewalDate = dayjs(startDate)
      .add(frequency === "Yearly" ? 1 : 1, frequency === "Yearly" ? "year" : "month")
      .toISOString();

    const newSubscription: Subscription = {
      id: `${trimmedName.toLowerCase().replace(/\s+/g, "-")}-${dayjs().valueOf()}`,
      name: trimmedName,
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: icons.wallet,
      currency: "USD",
      billing: frequency,
      color: categoryColors[category],
    };

    onCreate(newSubscription);
    resetForm();
    onClose();
  };

  const isValid =
    name.trim().length > 0 &&
    !Number.isNaN(Number(price)) &&
    Number(price) > 0;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="modal-overlay">
        <Pressable className="flex-1" onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={onClose}>
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="modal-body">
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Spotify"
                    placeholderTextColor="#8A8A8A"
                    autoCapitalize="words"
                    className="auth-input"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="9.99"
                    placeholderTextColor="#8A8A8A"
                    keyboardType="decimal-pad"
                    className="auth-input"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {frequencyOptions.map((option) => {
                      const isActive = frequency === option;

                      return (
                        <Pressable
                          key={option}
                          className={clsx(
                            "picker-option",
                            isActive && "picker-option-active"
                          )}
                          onPress={() => setFrequency(option)}
                        >
                          <Text
                            className={clsx(
                              "picker-option-text",
                              isActive && "picker-option-text-active"
                            )}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {categoryOptions.map((option) => {
                      const isActive = category === option;

                      return (
                        <Pressable
                          key={option}
                          className={clsx(
                            "category-chip",
                            isActive && "category-chip-active"
                          )}
                          onPress={() => setCategory(option)}
                        >
                          <Text
                            className={clsx(
                              "category-chip-text",
                              isActive && "category-chip-text-active"
                            )}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  className={clsx("auth-button", !isValid && "auth-button-disabled")}
                  disabled={!isValid}
                  onPress={handleSubmit}
                >
                  <Text className="auth-button-text">Create Subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
