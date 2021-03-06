import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'

import { Checkbox, Divider, Grid, Header, Icon, Image, Loader } from 'semantic-ui-react'
import { Button as SemanticButton } from 'semantic-ui-react'

import { Button, InputGroup, FormControl } from 'react-bootstrap'

import { GetAllTasks, CreateNewTask, UpdateTask, DeleteTask } from '../api-requests/apiRequestHandler'

import { Task } from '../types/Task'

import Authenticator from '../authentication/Authenticator'

interface TasksProps {
  authenticator: Authenticator
  history: History
}

interface TasksState {
  tasks: Task[]
  newTaskTitle: string
  isLoadingTasks: boolean
}

export class TasksView extends React.PureComponent<TasksProps, TasksState> {
  state: TasksState = {
    tasks: [],
    newTaskTitle: '',
    isLoadingTasks: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ 
      newTaskTitle: event.target.value 
    })
  }

  onEditButtonClick = (taskId: string) => {
    this.props.history.push(`/tasks/${taskId}/edit`)
  }

  onTaskCreate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      
      const newTask = await CreateNewTask(this.props.authenticator.getIdToken(), {
        title: this.state.newTaskTitle,
        dueDate
      })

      this.setState({
        tasks: [...this.state.tasks, newTask],
        newTaskTitle: ''
      })
    } 
    catch {
      alert('Task creation failed')
    }
  }

  onDeleteTask = async (taskId: string) => {
    try {
      await DeleteTask(this.props.authenticator.getIdToken(), taskId)

      this.setState({
        tasks: this.state.tasks.filter(task => task.taskId !== taskId)
      })
    } catch {
      alert('Task deletion failed')
    }
  }

  onTaskCompleted = async (position: number) => {
    try {
      const task = this.state.tasks[position]

      await UpdateTask(this.props.authenticator.getIdToken(), task.taskId, {
        title: task.title,
        dueDate: task.dueDate,
        isCompleted: !task.isCompleted
      })

      this.setState({
        tasks: update(this.state.tasks, {
          [position]: { 
            isCompleted: { $set: !task.isCompleted } 
          }
        })
      })
    } catch {
      alert('Task deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const tasks = await GetAllTasks(this.props.authenticator.getIdToken())

      this.setState({
        tasks: tasks,
        isLoadingTasks: false
      })
    } catch (e) {
      alert(`Failed to fetch tasks: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h3">My Tasks</Header>

        {this.renderCreateTaskView()}

        {this.renderTasks()}
      </div>
    )
  }

  renderCreateTaskView() {
    return (
      <Grid.Row style={{padding: '2em'}}>
        <Grid.Column style={{width: '100%'}}>
          <InputGroup>
            <InputGroup.Prepend>
              <Button variant="outline-secondary" onClick={this.onTaskCreate}>Add New Task</Button>
            </InputGroup.Prepend>
            <FormControl aria-describedby="basic-addon1" 
              placeholder="Task title" onChange={this.handleNameChange} />
          </InputGroup>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTasks() {
    if (this.state.isLoadingTasks) {
      return this.renderLoading()
    }

    return this.renderTaskItems()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading...
        </Loader>
      </Grid.Row>
    )
  }

  renderTaskItems() {
    return (
      <Grid style={{paddingLeft: '3em'}}>
        {this.state.tasks.map((task, pos) => {
          return (
            <Grid.Row key={task.taskId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTaskCompleted(pos)}
                  checked={task.isCompleted}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                <b>{task.title}</b>
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                <b>Due on: {task.dueDate}</b>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <SemanticButton
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(task.taskId)}
                >
                  <Icon name="pencil" />
                </SemanticButton>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <SemanticButton
                  icon
                  color="red"
                  onClick={() => this.onDeleteTask(task.taskId)}
                >
                  <Icon name="delete" />
                </SemanticButton>
              </Grid.Column>
              {task.imageUrl && (
                <Image src={task.imageUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const myDate = new Date()
    myDate.setDate(myDate.getDate() + 14)
    return dateFormat(myDate, 'mm-dd-yyyy') as string
  }
}
