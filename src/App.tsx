import * as React from "react";
import { ThreadList } from "./EmailViewer/ThreadList";

import "normalize.css";
import { Navigation } from "./Navigation/Navigation";
import { Spinner } from "./EmailViewer/UI/Spinner";
import { Logo } from "./EmailViewer/UI/Logo";

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
        client_id:
          "404459806580-5a49qah83cbdrtchkhntvite1o56rnmc.apps.googleusercontent.com"
      });
      const authClient = gapi.auth2.getAuthInstance();
      authClient.then(() => this.handleAuthChange(authClient.isSignedIn.get()));
      authClient.isSignedIn.listen(authState =>
        this.handleAuthChange(authState)
      );
    });
  }

  render() {
    return (
      <div>
        {this.state.auth === undefined ? (
          <div>
            <Logo></Logo>
            <Spinner></Spinner>
          </div>
        ) : this.state.profile ? (
          <div>
            <Navigation profile={this.state.profile}></Navigation>
            <ThreadList email={this.state.profile.getEmail()}></ThreadList>
          </div>
        ) : (
          <div>
            <Logo></Logo>
            <button onClick={() => this.handleLogin()}>Log In</button>
          </div>
        )}
      </div>
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

  handleLogin() {
    gapi.auth2.getAuthInstance().signIn({
      scope:
        "profile https://mail.google.com/ https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly"
    });
  }
}

export { App };
