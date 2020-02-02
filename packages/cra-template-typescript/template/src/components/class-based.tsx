import React, { Component } from "react";
import { injectConstructor } from "inversify-constructor-injection";
import './component.css';
import { ClockService } from "../services/clock-service";
import { injectable } from "inversify";

@injectable()
class ClassBased extends Component<{}, {time: string}> {

    constructor(params: any, context: any, clock: ClockService){
        super(params, context);

        this.state = {time: clock.getTime()}

        clock.registerTickCallback(() => this.setState({time: clock.getTime()}))
    }

    public render(){
        return <div className="exampleComponent">
            <div>Class Based Component</div>
            <div>{this.state.time}</div>
        </div>
    }
}

export default injectConstructor(ClassBased);