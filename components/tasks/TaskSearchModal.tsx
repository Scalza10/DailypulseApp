import { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface TaskSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (criteria: {
    searchText: string;
    includeDone: boolean;
    priority: ('high' | 'medium' | 'low' | null)[];
  }) => void;
}

export function TaskSearchModal({ visible, onClose, onSearch }: TaskSearchModalProps) {
  const [searchText, setSearchText] = useState('');
  const [includeDone, setIncludeDone] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<('high' | 'medium' | 'low' | null)[]>([]);

  const handleSearch = () => {
    onSearch({
      searchText,
      includeDone,
      priority: selectedPriorities,
    });
    onClose();
  };

  const clearFilters = () => {
    setSearchText('');
    setIncludeDone(false);
    setSelectedPriorities([]);
    
    // Call onSearch with empty criteria to clear filters
    onSearch({
      searchText: '',
      includeDone: false,
      priority: [],
    });
    onClose();
  };

  const togglePriority = (priority: 'high' | 'medium' | 'low' | null) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low' | null) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Search Tasks</ThemedText>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearFilters}
              >
                <MaterialIcons name="refresh" size={20} color="#6B7280" />
                <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or description (optional)"
              value={searchText}
              onChangeText={setSearchText}
            />

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Priority</ThemedText>
              <View style={styles.priorityButtons}>
                {(['high', 'medium', 'low', null] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority || 'none'}
                    style={[
                      styles.priorityButton,
                      selectedPriorities.includes(priority) && {
                        backgroundColor: getPriorityColor(priority),
                      }
                    ]}
                    onPress={() => togglePriority(priority)}
                  >
                    <ThemedText style={[
                      styles.priorityButtonText,
                      selectedPriorities.includes(priority) && styles.priorityButtonTextSelected
                    ]}>
                      {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'None'}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setIncludeDone(!includeDone)}
            >
              <ThemedText>Include completed tasks</ThemedText>
              <MaterialIcons
                name={includeDone ? "check-box" : "check-box-outline-blank"}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.searchButton,
              (!searchText && selectedPriorities.length === 0) && styles.searchButtonDisabled
            ]}
            onPress={handleSearch}
            disabled={!searchText && selectedPriorities.length === 0}
          >
            <ThemedText style={styles.searchButtonText}>Search</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    minWidth: '45%',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  priorityButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
  },
  searchButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    marginTop: 12,
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
}); 