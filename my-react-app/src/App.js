
import './App.css';
import './components/Expenseitems'
import Expenseitems from './components/Expenseitems';

const newItem = new Expenseitems("=======Movie 1======") 
const newItem2 = new Expenseitems("=======Movie 1======") 
function App() {
  return (
    <div className="App">
{newItem}{newItem2}
    </div>
  );
}

export default App;
