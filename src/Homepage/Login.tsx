import * as React from "react";
import { Logo } from "../Inbox/UI/Logo";
import { Spinner } from "../Inbox/UI/Spinner";
import { EndlessThread } from "../Inbox/UI/EndlessThread";
import "./Login.scss";

interface State {
  loading: boolean;
}

const handleLogin = () => {
  gapi.auth2.getAuthInstance().signIn({
    scope:
      "profile https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/calendar.events.readonly https://mail.google.com/ https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly",
  });
};

export const Login = ({ loading }: State) => {
  return (
    <div>
      <EndlessThread
        initial={{ x: window.innerWidth / 2, y: 250 }}
      ></EndlessThread>
      <EndlessThread
        initial={{ x: window.innerWidth / 2, y: 250 }}
      ></EndlessThread>
      <EndlessThread
        initial={{ x: window.innerWidth / 2, y: 250 }}
      ></EndlessThread>
      <EndlessThread
        initial={{ x: window.innerWidth / 2, y: 250 }}
      ></EndlessThread>
      <EndlessThread
        initial={{ x: window.innerWidth / 2, y: 250 }}
      ></EndlessThread>
      <div className="LoginSection">
        <Logo></Logo>
        {loading ? (
          <Spinner></Spinner>
        ) : (
          <a className="LoginButton" onClick={handleLogin}>
            <div id="logo">
              <div className="g-line"></div>
              <span className="red"></span>
              <span className="yellow"></span>
              <span className="green"></span>
              <span className="blue"></span>
            </div>
            Sign in with Google
          </a>
        )}
      </div>
    </div>
  );
};
