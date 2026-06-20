import { exec } from "node:child_process";

export default class EXECUTER{
    private callback:(error:Error|null,stdout:string,stderr:string)=>any;
    
    constructor(callback:(error:Error|null,stdout:string,stderr:string)=>any){
        this.callback = callback;
    }
    
    private args!:string;
    private command!:string;

    public addCMD(command:string,args:string[]|string){
        this.command = command.trim();
        this.args = Array.isArray(args) ? `\"${args.map(x=>x.trim()).join(" ")}\"` : args;
        return this;
    }

    public executeCMD(){
        exec(`${this.command} ${this.args}`,{
            windowsHide:true,
        },this.callback.bind(this))
    }

}