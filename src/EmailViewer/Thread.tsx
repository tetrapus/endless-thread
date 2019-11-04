import * as React from "react";
import { oc } from "ts-optchain";
import { Message } from "./Message";
import "./Thread.scss";

interface ThreadProps {
  thread: gapi.client.gmail.Thread;
  labels: gapi.client.gmail.Label[];
}
interface ThreadState {
  subject: string;
  messages: ReadonlyArray<gapi.client.gmail.Message>;
  labels: gapi.client.gmail.Label[];
}

function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

class Thread extends React.Component<ThreadProps, ThreadState> {
  constructor(props: Readonly<ThreadProps>) {
    super(props);
    const thread = this.props.thread;
    console.log(thread);
    if (!thread.messages) {
      return;
    }
    const firstMessage = thread.messages[0];
    const subjectHeader = oc(firstMessage)
      .payload.headers([])
      .find(header => header.name == "Subject");
    const subject = subjectHeader
      ? subjectHeader.value || "Unknown"
      : "Unknown";
    const labels = Array.from(
      new Set(
        ([] as string[]).concat(
          ...thread.messages.map(message => message.labelIds || [])
        )
      )
    );

    this.state = {
      subject,
      messages: thread.messages,
      labels: labels
        .map(name => this.props.labels.find(label => label.id == name))
        .filter(isDefined)
        .filter(label => label.type === "user")
    };
  }

  render() {
    return (
      <div>
        <h1>{this.state.subject}</h1>
        <div>
          {this.state.labels.map(label => (
            <span
              className="Label"
              key={label.id}
              style={this.getLabelStyle(label)}
            >
              {label.name}
            </span>
          ))}
        </div>
        {this.state.messages.map(message => (
          <Message message={message} key={message.id}></Message>
        ))}
      </div>
    );
  }
  getLabelStyle(label: gapi.client.gmail.Label): React.CSSProperties {
    const color = (label as any).color || {
      backgroundColor: "white",
      textColor: "black"
    };
    return {
      backgroundColor: color.backgroundColor,
      color: color.textColor
    };
  }
}

export { Thread };
