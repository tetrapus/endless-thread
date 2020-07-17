import { Credentials } from "./Credentials";

export class RocketChatService {
  credentials?: Credentials;
  identity: any;

  constructor() {
    document.rocket = (a, b, c) => this.call(a, b, c);
  }

  call(method: "POST" | "GET", endpoint: string, data?: any) {
    return new Promise((resolve) => {
      if (document.rocketchatCorsBypass === undefined) {
        return;
      }
      console.log(this.credentials, data);
      document.rocketchatCorsBypass({
        method,
        url: `${document.rocketchatServer}/api/v1/${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          ...(this.credentials
            ? {
                "X-Auth-Token": this.credentials.authToken,
                "X-User-Id": this.credentials.userId,
              }
            : {}),
        },
        data: data ? JSON.stringify(data) : undefined,
        onload: (r: any) => {
          console.log(r);
          resolve(JSON.parse(r.responseText));
        },
      });
    });
  }

  async login() {
    const authResponse = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse(true);

    const loginResponse = (await this.call("POST", "login", {
      serviceName: "google",
      accessToken: authResponse.access_token,
      idToken: authResponse.id_token,
      expiresIn: authResponse.expires_in,
    })) as Credentials & { data: any };
    this.credentials = {
      authToken: loginResponse.data.authToken,
      userId: loginResponse.data.userId,
    };
    this.identity = loginResponse.data;
    return this.identity;
  }

  getIdentity() {
    return this.identity;
  }
}
