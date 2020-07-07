import * as React from 'react'

import { Form, Button } from 'semantic-ui-react'

import Authenticator from '../authentication/Authenticator'

import { GetImageUploadUrl, UploadImage } from '../api-requests/apiRequestHandler'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface ModifyTaskProps {
  match: {
    params: {
      taskId: string
    }
  }

  authenticator: Authenticator
}

interface ModifyTaskState {
  file: any
  uploadState: UploadState
}

export class ModifyTaskView extends React.PureComponent<ModifyTaskProps, ModifyTaskState> {
  state: ModifyTaskState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      
      const uploadUrl = await GetImageUploadUrl(this.props.authenticator.getIdToken(), this.props.match.params.taskId)

      this.setUploadState(UploadState.UploadingFile)
      
      await UploadImage(uploadUrl, this.state.file)

      alert('Image was successfully uploaded!')
    } 
    catch (e) {
      alert('Could not upload a file: ' + e.message)
    } 
    finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading image</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
