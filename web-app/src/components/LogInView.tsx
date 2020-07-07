import * as React from 'react'

import Authenticator from '../authentication/Authenticator'

import { Button } from 'semantic-ui-react'

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
        <h1>Please log in</h1>

        <Button onClick={this.onLogin} size="huge" color="olive">
          Log in
        </Button>
      </div>
    )
  }
}
