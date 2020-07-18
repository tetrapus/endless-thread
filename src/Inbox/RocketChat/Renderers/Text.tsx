import React from 'react';
import { Emoji } from './Emoji';

interface State {}
interface Props {
    value: string;
    emoji: { [name: string]: string };
    whoami: any;
}

export class Text extends React.Component<Props, State> {
    constructor(p: Props) {
        super(p);
        this.state = {};
    }

  render() {
    const tokens = this.props.value.split(/(:[^ ]+:)|(@[^ ]+)/);
    return tokens
      .filter((a) => a)
      .map((token) => {
        if (token.match(/^:[^ ]+:$/)) {
          return <Emoji registry={this.props.emoji} text={token}></Emoji>;
        } else if (token.match(/^@[^ ]+$/)) {
          const classes = ["Highlight"];
          if (["@here", "@channel"].includes(token)) {
            classes.push("Highlight--passive");
          } else if (token == "@" + this.props.whoami.me.username) {
            classes.push("Highlight--active");
          }
          return <span className={classes.join(" ")}>{token}</span>;
        }
        return token;
      });
  }
}
