import { useEffect, useState, Fragment } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Task } from '@/types/database';

type TaskModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    due_date: Date | null;
    parent_id?: string | null;
    priority?: 'high' | 'medium' | 'low' | null;
  }) => Promise<void>;
  initialTask?: {
    title: string;
    description: string;
    due_date: string | null;
    priority?: 'high' | 'medium' | 'low' | null;
  };
  parentTask?: Task;
  isSubtask?: boolean;
};

export function TaskModal({
  visible,
  onClose,
  onSave,
  initialTask,
  parentTask,
  isSubtask = false,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(isSubtask ? "" : initialTask.description);
      setDueDate(isSubtask ? null : initialTask.due_date ? new Date(initialTask.due_date) : null);
      setPriority(initialTask.priority || null);
    } else {
      setTitle("");
      setDescription("");
      setDueDate(null);
      setPriority(null);
    }
  }, [initialTask, isSubtask]);

  useEffect(() => {
    if (isSubtask) {
      setDescription("");
      setDueDate(null);
    }
  }, [isSubtask]);

  const getPriorityColor = (p: 'high' | 'medium' | 'low' | null) => {
    switch (p) {
      case 'high': return '#EF4444';  // red
      case 'medium': return '#F59E0B'; // amber
      case 'low': return '#10B981';    // green
      default: return '#6B7280';       // gray
    }
  };

  const handleSave = async (task: {
    title: string;
    description: string;
    due_date: Date | null;
    parent_id?: string | null;
    priority?: 'high' | 'medium' | 'low' | null;
  }) => {
    if (!title.trim()) {
      return;
    }
    await onSave(task);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDueDate(null);
    setPriority(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={styles.headerContainer}>
              <ThemedText type="title" style={styles.modalTitle}>
                {initialTask 
                  ? "Edit Task" 
                  : isSubtask 
                    ? `Add Subtask to "${parentTask?.title}"`
                    : "New Task"}
              </ThemedText>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChangeText={setTitle}
            />

            {/* Only show description for main tasks */}
            {!isSubtask && (
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            )}

            {/* Only show due date for main tasks */}
            {!isSubtask && (
              <Fragment>
                {!showDatePicker && (
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <MaterialIcons name="event" size={20} color="#6B7280" />
                    <ThemedText style={styles.dateButtonText}>
                      {dueDate ? dueDate.toLocaleDateString() : "Due Date"}
                    </ThemedText>
                    {dueDate && (
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          setDueDate(null);
                        }}
                        style={styles.clearDateButton}
                      >
                        <MaterialIcons name="close" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setDueDate(selectedDate);
                      }
                    }}
                  />
                )}
              </Fragment>
            )}

            <View style={styles.prioritySection}>
              <ThemedText style={styles.priorityLabel}>Priority:</ThemedText>
              <View style={styles.priorityButtons}>
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && { backgroundColor: getPriorityColor(p) }
                    ]}
                    onPress={() => setPriority(priority === p ? null : p)}
                  >
                    <ThemedText style={[
                      styles.priorityButtonText,
                      priority === p && styles.priorityButtonTextSelected
                    ]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !title.trim() && styles.saveButtonDisabled,
              ]}
              onPress={() => handleSave({
                title,
                description: isSubtask ? '' : description,
                due_date: isSubtask ? null : dueDate,
                priority,
                parent_id: parentTask?.id || null,
              })}
              disabled={!title.trim()}
            >
              <ThemedText style={styles.buttonText}>
                {isSubtask ? 'Add Subtask' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
  },
  clearDateButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerContainer: {
    marginBottom: 20,
  },
  prioritySection: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
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
});
