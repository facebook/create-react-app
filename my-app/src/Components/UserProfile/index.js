import React from 'react'; 
import './votingStats.css';

var user = {
    basicInfo: {
      player1: "Lebron James",
      player2: "Dwayne Wade",
      numberOfVotesForPlayer1: 70,
      numberOfVotesForPlayer2: 30
    }
  }
  
  class ProgressBarExample extends React.Component {
  
    constructor(props) {
      super(props)
      
      this.state = {
        percentage: this.props.percent
      
      }
      this.nextStep = this.nextStep.bind(this)
    }
    
    nextStep() {
      if(this.state.percentage === 100) return 
      this.setState({ percentage: this.state.percentage + 20 })
    }
    
    render() {
    
      return (
        <div>
          
          <ProgressBar percentage={this.state.percentage} />
       
        </div>
      )
    }  
  }
  
  const ProgressBar = (props) => {
    return (
        <div className="progress-bar">
          <Filler percentage={props.percentage} />
        </div>
      )
  }
  
  const Filler = (props) => {
    return <div className="filler" style={{ width: `${props.percentage}%` }} />
  }
  
  class Avatar extends React.Component {
    render() {
      var image = this.props.image,
          style = {
            width: this.props.width || 100,
            height: this.props.height || 50
          }; 
      
      if (!image) return null;
      
      return (
       <div className="avatar" style={style}>
             <img src={this.props.image} /> 
        </div>
      );
    }
  }
  
  class MainPanel extends React.Component {
    render() {
      var info = this.props.info;
      if (!info) return null;
      
      return (
       <div>
          <div className="top">
            <h1> Voting Stats </h1>
              <Avatar 
                 image={info.photo} 
                 width={100}
                 height={100}
              /> 
              <h3>{info.player1}</h3>
             <h4> {info.numberOfVotesForPlayer1}%</h4>
              <ProgressBarExample percent={info.numberOfVotesForPlayer1} />
            
     
              <h3>{info.player2}</h3>
             <h4> {info.numberOfVotesForPlayer2}% </h4>
              <ProgressBarExample percent={info.numberOfVotesForPlayer2} />
            
            <hr />
           <div>
          
        </div>
          </div>
        </div>
      );
    }
  }
  
  
  export default class UserProfile extends React.Component {
    render() {
      return (
        <div id="user-profile">
          <MainPanel info={user.basicInfo} />
          
        </div>
        
      )
    }
  }
  