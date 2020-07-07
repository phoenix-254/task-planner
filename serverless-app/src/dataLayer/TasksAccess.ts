import { Task } from '../models/Task'
import { TaskUpdate } from '../models/TaskUpdate'

import * as AWS  from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { CreateLoggerInstance } from '../utils/logger'

const logger = CreateLoggerInstance('TasksAccess')

const XAWS = AWSXRay.captureAWS(AWS)

export class TasksAccess {
  constructor(
    // DynamoDB client
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    
    // Attachments S3 bucket client
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),

    // Environment variables
    private readonly tasksTable = process.env.TASKS_TBL,
    private readonly tasksCreatedAtIdx = process.env.TASKS_CREATED_AT_IDX,
    private readonly imagesBucket = process.env.IMAGES_BUCKET,
    private readonly signedUrlExpirySeconds: Number = Number(process.env.SIGNED_URL_EXPIRY)
  ){}

  async GetTask(userId: string, taskId: string): Promise<Task> {
    logger.info('-------------------- GET TASK ITEM : START --------------------')

    logger.info(`UserId: ${userId}, TaskId: ${taskId}`)

    const result = await this.docClient.get({
      TableName: this.tasksTable,
      Key: {
        'userId': userId,
        'taskId': taskId
      }
    }).promise()

    logger.info('Response: ', result)
  
    logger.info('-------------------- GET TASK ITEM : END --------------------')

    return result.Item as Task
  } 

  async GetAllTasks(userId: string): Promise<Task[]> {
    logger.info('-------------------- GET ALL TASK ITEMS : START --------------------')

    logger.info('UserId: ', userId)

    const result = await this.docClient.query({
      TableName: this.tasksTable,
      IndexName: this.tasksCreatedAtIdx,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
  
    logger.info('Response: ', result)

    logger.info('-------------------- GET ALL TASK ITEMS : END --------------------')

    return result.Items as Task[]
  }

  async CreateTask(task: Task): Promise<Task> {
    logger.info('-------------------- CREATE TASK : START --------------------')

    logger.info('Task: ', task)

    await this.docClient.put({
      TableName: this.tasksTable,
      Item: task
    }).promise()

    logger.info('-------------------- CREATE TASK : END --------------------')

    return task
  }

  async UpdateTask(taskUpdate: TaskUpdate, userId: string, taskId: string): Promise<void> {
    logger.info('-------------------- UPDATE TASK : START --------------------')

    logger.info('NewItem: ', taskUpdate)
    logger.info(`UserId: ${userId}, TaskId: ${taskId}`)

    await this.docClient.update({
      TableName: this.tasksTable,
      Key: {
        'userId': userId,
        'taskId': taskId
      },
      UpdateExpression: 'set title = :title, dueDate = :dueDate, isCompleted = :isCompleted',
      ExpressionAttributeValues:{
        ':title': taskUpdate.title,
        ':dueDate': taskUpdate.dueDate,
        ':isCompleted': taskUpdate.isCompleted
      }
    }).promise()

    logger.info('-------------------- UPDATE TASK : END --------------------')
  }

  async DeleteTask(userId: string, taskId: string): Promise<void> {
    logger.info('-------------------- DELETE TASK : START --------------------')

    logger.info(`UserId: ${userId}, TaskId: ${taskId}`)

    await this.docClient.delete({
      TableName: this.tasksTable,
      Key: {
        'userId': userId,
        'taskId': taskId
      }
    }).promise()

    logger.info('-------------------- DELETE TASK : END --------------------')
  }

  async GenerateImageUploadUrl(userId: string, taskId: string): Promise<string> {
    logger.info('-------------------- GENERATE IMAGE UPLOAD URL : START --------------------')
    
    const uploadUrl = `https://${this.imagesBucket}.s3.amazonaws.com/${taskId}`
  
    logger.info(`UserId: ${userId}, TaskId: ${taskId}`)

    // Update attachmentUrl value in dynamodb table
    await this.docClient.update({
      TableName: this.tasksTable,
      Key: {
        'userId': userId,
        'taskId': taskId
      },
      UpdateExpression: 'set imageUrl = :imageUrl',
      ExpressionAttributeValues: {
        ':imageUrl': uploadUrl
      }
    }).promise()

    const url = this.getUploadUrl(taskId)

    logger.info(`Upload URL: ${url}`)

    logger.info('-------------------- GENERATE IMAGE UPLOAD URL : END --------------------')

    return url;
  }

  // Get URL using which the client app can upload the attachment into S3 bucket
  private getUploadUrl(taskId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.imagesBucket,
      Key: taskId,
      Expires: this.signedUrlExpirySeconds
    })
  }
}