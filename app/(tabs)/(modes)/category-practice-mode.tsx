import LearningGrid from "@/components/LearningGrid";
import { View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryPractice() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LearningGrid />
    </SafeAreaView>
  );
}