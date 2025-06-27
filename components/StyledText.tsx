import React from 'react';
import { Text, TextProps } from 'react-native';

export default function StyledText(props: TextProps) {
   return <Text {...props} style={[{ fontFamily: 'PlusJakartaSans_400Regular' }, props.style]} />;
}
