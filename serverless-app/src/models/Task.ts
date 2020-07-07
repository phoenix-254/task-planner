export interface Task {
  userId: string
  taskId: string
  createdAt: string
  title: string
  dueDate: string
  isCompleted: boolean
  imageUrl?: string
}
