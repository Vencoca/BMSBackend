let CryptoJS = require("crypto-js");
let instance: TuyaCloudApiHandler;

class TuyaCloudApiHandler {
    private baseUrl = "https://openapi.tuyaeu.com/";
    private clientId = process.env.TUYA_client_id || '';
    private secret = process.env.TUYA_secret || '';
    private device = process.env.TUYA_device || '';
    private nonce = "";
    private signMethod = "HMAC-SHA256";
    private timestamp!: number;
    private access!: {
        access_token: string,
        expire_time: number,
        refresh_token: string,
        uid: string,
    }

    constructor() {
        if (instance) {
            throw new Error("You can only create one instance!");
        }
        instance = this;
        this.getAcessToken();
    }

    private getAcessToken() {
        this.timestamp = this.getTime();
        const sign = this.calcSign(this.clientId, this.timestamp, this.nonce, this.stringToSign(), this.secret);
        let headers = new Headers();
        headers.append("client_id", this.clientId)
        headers.append("sign", sign)
        headers.append("t", this.timestamp.toString())
        headers.append("sign_method", this.signMethod);
        headers.append("nonce", this.nonce);
        headers.append("stringToSign", "");

        const requestOptions: RequestInit = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        fetch(`${this.baseUrl}v1.0/token?grant_type=1`, requestOptions)
            .then(response => response.json())
            .then(data => this.access = data.result)
            .catch(error => console.error('Error:', error));
    }

    private getTime() {
        const timestamp = new Date().getTime();
        return timestamp;
    }

    private calcSign(clientId: string, timestamp: number, nonce: string, signStr: string, secret: string) {
        var str = clientId + timestamp + nonce + signStr;
        var hash = CryptoJS.HmacSHA256(str, secret);
        var hashInBase64 = hash.toString();
        var signUp = hashInBase64.toUpperCase();
        return signUp;
    }

    private stringToSign() {
        const method = "GET"
        const url = "/v1.0/token?grant_type=1"
        const headersStr = ""
        const bodyStr = ""
        const sha256 = CryptoJS.SHA256(bodyStr)
        const signURL = method + "\n" + sha256 + "\n" + headersStr + "\n" + url;
        return signURL;
    }
}

const singletonTuyaAPIHandler = new TuyaCloudApiHandler();
export default singletonTuyaAPIHandler;