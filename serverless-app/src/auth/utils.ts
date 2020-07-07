import { decode } from 'jsonwebtoken'
import { JwtPayload } from './JwtPayload'

export function parseUserId(jwtToken: string): string {
  return (decode(jwtToken) as JwtPayload).sub
}
