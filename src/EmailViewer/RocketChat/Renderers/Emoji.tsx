import React from "react";
import { Emojione } from "react-emoji-render";

interface Props {
  text: string;
  registry: { [name: string]: string };
}
interface State {}

export class Emoji extends React.Component<Props, State> {
  constructor(p: Props) {
    super(p);
    this.state = {};
  }

  render() {
    const rawEmoji = this.props.text.substr(1, this.props.text.length - 2);
    if (this.props.registry[rawEmoji]) {
      return (
        <img
          className="CustomEmoji"
          src={`${document.rocketchatServer}/emoji-custom/${rawEmoji}.${this.props.registry[rawEmoji]}`}
        ></img>
      );
    } else {
      return (
        <Emojione className="CustomEmoji" text={this.props.text}></Emojione>
      );
    }
  }
}
