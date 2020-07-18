import * as React from "react";
import "./Navigation.scss";
import { Logo } from "../UI/Logo";
import { Icon } from "../UI/Icon";

type Props = {
  profile: gapi.auth2.BasicProfile;
};

export const Navigation = ({ profile }: Props) => (
  <div className="Navigation">
    <Logo/>
    <div className="Identity">
      <div className="Name">{profile.getName()}</div>
      <div className="Email">{profile.getEmail()}</div>
    </div>
    <img className="Image" src={profile.getImageUrl()}></img>
    <button className="LogOut" onClick={() => gapi.auth2.getAuthInstance().signOut()}>
      <Icon type="close"></Icon>
    </button>
  </div>
);
