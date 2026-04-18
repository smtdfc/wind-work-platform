export  interface ICacheStrategy {
    set(key:string,value:string):void;
    get(key:string):Promise<string | null>;
    del(key:string):Promise<void>;
}
