import Axios from 'axios'

import { endpoint } from '../AppConfig'

import { Task } from '../types/Task';

import { CreateTaskRequest } from '../types/CreateTaskRequest';
import { UpdateTaskRequest } from '../types/UpdateTaskRequest';

export async function GetAllTasks(idToken: string): Promise<Task[]> {
  const response = await Axios.get(`${endpoint}/tasks`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })

  return response.data.items
}

export async function CreateNewTask(idToken: string, newTask: CreateTaskRequest): Promise<Task> {
  const response = await Axios.post(`${endpoint}/tasks`,  JSON.stringify(newTask), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  return response.data.item
}

export async function UpdateTask(idToken: string, taskId: string, updatedTask: UpdateTaskRequest): Promise<void> {
  await Axios.patch(`${endpoint}/tasks/${taskId}`, JSON.stringify(updatedTask), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function DeleteTask(idToken: string, taskId: string): Promise<void> {
  await Axios.delete(`${endpoint}/tasks/${taskId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function GetImageUploadUrl(idToken: string, taskId: string): Promise<string> {
  const response = await Axios.post(`${endpoint}/tasks/${taskId}/image`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  return response.data.uploadUrl
}

export async function UploadImage(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
