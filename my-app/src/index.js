import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Components/App';
import Map from './Components/Map'
import Time from './Components/Time'
import StopContext from './Contexts/StopContext'
import DateContext from './Contexts/DateContext';
import StatusContext from './Contexts/StatusContext';
import TimeContext from './Contexts/TimeContext';


ReactDOM.render(
  <React.StrictMode>
    <TimeContext>
      <StatusContext>
        <DateContext>
          <StopContext>
            <Time />
            <App />
            <Map />
          </StopContext>
        </DateContext>
      </StatusContext>
    </TimeContext>
  </React.StrictMode>,
  document.getElementById('root')
);