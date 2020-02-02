import React from "react";
import { ClockService } from "../services/clock-service";
import { injectFunction } from "inversify-constructor-injection";

const FunctionBased = (_props: any, _context: any, clock: ClockService) => {
    return <div className="exampleComponent">
        <div>Function Based Component</div>
        <div>Rendered at {clock.getTime()}</div>
    </div>;
}

export default injectFunction(FunctionBased, [undefined, undefined, ClockService]);