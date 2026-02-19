import React, { useState } from 'react';
import { Platform, TouchableOpacity, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

// Native datepicker from the community package (used on iOS/Android).
// Web falls back to a simple prompt for now.
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Props = {
  dateIso: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  style?: StyleProp<ViewStyle>;
};

const isoToDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return new Date();
  return d;
};

const formatDisplayDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
};

export default function DatePicker({ dateIso, onChange, style }: Props) {
  const [show, setShow] = useState(false);

  const open = async () => {
    // web fallback: quick prompt
    if (Platform.OS === 'web' && typeof globalThis !== 'undefined') {
      type GlobalWithPrompt = { prompt?: (message?: string, defaultValue?: string) => string | null };
      const g = globalThis as unknown as GlobalWithPrompt;
      if (typeof g.prompt === 'function') {
        const input = g.prompt('Enter date (YYYY-MM-DD):', dateIso);
        if (input) onChange(input);
        return;
      }
    }
    setShow(true);
  };

  const handleChange = (_event: DateTimePickerEvent, selected?: Date | undefined) => {
    setShow(false);
    if (selected) onChange(selected.toISOString().split('T')[0]);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={open}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={`Select date, ${formatDisplayDate(dateIso)}`}
      >
        <Text>{formatDisplayDate(dateIso)}</Text>
      </TouchableOpacity>
      {show && Platform.OS !== 'web' && (
        <DateTimePicker
          value={isoToDate(dateIso)}
          mode="date"
          display={'spinner'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  container: { alignSelf: 'stretch' },
});
