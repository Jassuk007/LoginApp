import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TaskListProps {
  tasks: any[];
  taskTitle: string;
  setTaskTitle: (text: string) => void;
  addTask: () => void;
  deleteTask: (id: string) => void;
  toggleTask: (task: any) => void; // Ise Maine Optional (?) se Required kar diya hai
}

export default function TaskList({ tasks, taskTitle, setTaskTitle, addTask, deleteTask, toggleTask }: TaskListProps) {
  
  return (
    <View style={styles.container}>
      
      {/* Header Section */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>My Tasks</Text>
        <Text style={styles.countBadge}>{tasks.length} Tasks</Text>
      </View>
      
      {/* Input Section */}
      <View style={styles.inputWrapper}>
        <TextInput 
          style={styles.taskInput} 
          placeholder="What needs to be done?" 
          placeholderTextColor="#999"
          value={taskTitle} 
          onChangeText={setTaskTitle} 
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList 
        data={tasks}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            
            {/* Checkbox & Text */}
            <TouchableOpacity 
              style={styles.taskLeft} 
              onPress={() => toggleTask(item)}
            >
              {/* FIX: 'isDone' ki jagah 'isCompleted' use kiya */}
              <Ionicons 
                name={item.isCompleted ? "checkbox" : "square-outline"} 
                size={24} 
                color={item.isCompleted ? "#27ae60" : "#bdc3c7"} 
              />
              <Text style={[styles.taskText, item.isCompleted && styles.completedText]}>
                {item.title}
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity onPress={() => deleteTask(item._id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </TouchableOpacity>
          
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No tasks yet.</Text>
            <Text style={styles.emptySubText}>Add a task to get started!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC' },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  countBadge: { backgroundColor: '#e1e8ed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, color: '#555', fontSize: 12, fontWeight: 'bold' },

  inputWrapper: { 
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, 
    padding: 5, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, 
    shadowRadius: 5, marginBottom: 20, alignItems: 'center' 
  },
  taskInput: { flex: 1, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333' },
  addBtn: { 
    backgroundColor: '#3498db', width: 45, height: 45, borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', marginRight: 5 
  },

  taskCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, 
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  taskText: { fontSize: 16, color: '#333', marginLeft: 12, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', color: '#bdc3c7' },
  deleteBtn: { padding: 5 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, color: '#aaa', marginTop: 10, fontWeight: 'bold' },
  emptySubText: { fontSize: 14, color: '#ccc' }
});