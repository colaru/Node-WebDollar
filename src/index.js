if(( typeof window !== 'undefined' && !window._babelPolyfill) ||
    ( typeof global !== 'undefined' && !global._babelPolyfill)) {
    require('babel-polyfill')
}

console.log(""); console.log(""); console.log("");
console.log("Node WebDollar");
console.log(""); console.log(""); console.log("");

let Main = require('./main.js').default;

let exportObject = Main;



// Export WebDollar
module.exports =  exportObject;

/*
    Export the WebDollar to Browser
 */

//browser minimized script
if ( typeof global.window !== 'undefined')
    global.window.WebDollar = exportObject;

if ( typeof window !== 'undefined')
    window.WebDollar = exportObject;


console.log("Node WebDollar End");

