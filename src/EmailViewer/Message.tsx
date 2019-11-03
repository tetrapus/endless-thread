import * as React from "react";
import { decode } from "../base64util";
import { oc } from "ts-optchain";
import VisibilitySensor from "react-visibility-sensor";
import { Spinner } from "./UI/Spinner";
import './Message.scss';

interface Props {
  message: gapi.client.gmail.Message;
}
interface State {
  expanded?: boolean;
  mounted: boolean;
}

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
    this.state = {
      expanded: undefined,
      mounted: false
    };
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

  componentDidMount() {
    this.setState({mounted: true});
  }

  render() {
    return (
      <div onClick={() => this.renderMessage()}>
        <div className="Snippet">{this.props.message.snippet}</div>
        {this.state.expanded === undefined && this.state.mounted && (
          <VisibilitySensor
            onChange={isVisible => this.handleVisibilityChange(isVisible)}
          >
            <Spinner></Spinner>
          </VisibilitySensor>
        )}
        <div ref={this.renderTarget} className="EmailBody"></div>
      </div>
    );
  }

  handleVisibilityChange(isVisible: boolean) {
    if (isVisible) {
      this.setState({ expanded: true });
      this.renderMessage();
    }
  }

  renderMessage(): void {
    if (!this.renderTarget.current) {
      console.log("Err: unmounted rendertarget");
      return;
    }

    caja.load(this.renderTarget.current, caja.policy.net.ALL, (frame: any) => {
      frame.code(`data:text/html;base64,${this.source}`, "text/html").run();
    });
  }
}

export { Message };
