import * as React from "react";
import { Navigation } from "./Navigation/Navigation";
import { ThreadList } from "./ThreadList";
import './EmailViewer.scss';

export const EmailViewer = ({
  profile
}: {
  profile: gapi.auth2.BasicProfile;
}) => (
  <div className="EmailViewer">
    <Navigation profile={profile}></Navigation>
    <ThreadList email={profile.getEmail() || ''}></ThreadList>
  </div>
);
