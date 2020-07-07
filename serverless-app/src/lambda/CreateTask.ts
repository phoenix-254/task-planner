import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTaskRequest } from '../requests/CreateTaskRequest'

import { GetUserId } from './utils'

import { CreateTask } from '../businessLogic/Tasks'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const task: CreateTaskRequest = JSON.parse(event.body)
  const userId = GetUserId(event)
  
  const newTask = await CreateTask(task, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newTask
    })
  }
}
