import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TaskList from '../../components/TaskList';
import { useAuth } from '../../context/AuthContext';

export default function TaskScreen() {
  const { user, API_URL } = useAuth();
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);

  // Screen khulte hi tasks load karo
  useEffect(() => {
    if (user) {
      // User ki ID (Google ID ya MongoDB _id) use karo
      const userId = user.googleId || user._id;
      fetchTasks(userId);
    }
  }, [user]);

  const fetchTasks = async (uid: string) => { 
    try { 
      const res = await axios.get(`${API_URL}/api/tasks/${uid}`); 
      setTasks(res.data); 
    } catch(e) { 
      console.log("Fetch Error:", e); 
    } 
  };

  const addTask = async () => { 
    if(!taskTitle.trim()) return; 
    try { 
      const userId = user.googleId || user._id;
      const res = await axios.post(`${API_URL}/api/tasks`, { 
        userId: userId, 
        title: taskTitle 
      }); 
      // Naya task list mein add karo
      setTasks([res.data, ...tasks]); 
      setTaskTitle(""); 
    } catch(e) {
      console.log("Add Error:", e);
    } 
  };

  const deleteTask = async (id: string) => { 
    try { 
      await axios.delete(`${API_URL}/api/tasks/${id}`); 
      setTasks(tasks.filter(t => t._id !== id)); 
    } catch(e) {
      console.log("Delete Error:", e);
    } 
  };

  // ✅ FIX: 'isDone' ko 'isCompleted' se replace kiya
  const toggleTask = async (task: any) => {
    try {
      // 1. Optimistic Update (Turant UI badal do taaki fast lage)
      setTasks(prev => prev.map(t => 
        t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t
      ));

      // 2. Server call
      // Backend khud toggle kar raha hai, toh body bhejne ki zaroorat nahi hai, bas URL hit karo
      const res = await axios.put(`${API_URL}/api/tasks/${task._id}`);
      
      // 3. Server se pakka data aane par update (Safety ke liye)
      setTasks(prev => prev.map(t => 
        t._id === task._id ? res.data : t
      ));

    } catch (e) {
      console.log("Toggle Error:", e);
      // Agar fail ho jaye, to wapas purana state kar do (Optional logic)
      setTasks(prev => prev.map(t => 
        t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t
      ));
    }
  };

  return (
    <View style={styles.container}>
      <TaskList 
        tasks={tasks} 
        taskTitle={taskTitle} 
        setTaskTitle={setTaskTitle} 
        addTask={addTask} 
        deleteTask={deleteTask}
        toggleTask={toggleTask} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#F4F7FC' },
});