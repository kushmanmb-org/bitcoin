"use client";
import { useState, useRef } from "react";
import styles from "./TaskList.module.css";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: 1, title: "Connect wallet to OnchainKit", completed: false },
  { id: 2, title: "Explore WETH interactions", completed: false },
  { id: 3, title: "Check out the documentation", completed: false },
  { id: 4, title: "Build your first onchain app", completed: false },
];

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const nextIdRef = useRef(initialTasks.length + 1);

  const toggleTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: nextIdRef.current,
      title: newTaskTitle.trim(),
      completed: false,
    };

    nextIdRef.current += 1;
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const deleteTask = (id: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Getting Started Tasks</h2>
      <p className={styles.progress}>
        {completedCount} of {totalCount} completed
      </p>

      <form onSubmit={addTask} className={styles.addForm}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className={styles.input}
          maxLength={100}
        />
        <button type="submit" className={styles.addButton}>
          Add Task
        </button>
      </form>

      <ul className={styles.taskList}>
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`${styles.taskItem} ${
              task.completed ? styles.completed : ""
            }`}
          >
            <label className={styles.taskLabel}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className={styles.checkbox}
              />
              <span className={styles.taskTitle}>{task.title}</span>
            </label>
            <button
              onClick={() => deleteTask(task.id)}
              className={styles.deleteButton}
              aria-label={`Delete task: ${task.title}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className={styles.emptyState}>
          No tasks yet. Add one to get started!
        </p>
      )}
    </div>
  );
}
