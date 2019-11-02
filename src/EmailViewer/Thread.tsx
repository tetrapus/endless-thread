import * as React from "react";
import { oc } from "ts-optchain";
import { Message } from "./Message";

interface ThreadProps {
  thread: gapi.client.gmail.Thread;
}
interface ThreadState {
  subject: string;
  messages: ReadonlyArray<gapi.client.gmail.Message>;
}

class Thread extends React.Component<ThreadProps, ThreadState> {
  constructor(props: Readonly<ThreadProps>) {
    super(props);
    const thread = this.props.thread;
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

    this.state = { subject, messages: thread.messages };
  }

  render() {
    return (
      <div>
        <h1>{this.state.subject}</h1>
        {this.state.messages.map(message => (
          <Message message={message} key={message.id}></Message>
        ))}
      </div>
    );
  }
}

export { Thread };
