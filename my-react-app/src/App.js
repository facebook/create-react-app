
import './App.css';
import './componment/Expenseitems'
import Expenseitems from './componment/Expenseitems';

 const newItem = new Expenseitems("Avengers") 
function App() {
  return (
    <div className="App">
{newItem}
    </div>
  );
}

export default App;
