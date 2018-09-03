import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// 브라우저상에 리액트 컴포넌트를 보여주기 위한 ReacrDOM.render()함수.
// 첫번째 파라미터는 렌더링할 결과물, 두번째 파라미터는 컴포넌트를 어떤 DOM에 그릴지.
// id가 root인 DOM은 public/index.html에서 찾을 수 있다.
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
