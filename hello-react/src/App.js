import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// JSX문법을 사용하려면 반드시 React를 import해줘야 한다
// import하면 webpack에서 파일의 확장자에 따라 분류하고 하나의 파일로 합쳐준다.

class App extends Component {
  render() {
    return (
      // 컴포넌트는 클래스를 통해서 혹은 함수를 통해서 만들 수 있다.
      // 클래스를 통해서 만드는 방법 : 꼭 render함수가 있어야 하고 내부에 JSX를 return해줘야 한다.
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}
// 작성한 컴포넌트를 다른 곳에서 불러와서 사용할 수 있도록 내보내기를 해주는 것
export default App;
