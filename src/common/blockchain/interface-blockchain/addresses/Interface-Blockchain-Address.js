import InterfaceBlockchainAddressHelper from './Interface-Blockchain-Address-Helper'
import InterfaceSatoshminDB from 'common/satoshmindb/Interface-SatoshminDB'
import Serialization from "common/utils/Serialization";
import BufferExtend from "common/utils/BufferExtended";
import WebDollarCrypto from 'common/crypto/WebDollar-Crypto'
import WebDollarCryptoData from 'common/crypto/WebDollar-Crypto-Data'
import BufferExtended from 'common/utils/BufferExtended';

class InterfaceBlockchainAddress{


    constructor (db, password = 'password'){

        this.address = null;

        this.publicKey = null;
        
        if (typeof db === 'undefined'){
            this.db = new InterfaceSatoshminDB();
            this.password = 'password';
        } else {
            this.db = db;
            this.password = password;
        }
    }

    async createNewAddress(salt){

        if (this.address !== null){
            console.log("WARNING! You overwrite the initial address")
        }

        let result = InterfaceBlockchainAddressHelper.generateAddress(salt);

        this.address = result.address;
        this.unencodedAddress = result.unencodedAddress;
        this.publicKey = result.publicKey;

        await this.savePrivateKey(result.privateKey.privateKey);
        await this.savePrivateKeyWIF(result.privateKey.privateKeyWIF);
    }

    updatePassword(newPassword){

        this.password = newPassword;
    }
    
    async savePrivateKey(value, password) {

        let key = this.address + '_privateKey';
        value = this.encrypt(value, password);
        
        try {
            return (await this.db.save(key, value));
        }
        catch(err) {
            return 'ERROR on SAVE privateKey: ' + err;
        }
    }
    
    async getPrivateKey(password) {
        
        let key = this.address + '_privateKey';
        
        try {
            let value = await this.db.get(key);            
            value = this.decrypt(value, password);

            return value;
        }
        catch(err) {
            return 'ERROR on LOAD privateKey: ' + err;
        }
    }
    
    async removePrivateKey() {

        let key = this.address + '_privateKey';
        
        try {
            return (await this.db.remove(key));
        }
        catch(err) {
            return 'ERROR on REMOVE privateKey: ' + err;
        }
    }
    
    async savePrivateKeyWIF(value) {

        let key = this.address + '_privateKeyWIF';
        
        try {
            return (await this.db.save(key, value));
        }
        catch(err) {
            return 'ERROR on SAVE privateKeyWIF: ' + err;
        }
    }
    
    async getPrivateKeyWIF() {
        
        let key = this.address + '_privateKeyWIF';
        
        try {
            return (await this.db.get(key));
        }
        catch(err) {
            return 'ERROR on LOAD privateKeyWIF: ' + err;
        }
    }
    
    async removePrivateKeyWIF() {

        let key = this.address + '_privateKeyWIF';
        
        try {
            return (await this.db.remove(key));
        }
        catch(err) {
            return 'ERROR on REMOVE privateKeyWIF: ' + err;
        }

    }

    serializeAddress(){

        return Buffer.concat( [
                                Serialization.serializeNumber1Byte(BufferExtended.fromBase(this.address).length),
                                BufferExtended.fromBase(this.address),
                                Serialization.serializeNumber1Byte(this.unencodedAddress.length),
                                this.unencodedAddress,
                                Serialization.serializeNumber1Byte(this.publicKey.length),
                                this.publicKey
                              ]);
    }
    
    deserializeAddress(buffer){

        buffer = WebDollarCryptoData.createWebDollarCryptoData(buffer).buffer;

        let offset = 0;
        let len = 0;

        try {

            //read Address
            len = Serialization.deserializeNumber( BufferExtend.substr(buffer, offset, 1) );
            offset += 1;

            this.address = BufferExtended.toBase( BufferExtend.substr(buffer, offset, len));
            offset += len;

            //read unencodedAddress
            len = Serialization.deserializeNumber( BufferExtend.substr(buffer, offset, 1) );
            offset += 1;

            this.unencodedAddress = BufferExtend.substr(buffer, offset, len);
            offset += len;

            //calcuating the address from the unencodedAddress
            if (InterfaceBlockchainAddressHelper.validateAddressChecksum(this.address).result === false) throw "address didn't pass the valdiateAddressChecksum "

            len = Serialization.deserializeNumber( BufferExtend.substr(buffer, offset, 1) );
            offset += 1;

            this.publicKey = BufferExtend.substr(buffer, offset, len);
            offset += len;


        } catch (exception){

            console.log("error deserializing address. ", exception);
            console.log("this.address", this.address);
            console.log("this.unencodedAddress", this.unencodedAddress.toString("hex"));
            throw exception;

        }
        
        return offset;
    }

    toString(){

        return this.address.toString()

    }
    
    encrypt(data, password) {
        
        if (typeof password === 'undefined')
            password = this.password;
        
        let encr = WebDollarCrypto.encryptAES(data, password);
        
        return Buffer.from(encr);
    }
    
    decrypt(data, password) {
        
        if (typeof password === 'undefined')
            password = this.password;

        let decr = WebDollarCrypto.decryptAES(data, password);

        return Buffer.from(decr);
    }
    
    async save() {
        
        let key = this.address.toString('hex');
        let value = this.serializeAddress();
        
        try {
            return (await this.db.save(key, value));
        }
        catch(err) {
            return 'ERROR on SAVE blockchain address: ' + err;
        }
    }
    
    async load() {
        
        let key = this.address.toString('hex');
        
        try {
            let value = await this.db.get(key);

            if (value === null) return false;

            this.deserializeAddress(value);

            return true;
        }
        catch(err) {
            console.log( 'ERROR on LOAD blockchain address: ' , err);
            return false;
        }
    }
    
    async remove() {

        let key = this.address.toString('hex');
        
        try {
            return (await this.db.remove(key));
        }
        catch(err) {
            return 'ERROR on REMOVE blockchain address: ' , err;
        }

    }
    
    async _toStringDebug(){

        let privateKey = await this.getPrivateKey();
        if (privateKey !== null || (privateKey.status !== undefined && privateKey.status === 404))
            privateKey = null;

        return "address" + this.address.toString() + (this.publicKey !== null ? "public key" + this.publicKey.toString() : '') + (privateKey !== null ? "private key" + privateKey.toString() : '')
    }


}

export default InterfaceBlockchainAddress;