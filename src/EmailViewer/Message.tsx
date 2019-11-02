import * as React from "react";
import { decode } from "../base64util";
import { oc } from "ts-optchain";

interface Props {
  message: gapi.client.gmail.Message;
}
interface State {}

declare const caja: {
  load: (arg0: Element, arg1: any, arg2: any) => void;
  policy: {
    net: {
      ALL: number;
    };
  };
};

class Message extends React.Component<Props, State> {
  renderTarget: React.RefObject<HTMLDivElement>;
  source: string;

  constructor(props: Readonly<Props>) {
    super(props);
    console.log(props);
    this.renderTarget = React.createRef();
    const parts = oc(props.message).payload.parts([]);
    if (!parts.find(part => part.mimeType == "text/html")) {
      this.source = "";
    } else {
      this.source = decode(
        oc(parts.find(part => part.mimeType == "text/html")).body.data("")
      );
    }
  }
  render() {
    return (
      <div onClick={() => this.renderMessage()}>
        {this.props.message.snippet}
        <div ref={this.renderTarget}></div>
      </div>
    );
  }
  renderMessage(): void {
    if (!this.renderTarget.current) {
      return;
    }
    caja.load(this.renderTarget.current, caja.policy.net.ALL, (frame: any) => {
      frame.code(`data:text/html;base64,${this.source}`, "text/html").run();
    });
  }
}

export { Message };
