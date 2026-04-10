import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ActivityIndicator } from 'react-native';
import { Typography } from '../components/ui';
import { TopAppBar } from '../components/TopAppBar';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/theme';

const STAGES = [
  "Provenance Check Initiated",
  "Enamel Integrity Analysis",
  "Standardizing Condition Data",
  "Final Human-in-the-Loop Validation"
];

export const VerificationPendingScreen = () => {
  const navigation = useNavigation<any>();
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        clearInterval(timer);
        // Navigate to results after small extra delay
        setTimeout(() => navigation.navigate('Result'), 1500);
        return prev;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [navigation]);

  return (
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1">
        <View className="px-6 py-12 flex-1 items-center justify-center">
           <View className="w-20 h-20 bg-white/10 rounded-full items-center justify-center mb-8">
              <Loader2 size={40} color="white" className="animate-spin" />
           </View>
           
           <Typography variant="display" size="lg" className="text-white text-center mb-4">
             AI Analysis In Progress
           </Typography>
           
           <Typography variant="body" size="md" className="text-white/60 text-center px-10 mb-12">
             Our curators and AI systems are certifying your heritage Le Creuset.
           </Typography>

           {/* PROGRESS STEPS */}
           <View className="w-full space-y-6">
              {STAGES.map((stage, index) => (
                <View key={index} className="flex-row items-center">
                   <View className={`w-6 h-6 rounded-full items-center justify-center mr-4 ${index <= currentStage ? 'bg-white' : 'bg-white/20'}`}>
                      {index < currentStage ? (
                        <CheckCircle2 size={14} color={COLORS.primary} />
                      ) : index === currentStage ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : null}
                   </View>
                   <Typography 
                     variant="label" 
                     size="sm" 
                     className={`lowercase transition-opacity duration-500 ${index <= currentStage ? 'text-white' : 'text-white/30'}`}
                   >
                     {stage}
                   </Typography>
                </View>
              ))}
           </View>

           <View className="mt-16 flex-row items-center bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <ShieldCheck size={16} color="white" />
              <Typography variant="label" size="sm" className="text-white ml-2">Human Verification Badge</Typography>
           </View>
        </View>
      </SafeAreaView>
      
      <View className="px-6 pb-12">
         <Typography variant="body" size="sm" className="text-white/40 text-center">
           Usually completed within a few seconds. Need help? 
           <Typography variant="label" size="sm" className="text-white underline"> Contact Concierge</Typography>
         </Typography>
      </View>
    </View>
  );
};
