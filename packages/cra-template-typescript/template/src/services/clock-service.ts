import { injectable } from "inversify"

@injectable()
export class ClockService{

    private _callbacks: (() => void)[] | undefined;

    public registerTickCallback(callback: () => void){
        if(this._callbacks == null){
            this._callbacks = [callback];
            setInterval(() => this._callbacks?.forEach(cb => cb()), 1000);
        } else {
            this._callbacks.push(callback);
        }
    }

    public getTime(){
        return new Date().toLocaleTimeString();
    }

}