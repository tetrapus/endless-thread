import * as React from "react";
import { ThreadList } from "./EmailViewer/ThreadList";

import "normalize.css";
import { Navigation } from "./Navigation/Navigation";
import { Login } from "./Login/Login";

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
      <div>
        <Navigation profile={this.state.profile}></Navigation>
        <ThreadList email={this.state.profile.getEmail()}></ThreadList>
      </div>
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
  }
}

export { App };
