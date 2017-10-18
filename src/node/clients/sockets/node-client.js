let ioClient = require('socket.io-client');

import {nodeVersionCompatibility, nodeVersion, nodePort} from '../../../consts/const_global.js';
import {sendRequest, sendRequestWaitOnce, sendRequestSubscribe, subscribeSocketObservable} from './../../../common/sockets/sockets.js';
import {NodeLists} from './../../lists/node-lists.js';
import {sendHello} from './../../../common/sockets/node/protocol.js';

class NodeClient {

    // socket : null,

    constructor(address){

        console.log("NodeClient constructor");

        this.socket = null;

        if (typeof address === 'undefined')
            this.connectTo(address);
    }

    connectTo(address){

        try
        {
            this.socket = ioClient(address+":"+nodePort);


            subscribeSocketObservable(this.socket, "connection").subscribe(response => {

                console.log("Client connected");
                this.socket.address = address;
                sendHello(this.socket, this.initializeSocket);

            });

            subscribeSocketObservable(this.socket, "disconnect").subscribe(response => {

                console.log("Client connected");
                NodeLists.disconnectSocket(this.socket);

            });


        }
        catch(Exception){
            console.log("Error Connecting Node to ",address);
            console.log(" Exception", Exception.toString());
            return false;
        }

        return true;
    }

    initializeSocket(){

        NodeLists.checkAddSocket(this.socket, true, false);

    }


}

exports.NodeClient =  NodeClient;