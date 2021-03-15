import * as React from "react";
import VisibilitySensor from "react-visibility-sensor";
import { Spinner } from "../UI/Spinner";
import "./Message.scss";
import { Html5Entities } from "html-entities";
import { HtmlMessage } from "./MessageTypes/HtmlMessage";
import { TextMessage } from "./MessageTypes/TextMessage";
import { oc } from "ts-optchain";
import { encode, decode } from "urlsafe-base64";
import { definitely, isDefined, getValueByName } from "../../helpers";
import ReactTimeAgo from "react-timeago";

import gmail from "gapi.client.gmail";

interface Props {
  message: gmail.Message;
  email: string;
  attachments: gmail.MessagePartBody[];
  previous?: gmail.Message;
}

interface State {
  expanded?: boolean;
}

const unfoldParts = (part: gmail.MessagePart): gmail.MessagePart[] => {
  const supportedTypes = [
    "multipart/alternative",
    "multipart/related",
    "text/plain",
    "text/html",
  ];

  if (part.mimeType == "multipart/alternative" && part.parts) {
    const supported = part.parts.filter((part) =>
      supportedTypes.includes(part.mimeType || "")
    );
    return supported ? unfoldParts(supported[supported.length - 1]) : [];
  } else if (part.mimeType == "multipart/related" && part.parts) {
    const newParts = part.parts.flatMap(unfoldParts);
    const main = definitely(newParts[0]);
    const data = decode(definitely(definitely(main.body).data))
      .toString("utf8")
      .replace(/cid:/g, "https://attachments/");
    return [
      {
        ...main,
        body: {
          ...main.body,
          data: encode(Buffer.from(data, "utf8")),
        },
      },
      ...newParts.slice(1),
    ];
  } else if (part.mimeType == "multipart/mixed" && part.parts) {
    return ([] as gmail.MessagePart[]).concat(...part.parts.map(unfoldParts));
  } else {
    return [part];
  }
};

class Message extends React.Component<Props, State> {
  parts: gmail.MessagePart[] = [];

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      expanded: undefined,
    };
  }

  render() {
    const part = this.props.message.payload;

    const parts = part ? unfoldParts(part) : [];

    const isUnread = oc(this)
      .props.message.labelIds([])
      .includes("UNREAD");
    const fromHeader = oc(this)
      .props.message.payload.headers([])
      .find((header: { name: string }) => header.name == "From");

    return (
      <div className={this.props.previous === undefined ? "First" : "NotFirst"}>
        {isUnread || (
          <div>
            {this.getSenderComponent(fromHeader, true)}
            <div className="Snippet">
              <div className="Timestamp SnippetFade">
                <ReactTimeAgo
                  date={parseInt(definitely(this.props.message.internalDate))}
                ></ReactTimeAgo>
              </div>
              {new Html5Entities().decode(this.props.message.snippet || "")}
            </div>
          </div>
        )}
        {isUnread &&
          (this.state.expanded === undefined ? (
            <VisibilitySensor
              onChange={(isVisible) => this.handleVisibilityChange(isVisible)}
            >
              <Spinner></Spinner>
            </VisibilitySensor>
          ) : (
            <div>
              {this.getSenderComponent(fromHeader, false)}
              <div key={parts[0].partId} className="EmailBody">
                <div className="Timestamp">
                  <ReactTimeAgo
                    date={parseInt(definitely(this.props.message.internalDate))}
                  ></ReactTimeAgo>
                </div>
                {this.getPartViewer(parts[0], parts.slice(1))}
              </div>
            </div>
          ))}
      </div>
    );
  }
  getSenderComponent(
    fromHeader?: gmail.MessagePartHeader,
    condensed?: boolean
  ): React.ReactNode | undefined {
    if (!fromHeader) {
      return;
    }

    if (this.props.previous) {
      const prevHeaders = oc(this).props.previous.payload.headers([]);
      if (prevHeaders) {
        const prevFrom = getValueByName(prevHeaders, "From");
        if (prevFrom === fromHeader.value) {
          return;
        }
      }
    }

    const parsed = /^(.*) <(.*)@(.*)>$/.exec(definitely(fromHeader.value));
    if (parsed) {
      const [_, sender, address, domain] = parsed;
      return (
        <div className="SenderContainer">
          <div className="Sender">
            <div>{sender}</div>
            {condensed || (
              <div className="EmailAddress">
                {address}
                <wbr />@{domain}
              </div>
            )}
          </div>
        </div>
      );
    }
    return;
  }

  getVisibleParts(parts: ReadonlyArray<gmail.MessagePart>) {
    if (parts.length == 1) {
      return [parts[0]];
    } else {
      return parts.filter((part) => part.mimeType != "text/plain");
    }
  }

  getPartViewer(part: gmail.MessagePart, attachments: gmail.MessagePart[]) {
    if (!part.body || !part.body.data) {
      return;
    }
    const data = decode(part.body.data).toString("utf8");
    if (part.mimeType == "text/html") {
      const attachmentMap = Object.fromEntries(
        attachments
          .map((attachment) => {
            const idHeader = definitely(attachment.headers).find(
              (header) => header.name == "Content-ID"
            );
            return idHeader
              ? [definitely(idHeader.value).slice(1, -1), attachment]
              : undefined;
          })
          .filter(isDefined)
      );
      return (
        <HtmlMessage
          key={part.partId}
          data={data}
          attachments={attachmentMap}
        ></HtmlMessage>
      );
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
