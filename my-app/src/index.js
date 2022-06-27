import React from 'react';
import ReactDOM from 'react-dom';
import App from './Components/App';
import Time from './Components/Time';
import StopContext from './Contexts/StopContext'
import DateContext from './Contexts/DateContext';
import StatusContext from './Contexts/StatusContext';
import TimeContext from './Contexts/TimeContext';
import './index.css';


ReactDOM.render(
  <React.StrictMode>
    <TimeContext>
      <StatusContext>
        <DateContext>
          <StopContext>
            <Time />
            <App />
          </StopContext>
        </DateContext>
      </StatusContext>
    </TimeContext>
  </React.StrictMode>,
  document.getElementById('root')
);