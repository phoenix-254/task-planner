import ReactDOM from 'react-dom'

import './index.css'
import 'semantic-ui-css/semantic.min.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { makeAuthRouting } from './routing';

import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  makeAuthRouting(), 
  document.getElementById('root'))

serviceWorker.unregister()
