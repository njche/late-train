import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Components/App';
import Map from './Components/Map'
import Time from './Components/Time'
import StopContext from './Contexts/StopContext'
import DateContext from './Contexts/DateContext';
import StatusContext from './Contexts/StatusContext';


ReactDOM.render(
  <React.StrictMode>
    <StatusContext>
      <DateContext>
        <StopContext>
          <Time />
          <App />
          <Map />
        </StopContext>
      </DateContext>
    </StatusContext>
  </React.StrictMode>,
  document.getElementById('root')
);