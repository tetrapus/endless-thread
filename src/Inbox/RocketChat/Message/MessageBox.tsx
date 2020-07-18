import React from "react";
import "./MessageBox.scss";
import { RocketChatService } from "../RocketChatService";

interface Props {
  rocketchat: RocketChatService;
  roomId: string;
  parent?: string;
  onUpdate: () => void;
  onSubmit?: () => void;
}
interface State {}

export class MessageBox extends React.Component<Props, State> {
  async onKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      const message = event.currentTarget.innerText.trim();
      event.currentTarget.innerHTML = "";
      if (this.props.parent && message.match(/^\+:[^ ]+:$/)) {
        await this.props.rocketchat.call("POST", "chat.react", {
            messageId: this.props.parent,
            emoji: message.substr(1)
        });
      } else {
        await this.props.rocketchat.call("POST", "chat.sendMessage", {
            message: {
            rid: this.props.roomId,
            msg: message,
            ...(this.props.parent ? { tmid: this.props.parent } : {}),
            },
        });
        }
      if (this.props.onSubmit) {
        this.props.onSubmit();
      }
      this.props.onUpdate();
    }
  }

  render() {
    return (
      <div
        className={`ChatMessage MessageBox ${this.props.parent ? "Child" : ""}`}
        contentEditable={true}
        onKeyPress={async (event) => await this.onKeyPress(event)}
        onClick={() => this.props.onUpdate()}
        data-shortcut="m"
        data-trigger="focus"
      ></div>
    );
  }
}
