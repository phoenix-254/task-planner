import 'source-map-support/register'

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'

import Axios from 'axios'

import { verify, decode } from 'jsonwebtoken'
import { CreateLoggerInstance } from '../utils/logger'

import { Jwt } from '../auth/Jwt'
import { JwtPayload } from '../auth/JwtPayload'

const logger = CreateLoggerInstance('auth')

const jwksUrl = 'https://dev-lronsxj7.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function getCertificate(jwt: Jwt): Promise<string> {
  const jsonKeys = await Axios.get(jwksUrl)
  
  const signingKeys = jsonKeys.data.keys.filter(key => key.kid === jwt.header.kid)
  
  const certificate = `-----BEGIN CERTIFICATE-----\n${signingKeys[0].x5c[0]}\n-----END CERTIFICATE-----`
  return certificate
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const certificate = await getCertificate(jwt)

  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
