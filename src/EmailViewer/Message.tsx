import * as React from "react";
import VisibilitySensor from "react-visibility-sensor";
import { Spinner } from "./UI/Spinner";
import "./Message.scss";
import { Html5Entities } from "html-entities";
import { HtmlMessage } from "./MessageTypes/HtmlMessage";
import { TextMessage } from "./MessageTypes/TextMessage";
import { decode } from "../base64util";

interface Props {
  message: gapi.client.gmail.Message;
}
interface State {
  expanded?: boolean;
  parts: gapi.client.gmail.MessagePart[];
}

const unfoldParts = (
  part: gapi.client.gmail.MessagePart
): gapi.client.gmail.MessagePart[] => {
  if (part.parts) {
    return ([] as gapi.client.gmail.MessagePart[]).concat(
      ...part.parts.map(part => unfoldParts(part))
    );
  } else {
    return [part];
  }
};

class Message extends React.Component<Props, State> {
  parts: gapi.client.gmail.MessagePart[] = [];

  constructor(props: Readonly<Props>) {
    super(props);
    const part = props.message.payload;

    this.state = {
      expanded: undefined,
      parts: part ? unfoldParts(part) : []
    };
  }

  render() {
    return (
      <div>
        <div className="Snippet">
          {new Html5Entities().decode(this.props.message.snippet || "")}
        </div>
        {this.state.expanded === undefined ? (
          <VisibilitySensor
            onChange={isVisible => this.handleVisibilityChange(isVisible)}
          >
            <Spinner></Spinner>
          </VisibilitySensor>
        ) : (
          (this.state.parts.length == 1
            ? [this.state.parts[0]]
            : this.state.parts.slice(1)
          ).map(part => (
            <div key={part.partId} className="EmailBody">{this.getPartViewer(part)}</div>
          ))
        )}
      </div>
    );
  }

  getPartViewer(part: gapi.client.gmail.MessagePart) {
    if (!part.body || !part.body.data) {
      return;
    }
    const data = decode(part.body.data);
    if (part.mimeType == "text/html") {
      return <HtmlMessage key={part.partId} data={data}></HtmlMessage>;
    } else {
      return <TextMessage key={part.partId} data={data}></TextMessage>;
    }
  }

  handleVisibilityChange(isVisible: boolean) {
    if (isVisible) {
      this.setState({ expanded: true });
    }
  }
}

export { Message };
