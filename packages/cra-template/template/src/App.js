import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="rotating react logo" />
      </header>
      <main className="App-main">
      <div className="flexContainer">
      <h1>Learn React</h1>
      <p>Providing accessible products is very important, therefore please read ...</p>
      </div>
      <div className="flexContainer">
      <ul className="list-docs">
        <li>React Accessibility Docs: <a href="https://reactjs.org/docs/accessibility.html" target="_blank" rel="noopener noreferrer" className="App-link">reactjs.org/docs/accessibility.html</a></li>
        <li>Web Accessibility Initiative (WAI) Tips: <a href="https://www.w3.org/WAI/tips/developing/" target="_blank" rel="noopener noreferrer" className="App-link">Developing for Web Accessibility</a></li>
        <li>ARIA Authoring Practices Guide (APG): <a href="https://www.w3.org/WAI/ARIA/apg/practices/" target="_blank" rel="noopener noreferrer" className="App-link">w3.org/WAI/ARIA/apg/practices/</a></li>
        <li>MDN web docs: <a href="https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_accessibility" target="_blank" rel="noopener noreferrer" className="App-link">Accessibility in React</a></li>
      </ul>
      </div>
      <div className="flexContainer flexContainer-last"><p className="react-cta">Now you are ready to <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >Learn React
        </a></p>
      <p className="comment-sm">
          Edit <code>src/App.js</code> and save to reload.
        </p>
        </div>
      </main>
      <footer className="App-footer">Footer - learn more about&nbsp;<a href="https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions" target="_blank" rel="noopener noreferrer" className="App-link">Landmark Regions</a></footer>
    </div>
  );
}

export default App;
