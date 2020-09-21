module.exports = class PugHelper {

    static _acceleratorTableCompiled;
    static _costSavingsTableCompiled;


    static set acceleratorTableFunction(table){
        this._acceleratorTableCompiled = table;
    }

    static get acceleratorTableFunction(){
        return this._acceleratorTableCompiled;
    }

    static set costSavingsTableFunction(table){
        this._costSavingsTableCompiled = table;
    }

    static get costSavingsTableFunction(){
        return this._costSavingsTableCompiled;
    }


    constructor(){
        
    }


    


}