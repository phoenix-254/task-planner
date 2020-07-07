import * as React from 'react'

import Authenticator from '../authentication/Authenticator'

import { Button } from 'react-bootstrap'

interface LogInProps {
  auth: Authenticator
}

interface LogInState {}

export class LogInView extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div>
        <h3>Please log in to continue...</h3>
        <br/><br/>
        <Button style={{padding: '8px 80px'}} variant="dark" size="lg" onClick={this.onLogin}>
          Log In
        </Button>
      </div>
    )
  }
}
