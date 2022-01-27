
import './App.css';
import './components/Expenseitems'
import Expenseitems from './components/Expenseitems';

 const newItem = new Expenseitems("Avengers") 
function App() {
  return (
    <div className="App">
{newItem}
    </div>
  );
}

export default App;
