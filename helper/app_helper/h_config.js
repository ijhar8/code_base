/******
 for getting data from env variable
*******/

const config = require('config');

const getConfig=(key)=>{

    return  config.get(key);
}

module.exports={
    getConfig
}