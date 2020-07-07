import React, { Component } from 'react'

import { Link, Route, Router, Switch } from 'react-router-dom'

import { Grid, Menu, Segment } from 'semantic-ui-react'

import Authenticator from './authentication/Authenticator'

import { LogInView } from './components/LogInView'
import { TasksView } from './components/TasksView'
import { ModifyTaskView } from './components/ModifyTaskView'

import { NotFound } from './components/NotFound'

export interface AppProps {}

export interface AppProps {
  authenticator: Authenticator
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.authenticator.login()
  }

  handleLogout() {
    this.props.authenticator.logout()
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.authenticator.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.authenticator.isAuthenticated()) {
      return <LogInView auth={this.props.authenticator} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <TasksView {...props} authenticator={this.props.authenticator} />
          }}
        />

        <Route
          path="/tasks/:taskId/edit"
          exact
          render={props => {
            return <ModifyTaskView {...props} authenticator={this.props.authenticator} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
