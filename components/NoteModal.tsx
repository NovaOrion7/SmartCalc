import { useSettings } from '@/contexts/SettingsContext';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface NoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  onDelete?: () => void;
  initialNote?: string;
  calculation: string;
  result: string;
  isEditing?: boolean;
}

export default function NoteModal({
  visible,
  onClose,
  onSave,
  onDelete,
  initialNote = '',
  calculation,
  result,
  isEditing = false
}: NoteModalProps) {
  const [note, setNote] = useState(initialNote);
  const { isDarkMode, highContrast, triggerHaptic, t } = useSettings();

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, visible]);

  const handleSave = () => {
    if (note.trim()) {
      onSave(note.trim());
      triggerHaptic();
      onClose();
    } else {
      Alert.alert(t('error'), t('enterNote'), [{ text: t('ok') }]);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        t('deleteNote'),
        t('deleteNoteConfirm'),
        [
          {
            text: t('cancel'),
            style: 'cancel'
          },
          {
            text: t('deleteNote'),
            style: 'destructive',
            onPress: () => {
              onDelete();
              triggerHaptic();
              onClose();
            }
          }
        ]
      );
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: isDarkMode 
        ? (highContrast ? '#000000' : '#232323') 
        : (highContrast ? '#ffffff' : '#f8f8f8'),
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#ffffff') 
        : (highContrast ? '#000000' : '#333333'),
    },
    closeButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
    },
    calculationContainer: {
      backgroundColor: isDarkMode 
        ? (highContrast ? '#333333' : '#2a2a2a') 
        : (highContrast ? '#f0f0f0' : '#e8e8e8'),
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    calculationText: {
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#bbbbbb') 
        : (highContrast ? '#000000' : '#666666'),
      fontSize: 16,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    resultText: {
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#ffffff') 
        : (highContrast ? '#000000' : '#000000'),
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 8,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    noteInput: {
      backgroundColor: isDarkMode 
        ? (highContrast ? '#444444' : '#333333') 
        : (highContrast ? '#ffffff' : '#ffffff'),
      color: isDarkMode 
        ? (highContrast ? '#ffffff' : '#ffffff') 
        : (highContrast ? '#000000' : '#000000'),
      borderWidth: 1,
      borderColor: isDarkMode 
        ? (highContrast ? '#666666' : '#444444') 
        : (highContrast ? '#cccccc' : '#dddddd'),
      borderRadius: 12,
      padding: 16,
      minHeight: 100,
      textAlignVertical: 'top',
      fontSize: 16,
      marginBottom: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    saveButton: {
      backgroundColor: '#007AFF',
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
    },
    cancelButton: {
      backgroundColor: isDarkMode ? '#444444' : '#cccccc',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: isDarkMode ? '#ffffff' : '#333333',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? t('editNote') : t('addNote')}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome 
                name="times" 
                size={16} 
                color={isDarkMode ? '#ffffff' : '#666666'} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.calculationContainer}>
            <Text style={styles.calculationText}>{calculation}</Text>
            <Text style={styles.resultText}>= {result}</Text>
          </View>

          <TextInput
            style={styles.noteInput}
            placeholder={t('enterNote')}
            placeholderTextColor={isDarkMode ? '#888888' : '#999999'}
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.buttonContainer}>
            {isEditing && onDelete && (
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={handleDelete}
              >
                <FontAwesome name="trash" size={16} color="#ffffff" />
                <Text style={styles.buttonText}>{t('deleteNote')}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <FontAwesome name="save" size={16} color="#ffffff" />
              <Text style={styles.buttonText}>{t('saveNote')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}