export  interface ICacheStrategy {
    set(key:string,value:string, ttl?:number):void;
    get(key:string):Promise<string | null>;
    del(key:string):Promise<void>;
}
