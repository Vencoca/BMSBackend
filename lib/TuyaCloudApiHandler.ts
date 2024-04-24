let CryptoJS = require("crypto-js");
let instance: TuyaCloudApiHandler;

class TuyaCloudApiHandler {
  private baseUrl = "https://openapi.tuyaeu.com";
  private clientId = process.env.TUYA_client_id || "";
  private secret = process.env.TUYA_secret || "";
  private device = process.env.TUYA_device || "";
  private nonce = "";
  private signMethod = "HMAC-SHA256";
  private lastTokenRefresh!: number;
  private access?: {
    access_token: string;
    expire_time: number;
    refresh_token: string;
    uid: string;
  };

  constructor() {
    if (instance) {
      throw new Error("You can only create one instance!");
    }
    instance = this;
  }

  private async getAccessToken(): Promise<void> {
    this.lastTokenRefresh = this.getTime();
    const url = "/v1.0/token?grant_type=1";
    const requestOptions = this.getRequestOptions(this.lastTokenRefresh, url);
    try {
      const response = await fetch(`${this.baseUrl}${url}`, requestOptions);
      const data = await response.json();
      this.access = data.result;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed to get access token");
    }
  }

  private getRequestOptions(
    timestamp: number,
    url: string,
    useAcessToken: boolean = false
  ) {
    const sign = this.calcSign(
      this.clientId,
      timestamp,
      this.nonce,
      this.stringToSign(url),
      this.secret,
      useAcessToken ? this.access?.access_token : ""
    );
    let headers = new Headers();
    headers.append("client_id", this.clientId);
    headers.append("sign", sign);
    headers.append("t", timestamp.toString());
    headers.append("sign_method", this.signMethod);
    headers.append("nonce", this.nonce);
    headers.append("stringToSign", "");

    if (useAcessToken && this.access) {
      headers.append("access_token", this.access.access_token);
    }

    const requestOptions: RequestInit = {
      method: "GET",
      headers: headers,
      redirect: "follow"
    };
    return requestOptions;
  }

  private async renewAccessToken(): Promise<void> {
    const now = this.getTime();
    if (
      !this.access ||
      now - this.lastTokenRefresh >= this.access!.expire_time + 120
    ) {
      await this.getAccessToken();
    }
  }

  public async getData(): Promise<any> {
    try {
      await this.renewAccessToken();
      const url = `/v1.0/devices/${this.device}/status`;
      const requestOptions = this.getRequestOptions(this.getTime(), url, true);
      const response = await fetch(`${this.baseUrl}${url}`, requestOptions);
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed to get data");
    }
  }

  private getTime() {
    const timestamp = new Date().getTime();
    return timestamp;
  }

  private calcSign(
    clientId: string,
    timestamp: number,
    nonce: string,
    signStr: string,
    secret: string,
    accessToken: string = ""
  ) {
    var str = clientId + accessToken + timestamp + nonce + signStr;
    var hash = CryptoJS.HmacSHA256(str, secret);
    var hashInBase64 = hash.toString();
    var signUp = hashInBase64.toUpperCase();
    return signUp;
  }

  private stringToSign(url: string) {
    const method = "GET";
    const headersStr = "";
    const bodyStr = "";
    const sha256 = CryptoJS.SHA256(bodyStr);
    const signURL = method + "\n" + sha256 + "\n" + headersStr + "\n" + url;
    return signURL;
  }
}

const singletonTuyaAPIHandler = new TuyaCloudApiHandler();
export default singletonTuyaAPIHandler;
