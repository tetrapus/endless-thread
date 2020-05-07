import "./RocketChat.scss";
import React from "react";
import { RocketAttachment } from "./RocketAttachment";
import { Markdown } from "./Markdown";
import ReactTimeago from "react-timeago";
import { Emojione } from "react-emoji-render";

interface Props {}
interface State {
  credentials?: {
    authToken: string;
    userId: string;
  };
  unreads: { [name: string]: { room: any; messages: ReadonlyArray<any> } };
  emoji: { [name: string]: string };
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
    prefix = "#";
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
      {room.fname}
    </a>
  );
};

export class RocketChat extends React.Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = { unreads: {} };
  }

  componentDidMount() {
    if (document.rocketchatCorsBypass) {
      document.rocket = (a, b, c) => this.callApi(a, b, c);
      this.login();
    }
  }

  login() {
    const authResponse = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse(true);

    this.callApi("POST", "login", {
      serviceName: "google",
      accessToken: authResponse.access_token,
      idToken: authResponse.id_token,
      expiresIn: authResponse.expires_in,
    }).then((r) => {
      this.setState({
        info: JSON.stringify(r),
        credentials: (({ userId, authToken }) => ({ userId, authToken }))(
          r.data
        ),
      });
      this.updateAll();
      setInterval(() => this.updateAll(), 30000);
      this.callApi("GET", "emoji-custom.list").then((response) => {
        this.setState({
          emoji: Object.assign(
            {},
            ...response.emojis.update.map((emoji) => ({
              [emoji.name]: emoji.extension,
            }))
          ),
        });
      });
    });
  }

  async updateAll() {
    const response = await this.callApi("GET", "subscriptions.get");
    const unreads = response.update.filter(
      (x) => new Date(x.ls) < new Date(x._updatedAt) - 1000 && !x.archived
    );
    Object.keys(this.state.unreads).forEach((room) => {
      if (!unreads.find((unread) => unread.fname === room)) {
        const { ...newUnreads } = this.state.unreads;
        delete newUnreads[room];
        this.setState({ unreads: newUnreads });
      }
    });
    unreads.forEach((unreadRoom) => {
      const existingRoom = this.state.unreads[unreadRoom.fname];
      if (
        existingRoom &&
        unreadRoom._updatedAt === existingRoom.room._updatedAt
      ) {
        return;
      }
      console.log(unreadRoom);
      const type = { p: "groups", c: "channels", d: "im" }[unreadRoom.t];
      this.callApi(
        "GET",
        `${type}.history?roomId=${unreadRoom.rid}&oldest=${unreadRoom.ls}&count=1000`
      ).then((response) => {
        console.log(response);
        this.setState({
          unreads: {
            ...this.state.unreads,
            [unreadRoom.fname]: {
              messages: response.messages.reverse(),
              room: unreadRoom,
            },
          },
        });
      });
    });
  }

  async markRead(rid: string) {
    await this.callApi("POST", "subscriptions.read", { rid });
    this.updateAll();
  }

  callApi(method: string, endpoint: string, data?: any): Promise<any> {
    const credentials = this.state.credentials;
    return new Promise((resolve) =>
      document.rocketchatCorsBypass({
        method,
        url: `${document.rocketchatServer}/api/v1/${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          ...(credentials
            ? {
                "X-Auth-Token": credentials.authToken,
                "X-User-Id": credentials.userId,
              }
            : {}),
        },
        data: data ? JSON.stringify(data) : undefined,
        onload: (r: any) => {
          console.log(r.responseText);
          resolve(JSON.parse(r.responseText));
        },
      })
    );
  }

  emoji(text: string) {
    const rawEmoji = text.substr(1, text.length - 2);
    console.log(rawEmoji, this.state.emoji);
    if (this.state.emoji[rawEmoji]) {
      return (
        <img
          className="CustomEmoji"
          key={text}
          src={`${document.rocketchatServer}/emoji-custom/${rawEmoji}.${this.state.emoji[rawEmoji]}`}
        ></img>
      );
    } else {
      return <Emojione key={text} text={text}></Emojione>;
    }
  }

  renderMessage(message: any, previous: any) {
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
    } else {
      content = (
        <div className="ChatMessage" key={message._id}>
          <div className="ChatMessageContent">
            <Markdown source={message.msg}></Markdown>
            {(message.attachments || []).map((attachment, idx) => (
              <RocketAttachment
                attachment={attachment}
                key={idx}
              ></RocketAttachment>
            ))}
          </div>
          <div className="MessageTimestamp">
            <ReactTimeago date={message.ts}></ReactTimeago>
          </div>
        </div>
      );
    }
    return (
      <div className="MessageContainer">
        {!previous || message.u.username !== previous.u.username ? (
          <div className="MessageAuthor">@{message.u.username}</div>
        ) : (
          ""
        )}
        {content}
        <div className="ReactionBox">
          {Object.keys(message.reactions || {}).map((reaction) =>
            this.emoji(reaction)
          )}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="RocketContainer">
        {Object.entries(this.state.unreads)
          .filter(([room, details]) => details.messages.length > 0)
          .map(([room, details]) => (
            <div className="ChatRoom" key={details.room.rid}>
              <h3 className="RoomTitle">
                {Channel(details.room)}
                <button
                  className="ReadButton"
                  onClick={() => this.markRead(details.room.rid)}
                >
                  Mark Read
                </button>
              </h3>
              {details.messages.map((message, idx) =>
                this.renderMessage(message, details.messages[idx - 1])
              )}
            </div>
          ))}
      </div>
    );
  }
}
