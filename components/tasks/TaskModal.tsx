import { useEffect, useState } from "react";
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
  }) => Promise<void>;
  initialTask?: {
    title: string;
    description: string;
    due_date: string | null;
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

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setDueDate(initialTask.due_date ? new Date(initialTask.due_date) : null);
    }
  }, [initialTask]);

  const handleSave = async (task: {
    title: string;
    description: string;
    due_date: Date | null;
    parent_id?: string | null;
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
                    ? `New Subtask${parentTask ? ` for "${parentTask.title}"` : ''}`
                    : "New Task"}
              </ThemedText>
              {parentTask && (
                <View style={styles.parentTaskIndicator}>
                  <MaterialIcons name="subdirectory-arrow-right" size={20} color="#6B7280" />
                  <ThemedText style={styles.parentTaskText}>Subtask</ThemedText>
                </View>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />

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
                description,
                due_date: dueDate,
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
  parentTaskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  parentTaskText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
