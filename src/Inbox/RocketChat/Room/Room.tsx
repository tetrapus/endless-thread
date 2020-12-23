import React from "react";
import { Icon } from "../../UI/Icon";
import VisibilitySensor from "react-visibility-sensor";
import { Spinner } from "../../UI/Spinner";
import { Message } from "../Message/Message";
import { RocketChatService } from "../RocketChatService";
import { MessageBox } from "../Message/MessageBox";

interface Props {
  room: any;
  emoji: any;
  updateAll: any;
  rocketchat: RocketChatService;
  pinned: boolean;
  onPin: () => void;
}
interface State {
  context: ReadonlyArray<any>;
  threadContext: ReadonlyArray<any>;
  messages?: ReadonlyArray<any>;
  visible: boolean;
}

const Channel = (room) => {
  let type,
    id,
    prefix = "";
  if (room.t == "c") {
    type = "channel";
    id = room.name;
    prefix = "#";
  } else if (room.t == "p") {
    type = "group";
    id = room.name;
    prefix = "🔒";
  } else {
    type = "direct";
    id = room.rid;
  }
  return (
    <a
      className="RoomName"
      href={`${document.rocketchatServer}/${type}/${id}`}
      target="_blank"
    >
      {prefix}
      {room.fname || "general"}
    </a>
  );
};

