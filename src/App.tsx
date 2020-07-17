import * as React from "react";
import { Login } from "./Homepage/Login";
import { EmailViewer } from "./EmailViewer/EmailViewer";

import "normalize.css";
import "./App.scss";

interface State {
  profile?: gapi.auth2.BasicProfile;
  auth?: boolean;
}

class App extends React.Component<{}, State> {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      profile: undefined,
      auth: undefined
    };
    gapi.load("client:auth2", async () => {
      gapi.auth2.init({
        client_id: process.env.GOOGLE_CLIENT_ID
      });
      const authClient = gapi.auth2.getAuthInstance();
      authClient.then(() => this.handleAuthChange(authClient.isSignedIn.get()));
      authClient.isSignedIn.listen(authState =>
        this.handleAuthChange(authState)
      );
    });
  }

  render() {
    return this.state.auth && this.state.profile ? (
      <EmailViewer profile={this.state.profile}></EmailViewer>
    ) : (
      <Login loading={this.state.auth === undefined}></Login>
    );
  }

  handleAuthChange(isAuthenticated: boolean) {
    this.setState({
      profile: isAuthenticated
        ? gapi.auth2
            .getAuthInstance()
            .currentUser.get()
            .getBasicProfile()
        : undefined,
      auth: isAuthenticated
    });
    console.log(gapi.auth2
      .getAuthInstance().currentUser.get().getAuthResponse());
  }
}

export { App };
