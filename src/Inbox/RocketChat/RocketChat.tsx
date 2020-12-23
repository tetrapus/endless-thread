import "./RocketChat.scss";
import React from "react";
import { Room } from "./Room/Room";
import { RocketChatService } from "./RocketChatService";

interface GreasyDocument extends Document {
  rocketchatServer?: string;
  rocketchatCorsBypass?: (options: {
    method: string;
    url: string;
    headers?: { [header: string]: string };
    data?: string;
    onload: (r: Response) => void;
  }) => void;
  rocket?: (method: string, endpoint: string, data?: any) => Promise<any>;
}

declare var document: GreasyDocument;

interface Props {}
interface State {
  unreads: ReadonlyArray<any>;
  pinned: ReadonlyArray<string>;
  emoji: { [name: string]: string };
  rocketchat: RocketChatService;
  subscriptions: ReadonlyArray<any>;
}

export class RocketChat extends React.Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      unreads: [],
      emoji: {},
      rocketchat: new RocketChatService(),
      pinned: [],
      subscriptions: [],
    };
  }

  async componentDidMount() {
    if (document.rocketchatCorsBypass) {
      await this.state.rocketchat.login();
      this.updateAll();
      setInterval(() => this.updateAll(), 30000);
      const response = await this.state.rocketchat.call(
        "GET",
        "emoji-custom.list"
      );
      this.setState({
        emoji: Object.assign(
          {},
          ...response.emojis.update.map((emoji) => ({
            [emoji.name]: emoji.extension,
          }))
        ),
      });
    }
  }

  async updateAll() {
    const response = (await this.state.rocketchat.call(
      "GET",
      "subscriptions.get"
    )) as any;
    console.log(response);
    const unreads = response.update.filter(
      (x) =>
        this.state.pinned.find((roomId) => roomId == x._id) ||
        (new Date(x.ls) < new Date(x._updatedAt) - 1000 && !x.archived)
    );
    const updated = unreads.map((unread) => {
      const old = this.state.unreads.find((room) => unread._id === room._id);
      if (old === undefined) {
        return unread;
      } else if (old._updatedAt === unread._updatedAt) {
        return old;
      } else {
        return unread;
      }
    });
    updated.sort((a, b) => new Date(a.ls) - new Date(b.ls));
    this.setState({
      unreads: updated,
      subscriptions: response.update,
    });
  }

  onPinRoom(roomId: string) {
    if (!this.state.pinned.includes(roomId)) {
      this.setState({ pinned: [...this.state.pinned, roomId] });
    } else {
      this.setState({
        pinned: this.state.pinned.filter((pin) => pin != roomId),
      });
    }
  }

  render() {
    return (
      <div className="RocketContainer">
        <input
          placeholder="Open chat"
          style={{ marginTop: 16 }}
          onKeyPress={(e) => {
            if (e.key == "Enter") {
              const value = this.state.subscriptions.find(
                (sub) => sub.name === e.currentTarget.value
              );
              if (value) {
                this.setState({
                  pinned: [...this.state.pinned, value._id],
                  unreads: [...this.state.unreads, value],
                });
              }
              e.currentTarget.value = "";
            }
          }}
        ></input>
        {this.state.unreads.map((room) => (
          <Room
            key={room._id}
            room={room}
            rocketchat={this.state.rocketchat}
            updateAll={() => this.updateAll()}
            emoji={this.state.emoji}
            pinned={this.state.pinned.includes(room._id)}
            onPin={() => this.onPinRoom(room._id)}
          ></Room>
        ))}
      </div>
    );
  }
}
