import * as React from "react";
import { Navigation } from "./Navigation/Navigation";
import { ThreadList } from "./ThreadList";
import "./EmailViewer.scss";
import { FocusBar } from "./FocusBar";
import { RocketChat } from "./RocketChat/RocketChat";
import { Tasklist } from "./Tasks/Tasklist";
import { Shortcuts } from "./Shortcuts";

interface Props {
  profile: gapi.auth2.BasicProfile;
}
interface State {}

export class EmailViewer extends React.Component<Props, State> {
  render() {
    return (
      <div className="EmailViewer">
        <div className="whitespace"></div>
        <Navigation profile={this.props.profile}></Navigation>
        <FocusBar></FocusBar>
        <Tasklist></Tasklist>
        <div className="PrimaryContent">
          <RocketChat></RocketChat>
          <ThreadList email={this.props.profile.getEmail() || ""}></ThreadList>
        </div>
        <Shortcuts></Shortcuts>
      </div>
    );
  }
}
