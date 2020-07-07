import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTaskRequest } from '../requests/UpdateTaskRequest'

import { GetUserId } from './utils'

import { GetTask, UpdateTask } from '../businessLogic/Tasks'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const updatedTask: UpdateTaskRequest = JSON.parse(event.body)

  const userId = GetUserId(event)
  const taskId = event.pathParameters.taskId
  
  const task = await GetTask(userId, taskId)

  if (!task) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Task does not exist!'
      })
    }
  }

  await UpdateTask(updatedTask, userId, taskId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: null
  }
}


