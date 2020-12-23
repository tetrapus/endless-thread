import React from "react";
import { Mention } from "../Mention";
import { Markdown } from "../../UI/Markdown";
import { Text } from "../Renderers/Text";
import { RocketAttachment } from "../RocketAttachment";
import { Emoji } from "../Renderers/Emoji";
import ReactTimeago from "react-timeago";
import { RocketChatService } from "../RocketChatService";
import { MessageBox } from "./MessageBox";

interface Props {
  emoji: any;
  message: any;
  previous: any;
  rocketchat: RocketChatService;
  unloadedChildren?: number;
  onExpand: () => void;
  onUpdate: () => void;
  onSubmit: () => void;
}
interface State {
  isActive: bool;
}

export class Message extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isActive: false };
  }

  async sendMessage(roomId: string, text: string) {
    await this.props.rocketchat.call("POST", "chat.postMessage", {
      roomId,
      text,
    });
  }

  snooze(a: any) {}

  render() {
    const message = this.props.message;
    const previous = this.props.previous;
    var content;
    if (message.t === "ul") {
      content = (
        <div className="ChatAction" key={message._id}>
          left the chat
        </div>
      );
    } else if (message.t === "uj") {
      content = (
        <div className="ChatAction" key={message._id}>
          joined
        </div>
      );
    } else if (message.t === "au") {
      content = (
        <div className="ChatAction" key={message._id}>
          invited @{message.msg}
        </div>
      );
    } else if (message.t === "ru") {
      content = (
        <div className="ChatAction" key={message._id}>
          kicked @{message.msg}
        </div>
      );
    } else if (message.t === "subscription-role-added") {
      content = (
        <div className="ChatAction" key={message._id}>
          made @{message.msg} {message.role}
        </div>
      );
    } else if (message.t === "subscription-role-removed") {
      content = (
        <div className="ChatAction" key={message._id}>
          removed @{message.msg} as {message.role}
        </div>
      );
    } else if (message.t === "room_changed_privacy") {
      content = (
        <div className="ChatAction" key={message._id}>
          made the chat a {message.msg}
        </div>
      );
    } else {
      const mentions = message.mentions || [];
      const passiveMention = mentions.find((mention: Mention) =>
        ["here", "channel"].includes(mention._id)
      );
      const activeMention = mentions.find(
        (mention: Mention) =>
          mention.username == this.props.rocketchat.getIdentity().me.username
      );

      const diffs = message.msg.match(/D[0-9]+/g);

      content = (
        <div
          className={`ChatMessage ${
            activeMention
              ? "ActiveMention"
              : passiveMention
              ? "PassiveMention"
              : ""
          } ${message.isContext ? "ContextMessage" : ""}`}
        >
          <div className="ChatMessageContent">
            <Markdown
              source={message.msg}
              renderers={{
                text: ({ value }: { value: string }) => (
                  <Text
                    emoji={this.props.emoji}
                    whoami={this.props.rocketchat.getIdentity()}
                    value={value}
                  ></Text>
                ),
              }}
            ></Markdown>
            {(message.attachments || []).map((attachment, idx: number) => (
              <RocketAttachment
                attachment={attachment}
                key={idx}
              ></RocketAttachment>
            ))}
          </div>
          <div className="MessageTimestamp">
            <span className="MessageActions">
              {false && (
                <span
                  className="Action"
                  onClick={() => this.snooze(message._id)}
                >
                  <Emoji registry={this.props.emoji} text=":zzz:"></Emoji>
                </span>
              )}
              {diffs && (
                <span
                  className="Action"
                  onClick={() =>
                    this.sendMessage(
                      message.rid,
                      `hubot mq submit ${[...new Set(diffs)].join(" ")}`
                    )
                  }
                >
                  <Emoji
                    registry={this.props.emoji}
                    text=":phabdiffclosed:"
                  ></Emoji>
                </span>
              )}
            </span>
            <ReactTimeago date={message.ts}></ReactTimeago>
          </div>
        </div>
      );
    }
    const username = message.u.username;
    return (
      <div>
        <div
          className={`MessageContainer ${message.tmid ? "Child" : ""} `}
          onDoubleClick={() =>
            this.setState({ isActive: !this.state.isActive })
          }
        >
          {!previous || username !== previous.u.username ? (
            <div className="MessageAuthor">
              <span>{message.u.name}</span>
            </div>
          ) : (
            ""
          )}
          {content}
          <div className="ReactionBox">
            <div className="Reactions">
              {Object.entries(
                message.reactions || {}
              ).map(([reaction, reactors]) =>
                reactors.usernames.map(() => (
                  <Emoji registry={this.props.emoji} text={reaction}></Emoji>
                ))
              )}
            </div>
          </div>
          {this.props.unloadedChildren ? (
            <div className="ReplyLoader" onClick={() => this.props.onExpand()}>
              Load{" "}
              {this.props.unloadedChildren == 1
                ? "1 more reply"
                : `${this.props.unloadedChildren} more replies`}
            </div>
          ) : (
            ""
          )}
        </div>
        {this.state.isActive ? (
          <MessageBox
            rocketchat={this.props.rocketchat}
            roomId={this.props.message.rid}
            onUpdate={this.props.onUpdate}
            onSubmit={() => {
              this.setState({ isActive: false });
              this.props.onSubmit();
            }}
            parent={this.props.message._id}
          ></MessageBox>
        ) : null}
      </div>
    );
  }
}
