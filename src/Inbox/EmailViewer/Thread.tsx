import * as React from "react";
import { oc } from "ts-optchain";
import { Message } from "./Message";
import "./Thread.scss";
import { Icon } from "../UI/Icon";
import { Spinner } from "../UI/Spinner";
import VisibilitySensor from "react-visibility-sensor";
import { definitely, isDefined } from "../../helpers";

interface ThreadProps {
  thread: gapi.client.gmail.Thread;
  labels: ReadonlyArray<gapi.client.gmail.Label>;
  email: string;
}
interface ThreadState {
  thread: gapi.client.gmail.Thread;
  loading: boolean;
  attachments?: gapi.client.gmail.MessagePartBody[];
}

const getAttatchmentIds = (part: gapi.client.gmail.MessagePart): string[] => {
  if (part.parts) {
    return ([] as string[]).concat(...part.parts.map(getAttatchmentIds));
  }
  if (!part.body) {
    return [];
  }
  return part.body.attachmentId ? [part.body.attachmentId] : [];
};

const downloadAttachments = async (
  email: string,
  thread: gapi.client.gmail.Thread
): Promise<gapi.client.gmail.MessagePartBody[]> => {
  const ids = ([] as [string, string][]).concat(
    ...definitely(thread.messages).map((message) =>
      getAttatchmentIds(definitely(message.payload)).map(
        (id) => [id, definitely(message.id)] as [string, string]
      )
    )
  );

  if (!ids.length) {
    return [];
  }

  const batch = gapi.client.newBatch();
  ids.forEach(([id, messageId]: [string, string]) => {
    batch.add(
      gapi.client.gmail.users.messages.attachments.get({
        id: id,
        userId: email,
        messageId: messageId,
      })
    );
  });
  const response = await batch;
  return Object.values(response.result).map(
    (response, idx) =>
      ({
        ...response.result,
        attachmentId: ids[idx][0],
      } as gapi.client.gmail.MessagePartBody)
  );
};

class Thread extends React.Component<ThreadProps, ThreadState> {
  elementRef: React.RefObject<HTMLDivElement>;
  constructor(props: Readonly<ThreadProps>) {
    super(props);
    const thread = this.props.thread;
    if (!thread.messages) {
      throw Error("Cannot create thread with no messages.");
    }

    this.state = {
      thread: thread,
      loading: true,
    };

    this.elementRef = React.createRef();
  }

  render() {
    const thread = this.state.thread;
    if (!thread.messages) {
      throw Error(":(");
    }

    const firstMessage = thread.messages[0];
    const subjectHeader = oc(firstMessage)
      .payload.headers([])
      .find((header) => header.name == "Subject");
    const subject = subjectHeader
      ? subjectHeader.value || "Unknown"
      : "Unknown";

    const labelNames = Array.from(
      new Set(
        ([] as string[]).concat(
          ...thread.messages.map((message) => message.labelIds || [])
        )
      )
    );

    const labels = labelNames
      .map((name) => this.props.labels.find((label) => label.id == name))
      .filter(isDefined)
      .filter((label) => label.type === "user");

    const unread = !!labelNames.find((name) => name == "UNREAD");

    return (
      <div className="ThreadContainer" ref={this.elementRef}>
        <div className="ThreadContent">
          <div className="ThreadInfo">
            <h1 className="Subject">
              <a
                href={`https://mail.google.com/mail/u/0/#inbox/${thread.id}`}
                target="_blank"
              >
                {subject}
              </a>
            </h1>
            <div
              className={"Chevron " + (unread ? "collapsed" : "expanded")}
              onClick={() => this.handleChevronClick(unread)}
              data-shortcut="r"
              data-trigger="click"
            >
              <Icon type="collapse" size={32}></Icon>
            </div>
          </div>
          <div className="LabelList">
            {labels.map((label) => (
              <span
                className="Label"
                key={label.id}
                style={this.getLabelStyle(label)}
              >
                {label.name}
              </span>
            ))}
          </div>
          {this.state.loading ? (
            <VisibilitySensor onChange={(visible) => this.loadThread(visible)}>
              <Spinner></Spinner>
            </VisibilitySensor>
          ) : (
            thread.messages.map((message, idx, all) =>
              this.getMessage(message, idx, all)
            )
          )}
        </div>
      </div>
    );
  }
  getMessage(
    message: gapi.client.gmail.Message,
    idx: number,
    all: gapi.client.gmail.Message[]
  ) {
    const isUnread = (message: gapi.client.gmail.Message) =>
      definitely(message.labelIds).includes("UNREAD");

    return (
      <Message
        message={message}
        key={message.id}
        email={this.props.email}
        attachments={definitely(this.state.attachments)}
        previous={all[idx - 1]}
      ></Message>
    );
  }

  loadThread(visible: boolean) {
    // FIXME: race condition here!!!!
    if (visible && this.state.loading) {
      this.fetchAttachments(this.state.thread).then(
        ({ thread, attachments }) => {
          this.setState({ loading: false, thread, attachments });
        }
      );
    }
  }

  async fetchAttachments(thread: gapi.client.gmail.Thread) {
    const attachments = await downloadAttachments(this.props.email, thread);

    const walkParts = (
      part: gapi.client.gmail.MessagePart
    ): gapi.client.gmail.MessagePart => {
      return {
        ...part,
        body:
          attachments.find(
            (attachment) =>
              attachment.attachmentId === definitely(part.body).attachmentId
          ) || part.body,
        parts: part.parts ? part.parts.map(walkParts) : undefined,
      };
    };

    return {
      thread: {
        ...thread,
        messages: [
          ...definitely(thread.messages).map((message) => ({
            ...message,
            payload: walkParts(definitely(message.payload)),
          })),
        ],
      },
      attachments,
    };
  }

  handleChevronClick(unread: boolean): void {
    if (!this.props.thread.id) {
      return;
    }
    const resource = unread
      ? { removeLabelIds: ["UNREAD"] }
      : { addLabelIds: ["UNREAD"] };
    gapi.client.gmail.users.threads
      .modify({
        userId: this.props.email,
        id: this.props.thread.id,
        resource: resource,
      })
      .then((response) => {
        if (!this.state.thread.messages) {
          return;
        }
        const updates = response.result.messages || [];
        this.setState({
          thread: {
            ...this.state.thread,
            messages: this.state.thread.messages.map((message) => ({
              ...message,
              ...(updates.find((update) => update.id == message.id) || {}),
            })),
          },
        });
        if (!this.elementRef.current) {
          return;
        }
        window.scrollTo({
          top:
            this.elementRef.current.offsetTop +
            this.elementRef.current.offsetHeight -
            64,
          behavior: "smooth",
        });
      });
  }
  getLabelStyle(label: gapi.client.gmail.Label): React.CSSProperties {
    const color = (label as any).color || {
      backgroundColor: "white",
      textColor: "black",
    };
    return {
      backgroundColor: color.backgroundColor,
      color: color.textColor,
    };
  }
}

export { Thread };
