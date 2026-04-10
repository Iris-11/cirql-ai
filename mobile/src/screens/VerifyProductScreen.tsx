import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Typography, Button } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import * as ImagePicker from 'expo-image-picker';
import { Camera, AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/theme';

const IMAGE_SLOTS = [
  { id: 'front', label: 'Front Angle', icon: 'camera' },
  { id: 'top', label: 'Top / Interior', icon: 'camera' },
  { id: 'side_left', label: 'Side Profile', icon: 'camera' },
  { id: 'detail', label: 'Enamel Detail', icon: 'camera' },
];

export const VerifyProductScreen = () => {
  const navigation = useNavigation<any>();
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const pickImage = async (slotId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => ({ ...prev, [slotId]: result.assets[0].uri }));
    }
  };

  const isComplete = Object.keys(images).length === IMAGE_SLOTS.length;

  const handleSubmit = () => {
    if (!isComplete) {
      Alert.alert("Action Required", "Please capture all 4 angles to complete verification.");
      return;
    }
    
    navigation.navigate('Pending');
  };

  return (
    <View className="flex-1 bg-background">
      <TopAppBar />
      <ScrollView className="flex-1 px-6 pt-8 pb-32">
        <Typography variant="label" size="sm" className="text-primary/60 mb-2">Verification Journey</Typography>
        <Typography variant="display" size="lg" className="text-primary mb-2">
          Verify Your Product
        </Typography>
        <Typography variant="body" size="md" className="text-primary/60 mb-8">
          Williams-Sonoma Le Creuset Verification
        </Typography>

        {/* IMAGE GRID */}
        <View className="flex-row flex-wrap justify-between mb-8">
           {IMAGE_SLOTS.map((slot) => (
             <TouchableOpacity 
               key={slot.id}
               onPress={() => pickImage(slot.id)}
               className="w-[48%] aspect-square bg-cream/30 rounded-2xl mb-4 items-center justify-center border-2 border-dashed border-primary/10 overflow-hidden"
             >
                {images[slot.id] ? (
                  <Image source={{ uri: images[slot.id] }} className="w-full h-full" />
                ) : (
                  <View className="items-center">
                    <Camera size={24} color={COLORS.primary} strokeWidth={1.5} />
                    <Typography variant="label" size="sm" className="text-primary/40 mt-2">{slot.label}</Typography>
                  </View>
                )}
                
                {images[slot.id] && (
                  <View className="absolute top-2 right-2 bg-primary rounded-full p-1">
                    <CheckCircle2 size={12} color="white" />
                  </View>
                )}
             </TouchableOpacity>
           ))}
        </View>

        {/* DYNAMIC GUIDANCE */}
        <View className="bg-error/5 p-5 rounded-2xl border border-primary/10 mb-8 flex-row items-start">
           <Info size={20} color={COLORS.primary} className="mt-1" />
           <View className="flex-1 ml-4">
              <Typography variant="headline" size="sm" className="text-primary mb-1">Capture Requirements</Typography>
              <Typography variant="body" size="sm" className="text-primary/70 mb-2">
                Ensure the Le Creuset logo and enamel condition are clearly visible. Avoid harsh direct sunlight.
              </Typography>
              <Typography variant="label" size="sm" className="text-primary underline">View Reference Examples</Typography>
           </View>
        </View>

        {/* STATUS INDICATOR */}
        <View className="bg-primary/5 p-4 rounded-xl items-center flex-row justify-center mb-10">
           <View className="h-2 w-2 rounded-full bg-primary animate-pulse mr-3" />
           <Typography variant="label" size="sm" className="text-primary tracking-widest">
             {isComplete ? "Ready for Analysis" : `${Object.keys(images).length} / 4 Images Uploaded`}
           </Typography>
        </View>

        <Button 
          label={isComplete ? "Initiate Analysis" : "Capture Required Angles"} 
          onPress={handleSubmit}
          className={!isComplete ? "opacity-50" : ""}
        />
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
