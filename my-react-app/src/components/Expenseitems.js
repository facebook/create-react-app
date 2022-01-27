import './Expenseitems.css'

function Expenseitems(name){
const rating = 5
const movieName = "Avengers"
const info = "Superhero movie"
    return  <div> 
        
        <h1>My first app 2022</h1>{name}
        <div className="expense-item">
        

 

        <div className="expense-item__description">{movieName}</div>
        <div className=""> <h2>{info}</h2></div>
        <div className='expense-item__price'>{rating}</div>

        
      </div>
      </div>
}

export default Expenseitems