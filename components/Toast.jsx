import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/Colors';

const VARIANT_COLORS = {
  success: '#16a34a',
  error: '#dc2626',
  info: '#0ea5e9',
  warning: '#d97706',
};

const ToastCard = ({ palette, text1, text2, accentColor }) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.navBackground,
          borderColor: accentColor,
          shadowColor: palette.title,
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.textContainer}>
        {!!text1 && <Text style={[styles.title, { color: palette.title }]}>{text1}</Text>}
        {!!text2 && <Text style={[styles.subtitle, { color: palette.text }]}>{text2}</Text>}
      </View>
    </View>
  );
};

const AppToast = () => {
  const scheme = useColorScheme();
  const palette = Colors[scheme] ?? Colors.light;

  const toastConfig = {
    success: ({ text1, text2 }) => (
      <ToastCard
        palette={palette}
        text1={text1}
        text2={text2}
        accentColor={VARIANT_COLORS.success}
      />
    ),
    error: ({ text1, text2 }) => (
      <ToastCard
        palette={palette}
        text1={text1}
        text2={text2}
        accentColor={VARIANT_COLORS.error}
      />
    ),
    info: ({ text1, text2 }) => (
      <ToastCard
        palette={palette}
        text1={text1}
        text2={text2}
        accentColor={VARIANT_COLORS.info}
      />
    ),
    warning: ({ text1, text2 }) => (
      <ToastCard
        palette={palette}
        text1={text1}
        text2={text2}
        accentColor={VARIANT_COLORS.warning}
      />
    ),
  };

  return <Toast config={toastConfig} />;
};

const styles = StyleSheet.create({
  card: {
    width: '92%',
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  accentBar: {
    width: 6,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AppToast;
