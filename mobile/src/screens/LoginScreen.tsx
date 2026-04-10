/**
 * LoginScreen — Entry point with Google OAuth
 *
 * Google Cloud Console setup (one-time):
 *  1. Go to https://console.cloud.google.com → APIs & Services → Credentials
 *  2. Create an OAuth 2.0 Client ID for each platform:
 *       • Web application  → paste into WEB_CLIENT_ID
 *       • Android          → paste into ANDROID_CLIENT_ID
 *       • iOS              → paste into IOS_CLIENT_ID
 *  3. For Android: use SHA-1 from `npx expo credentials:manager`
 *  4. For iOS: use bundle ID  com.cirql.app
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/apiClient";
// ── Google OAuth client IDs ─────────────────────
// Paste your Web Client ID from Google Cloud Console here.
// Android/iOS client IDs are only needed for production builds — leave blank for Expo Go.
const WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = "";
const IOS_CLIENT_ID = "";

// Required: completes the auth session when the browser redirects back
WebBrowser.maybeCompleteAuthSession();

interface LoginForm {
  email: string;
  password: string;
}

export function LoginScreen() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // ── Google Auth Session ──────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    // useProxy routes through auth.expo.io — works in Expo Go without a custom build
    redirectUri: makeRedirectUri({ scheme: "cirql", path: "redirect" }),
  });

  // Handle the OAuth response — fetch user info then store in AuthContext
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (!authentication?.accessToken) return;

      // Fetch the user's profile from Google
      fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then((r) => r.json())
        .then(async (profile) => {
          // profile.id  → stable Google user ID (use this for API calls)
          // profile.email, profile.name, profile.picture
          await signIn({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
          });
          // AuthContext update triggers AppNavigator to swap to MainTabs automatically
        })
        .catch(() => {
          Alert.alert("Sign-In Failed", "Could not fetch your Google profile.");
        });
    } else if (response?.type === "error") {
      Alert.alert(
        "Google Sign-In Failed",
        response.error?.message ?? "Something went wrong. Please try again."
      );
    }
  }, [response, signIn]);

  // ── Email / Password submit (mock — replace with real auth) ──
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (_data: LoginForm) => {
    setIsEmailLoading(true);
    try {
      const res = await apiClient.post<{ id: string; email: string; name: string | null }>("/auth/login", {
        email: _data.email,
        password: _data.password,
      });
      await signIn({
        id: res.data.id,
        email: res.data.email,
        name: res.data.name ?? "",
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        Alert.alert("Not Found", "No account found for this email address.");
      } else {
        Alert.alert("Sign-In Failed", "Something went wrong. Please try again.");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const isGoogleLoading = !request || response?.type === "dismiss";

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ── */}
          <LinearGradient
            colors={["#1F6F54", "#012d1d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-8 pt-16 pb-12 items-center"
          >
            <Text className="text-4xl font-bold text-white tracking-widest">
              CIRQL
            </Text>
            <Text className="text-sm text-white/60 mt-2 tracking-widest uppercase">
              Heritage · Certified · Circular
            </Text>
          </LinearGradient>

          {/* ── Form ── */}
          <View className="flex-1 px-6 pt-8 pb-6">
            <Text className="text-2xl font-bold text-on-surface">
              Welcome back
            </Text>
            <Text className="text-sm text-outline mt-1">
              Sign in to your CIRQL account
            </Text>

            <View className="mt-8 gap-4">
              {/* Email field */}
              <View>
                <Text className="text-xs font-semibold text-outline uppercase tracking-widest mb-2">
                  Email
                </Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#f3f4f5",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderWidth: 1.5,
                        borderColor: errors.email ? "#ba1a1a" : "#e7e8e9",
                      }}
                    >
                      <Mail size={18} color="#717973" />
                      <TextInput
                        style={{ flex: 1, marginLeft: 12, fontSize: 16, color: "#191c1d" }}
                        placeholder="you@example.com"
                        placeholderTextColor="#c1c8c2"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text className="text-xs text-error mt-1.5 ml-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password field */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-semibold text-outline uppercase tracking-widest">
                    Password
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-xs text-primary font-semibold">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: { value: 6, message: "At least 6 characters" },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#f3f4f5",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderWidth: 1.5,
                        borderColor: errors.password ? "#ba1a1a" : "#e7e8e9",
                      }}
                    >
                      <Lock size={18} color="#717973" />
                      <TextInput
                        style={{ flex: 1, marginLeft: 12, fontSize: 16, color: "#191c1d" }}
                        placeholder="••••••••"
                        placeholderTextColor="#c1c8c2"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((p) => !p)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="#717973" />
                        ) : (
                          <Eye size={18} color="#717973" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password && (
                  <Text className="text-xs text-error mt-1.5 ml-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Sign In button */}
            <View className="mt-7">
              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isEmailLoading}
                size="lg"
              />
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-3 my-6">
              <View className="flex-1 h-px bg-surface-container-high" />
              <Text className="text-xs text-outline font-medium">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-surface-container-high" />
            </View>

            {/* Google button */}
            <TouchableOpacity
              onPress={() => promptAsync()}
              disabled={!request}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                borderRadius: 50,
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderWidth: 1.5,
                borderColor: "#e7e8e9",
                shadowColor: "#191c1d",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
                opacity: !request ? 0.5 : 1,
              }}
            >
              {!request ? (
                <ActivityIndicator size="small" color="#717973" />
              ) : (
                <>
                  {/* Google "G" mark */}
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#4285F4",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                      G
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#191c1d" }}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign up link */}
            <View className="flex-row items-center justify-center mt-8 gap-1">
              <Text className="text-sm text-outline">
                Don't have an account?
              </Text>
              <TouchableOpacity>
                <Text className="text-sm text-primary font-semibold">
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