export class Room extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      context: [],
      threadContext: [],
      visible: false,
    };
  }

  componentDidMount() {
    setInterval(async () => {
      if (this.state.messages !== undefined) {
        await this.fetchMessages();
      }
    }, 1200000);
  }

  async fetchContext() {
    if (this.state.messages === undefined) {
      return;
    }
    const threads = [
      ...new Set(
        this.state.messages
          .map((message) => message.tmid)
          .filter(
            (tmid) =>
              tmid &&
              ![...this.state.context, ...this.state.messages].find(
                (msg) => msg._id === tmid
              )
          )
      ),
    ];
    threads.forEach((tmid) => {
      this.props.rocketchat
        .call("GET", `chat.getMessage?msgId=${tmid}`)
        .then((response: any) => {
          this.setState({ context: [...this.state.context, response.message] });
        });
    });
  }

  async fetchMessages() {
    const unreadRoom = this.props.room;
    const type = { p: "groups", c: "channels", d: "im" }[unreadRoom.t];
    const response = await this.props.rocketchat.call(
      "GET",
      `${type}.history?roomId=${unreadRoom.rid}&oldest=${unreadRoom.ls}&count=1000`
    );
    this.setState({
      messages: response.messages ? response.messages.reverse() : [],
    });
    if (response.messages && !response.messages.length) {
      await this.markRead();
    }
    await this.fetchContext();
  }

  async markRead() {
    const unreadRoom = this.props.room;
    const messages = this.state.messages;
    const type = { p: "groups", c: "channels", d: "im" }[unreadRoom.t];
    let unreadMessages;
    if (messages?.length) {
      const timestamps = messages.map((msg) => msg._updatedAt);
      timestamps.sort((a, b) => a.localeCompare(b));
      unreadMessages = await this.props.rocketchat.call(
        "GET",
        `${type}.history?roomId=${unreadRoom.rid}&oldest=${
          timestamps[timestamps.length - 1]
        }&count=1000`
      );
    }
    if (unreadMessages === undefined || !unreadMessages.messages.length) {
      await this.props.rocketchat.call("POST", "subscriptions.read", {
        rid: unreadRoom.rid,
      });
    } else {
      await this.fetchMessages();
    }
    await this.props.updateAll();
  }

  async leaveRoom() {
    const room = this.props.room;
    await this.props.rocketchat.call("POST", "rooms.leave", {
      roomId: room.rid,
    });
    await this.fetchMessages();
  }

  render() {
    const { room } = this.props;
    const { messages } = this.state as { messages?: any[] };
    const frequencies: { [key: string]: number } = {};
    (messages || []).forEach((message) => {
      const username = message.u.username;
      frequencies[username] =
        frequencies[username] !== undefined ? 0 : frequencies[username] + 1;
    });
    const participants: string[] = Object.keys(frequencies).sort(
      (a, b) => frequencies[b] - frequencies[a]
    );
    const msgSortKey = (message) => {
      if (message.tmid) {
        const parent = [...this.state.context, ...this.state.messages].find(
          (msg) => msg._id == message.tmid
        );
        if (!parent) {
          return message.ts;
        }
        return `${parent.ts} ${message.ts}`;
      }
      return message.ts;
    };
    if (messages) {
      this.state.context.forEach((cmessage) => {
        if (
          !messages.find((msg) => cmessage._id == msg._id) &&
          messages.find((msg) => msg.tmid == cmessage._id)
        ) {
          messages.push({ ...cmessage, isContext: true });
        }
      });
      this.state.threadContext.forEach((tmessage) => {
        if (
          !messages.find((msg) => tmessage._id == msg._id) &&
          messages.find((msg) => tmessage.tmid == msg._id)
        ) {
          messages.push({ ...tmessage, isContext: true });
        }
      });
      messages.sort((a, b) => msgSortKey(a).localeCompare(msgSortKey(b)));
    }

    return (
      <div className="ChatRoom" key={room.rid}>
        <h3
          className="RoomTitle"
          data-shortcut="n"
          data-trigger="scrollIntoView"
        >
          {Channel(room)}
          <span className="UnreadCount">{messages && messages.length}</span>
          <span className="Participants">
            {false &&
              participants.map((username) => (
                <img
                  key={username}
                  title={`@${username}`}
                  src={`${document.rocketchatServer}/avatar/${username}`}
                  width="16"
                ></img>
              ))}
          </span>
          <span className="ReadButton">
            <span
              onClick={() => this.props.onPin()}
              style={{ paddingTop: 4 }}
              data-shortcut="p"
              data-trigger="click"
            >
              <Icon
                type="pin"
                size={24}
                fill={this.props.pinned ? "#000" : undefined}
              ></Icon>
            </span>
            <span
              onClick={async () => await this.leaveRoom()}
              data-shortcut="x"
              data-trigger="click"
            >
              <Icon type="close"></Icon>
            </span>
            <span
              onClick={async () => await this.markRead()}
              data-shortcut="r"
              data-trigger="click"
            >
              <Icon type="done"></Icon>
            </span>
          </span>
        </h3>
        {messages === undefined ? (
          <VisibilitySensor
            onChange={(visible) => (visible ? this.fetchMessages() : null)}
          >
            <Spinner></Spinner>
          </VisibilitySensor>
        ) : (
          messages.map((message, idx) => (
            <Message
              key={message._id}
              message={message}
              previous={messages[idx - 1]}
              emoji={this.props.emoji}
              rocketchat={this.props.rocketchat}
              unloadedChildren={
                message.tcount
                  ? message.tcount -
                    messages.filter((msg) => msg.tmid == message._id).length
                  : 0
              }
              onExpand={async () => await this.onExpandMessage(message)}
              onUpdate={async () => await this.fetchMessages()}
              onSubmit={() => this.props.onPin()}
            ></Message>
          ))
        )}
        <MessageBox
          rocketchat={this.props.rocketchat}
          roomId={this.props.room.rid}
          onUpdate={async () => await this.fetchMessages()}
          onSubmit={() => this.props.onPin()}
        ></MessageBox>
      </div>
    );
  }
  async onExpandMessage(message: any) {
    const response = await this.props.rocketchat.call(
      "GET",
      `chat.getThreadMessages?tmid=${message._id}`
    );
    this.setState({
      threadContext: [
        ...this.state.threadContext,
        ...response.messages.filter(
          (tMessage) =>
            !(this.state.messages || []).find(
              (message) => message._id === tMessage._id
            )
        ),
      ],
    });
  }
}
