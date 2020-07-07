import { TasksAccess } from '../dataLayer/TasksAccess' 

import { Task } from '../models/Task'
import { TaskUpdate } from '../models/TaskUpdate'

import { CreateTaskRequest } from '../requests/CreateTaskRequest'
import { UpdateTaskRequest } from '../requests/UpdateTaskRequest'

import * as uuid from 'uuid'

const tasksManager: TasksAccess = new TasksAccess()

export async function GetTask(userId: string, taskId: string): Promise<Task> {
  return await tasksManager.GetTask(userId, taskId)
}

export async function GetAllTasks(userId: string): Promise<Task[]> {
  return await tasksManager.GetAllTasks(userId)
}

export async function CreateTask(createTaskReq: CreateTaskRequest, userId: string): Promise<Task> {  
  const newTask: Task = {
    userId: userId,
    taskId: uuid.v4(),
    title: createTaskReq.title,
    dueDate: createTaskReq.dueDate,
    createdAt: new Date().toISOString(),
    isCompleted: false
  }
  
  return await tasksManager.CreateTask(newTask)
}

export async function UpdateTask(updateTaskReq: UpdateTaskRequest, userId: string, taskId: string): Promise<void> {
  const taskUpdate: TaskUpdate = {
    title: updateTaskReq.title,
    dueDate: updateTaskReq.dueDate,
    isCompleted: updateTaskReq.isCompleted
  }

  await tasksManager.UpdateTask(taskUpdate, userId, taskId)
}

export async function DeleteTask(userId: string, taskId: string): Promise<void> {
  return await tasksManager.DeleteTask(userId, taskId)
}

export async function GenerateImageUploadUrl(userId: string, taskId: string): Promise<string> {
  return await tasksManager.GenerateImageUploadUrl(userId, taskId)
}