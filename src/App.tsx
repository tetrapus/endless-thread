import * as React from "react";
import { ThreadList } from "./EmailViewer/ThreadList";

import 'normalize.css';

class App extends React.Component<{}, { auth?: boolean; email?: string }> {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      auth: undefined,
      email: undefined
    };
    gapi.load("client:auth2", () => {
      gapi.auth2.init({
        client_id:
          "404459806580-5a49qah83cbdrtchkhntvite1o56rnmc.apps.googleusercontent.com"
      });
      const authClient = gapi.auth2.getAuthInstance();
      this.setState({
        auth: authClient.isSignedIn.get()
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.auth === undefined ? (
          <div>Loading</div>
        ) : this.state.auth ? (
          <div>
            <div>Authenticated as {this.state.email}</div>
            <ThreadList email={this.state.email}></ThreadList>
          </div>
        ) : (
          <button onClick={() => this.handleLogin()}>Log In</button>
        )}
      </div>
    );
  }

  handleLogin() {
    gapi.auth2
      .getAuthInstance()
      .signIn({
        scope:
          "profile https://mail.google.com/ https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly"
      })
      .then(() => {
        this.setState({
          email: gapi.auth2
            .getAuthInstance()
            .currentUser.get()
            .getBasicProfile()
            .getEmail(),
          auth: true
        });
      });
  }
}

export { App };
