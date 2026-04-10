/**
 * VerifyProductScreen — Photo capture & verification submission
 */

// @ts-ignore — React 19.1 + TS 5.9 IDE false-positive
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ImageGrid } from "../components/product/ImageGrid";
import { useAuth } from "../context/AuthContext";
import { useAssessment } from "../context/AssessmentContext";
import { uploadImages } from "../utils/uploadImage";
import { createListing, fullAssessment } from "../api/services/productService";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "VerifyProduct">;

type Slot = { angle: string; label: string; uri: string | null };

// Fixed 5 angles required by E1/E2
const REQUIRED_ANGLES: Slot[] = [
  { angle: "front",      label: "Front",      uri: null },
  { angle: "side_left",  label: "Side Left",  uri: null },
  { angle: "side_right", label: "Side Right", uri: null },
  { angle: "top",        label: "Top",        uri: null },
  { angle: "detail",     label: "Detail",     uri: null },
];

export function VerifyProductScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { product } = route.params;
  const { user } = useAuth();

  const { setResult, setError, clear } = useAssessment();
  const [imageSlots, setImageSlots] = useState<Slot[]>(REQUIRED_ANGLES);
  const [knownIssues, setKnownIssues] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadedCount = imageSlots.filter((s: Slot) => s.uri !== null).length;
  const allUploaded = uploadedCount === REQUIRED_ANGLES.length;

  const pickImage = useCallback(async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageSlots((prev: Slot[]) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], uri: result.assets[0].uri };
        return updated;
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!user?.id) return;
    const readySlots = imageSlots.filter(
      (s: Slot): s is Slot & { uri: string } => s.uri !== null
    );

    setIsSubmitting(true);

    // Step 1 — Upload images
    setStatusText("Uploading images...");
    let uploaded: { photo_id: string; url: string; label: string }[];
    try {
      uploaded = await uploadImages(
        readySlots.map((s: Slot & { uri: string }) => ({ angle: s.angle, uri: s.uri })),
        user.id
      );
    } catch (err: any) {
      setIsSubmitting(false);
      setStatusText("");
      Alert.alert("Upload Failed", err.message ?? "Could not upload images.");
      return;
    }

    // Step 2 — Create listing row in DB
    setStatusText("Creating listing...");
    let listingId: string;
    try {
      listingId = await createListing(
        product.passport_id,
        user.id,
        uploaded.map((u) => u.url)
      );
    } catch (err: any) {
      setIsSubmitting(false);
      setStatusText("");
      Alert.alert("Error", "Could not create listing. Please try again.");
      return;
    }

    // Clear any previous result then navigate to pending
    clear();
    navigation.navigate("VerificationPending", { productId: listingId });

    // Step 3 — Run full assessment (E1 + E2 + E3)
    const ageMonths = product.manufacture_date
      ? Math.floor(
          (Date.now() - new Date(product.manufacture_date).getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        )
      : undefined;

    try {
      const result = await fullAssessment({
        product_id: product.passport_id,
        listing_id: listingId,
        submission_timestamp: new Date().toISOString(),
        images: uploaded,
        passport: {
          sku_code: product.sku_code,
          brand: product.brand,
          name: product.name,
          category: product.category,
          age_in_months: ageMonths,
          original_price: product.retail_price_usd ?? undefined,
          materials: product.materials ?? undefined,
          reference_images: product.reference_images ?? undefined,
          weight: product.weight_kg ?? undefined,
          known_issues: knownIssues.trim() || undefined,
        },
      });

      // Store result in context — VerificationPendingScreen watches and navigates
      setResult(result);
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
      setStatusText("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-6 py-3 gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#191c1d" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-on-surface">Verify Product</Text>
          <Text className="text-xs text-outline">WS Heritage Verification</Text>
        </View>
        <Badge
          label="AI Powered"
          variant="verified"
          icon={<ShieldCheck size={10} color="#012d1d" />}
        />
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info */}
        <Card variant="cream" className="mt-4">
          <Text className="text-xs font-semibold text-outline uppercase tracking-widest">
            {product.brand}
          </Text>
          <Text className="text-xl font-bold text-on-surface mt-1">{product.name}</Text>
          <Text className="text-sm text-outline mt-1">
            SKU: {product.sku_code} · {product.category}
          </Text>
        </Card>

        {/* Photo upload */}
        <Text className="text-xs text-outline mt-5 mb-3 uppercase tracking-widest font-semibold">
          Upload {REQUIRED_ANGLES.length} photos ({uploadedCount}/{REQUIRED_ANGLES.length})
        </Text>
        <ImageGrid slots={imageSlots} onSlotPress={pickImage} />

        {/* Known issues */}
        <View className="mt-6">
          <Text className="text-xs font-semibold text-outline uppercase tracking-widest mb-2">
            Known Issues (optional)
          </Text>
          <View
            style={{
              backgroundColor: "#f3f4f5",
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: "#e7e8e9",
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <TextInput
              placeholder="Describe any known damage, wear, or issues..."
              placeholderTextColor="#c1c8c2"
              multiline
              numberOfLines={3}
              value={knownIssues}
              onChangeText={setKnownIssues}
              style={{ fontSize: 14, color: "#191c1d", textAlignVertical: "top" }}
            />
          </View>
        </View>

        {/* Provenance note */}
        <Card variant="flat" className="mt-6">
          <View className="flex-row items-center gap-3">
            <View className="bg-secondary-fixed rounded-full p-2">
              <ShieldCheck size={18} color="#1F6F54" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-on-surface">
                Lifecycle Tracking Initiated
              </Text>
              <Text className="text-xs text-outline mt-0.5">
                Digital Product Passport will be updated upon verification.
              </Text>
            </View>
          </View>
        </Card>

        {/* Submit */}
        <View className="mt-6">
          {statusText ? (
            <Text className="text-xs text-outline text-center mb-2">{statusText}</Text>
          ) : null}
          <Button
            title={
              isSubmitting
                ? statusText || "Processing..."
                : allUploaded
                ? "Submit for Verification"
                : `Upload All ${REQUIRED_ANGLES.length} Photos`
            }
            onPress={handleSubmit}
            disabled={!allUploaded || isSubmitting}
            loading={isSubmitting}
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
