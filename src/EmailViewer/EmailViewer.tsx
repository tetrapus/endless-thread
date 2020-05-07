import * as React from "react";
import { Navigation } from "./Navigation/Navigation";
import { ThreadList } from "./ThreadList";
import './EmailViewer.scss';
import { FocusBar } from "./FocusBar";
import { RocketChat } from "./RocketChat/RocketChat";

export const EmailViewer = ({
  profile
}: {
  profile: gapi.auth2.BasicProfile;
}) => (
  <div className="EmailViewer">
    <Navigation profile={profile}></Navigation>
    <FocusBar></FocusBar>
    <RocketChat></RocketChat>
    <ThreadList email={profile.getEmail() || ''}></ThreadList>
  </div>
);
