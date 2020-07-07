import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { GetUserId } from './utils'

import { GetTask, GenerateImageUploadUrl } from '../businessLogic/Tasks'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

  const uploadUrl = await GenerateImageUploadUrl(userId, taskId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
}
