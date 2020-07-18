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
  unreads: { [name: string]: any };
  emoji: { [name: string]: string };
  subscriptions?: ReadonlyArray<any>;
  rocketchat: RocketChatService;
}

export class RocketChat extends React.Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      unreads: {},
      emoji: {},
      rocketchat: new RocketChatService(),
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
    const response = await this.state.rocketchat.call(
      "GET",
      "subscriptions.get"
    );
    const unreads = response.update.filter(
      (x) => new Date(x.ls) < new Date(x._updatedAt) - 1000 && !x.archived
    );
    const updated = unreads.map((unread) => {
      const old = this.state.unreads[unread.fname];
      if (old === undefined) {
        return unread;
      } else if (old._updatedAt === unread._updatedAt) {
        return old;
      } else {
        return unread;
      }
    });
    this.setState({
      unreads: Object.assign(
        {},
        ...updated.map((unreadRoom) => ({
          [unreadRoom.fname]: unreadRoom,
        }))
      ),
    });
  }

  render() {
    return (
      <div className="RocketContainer">
        {Object.keys(this.state.unreads).map((name) => (
          <Room
            key={name}
            room={this.state.unreads[name]}
            rocketchat={this.state.rocketchat}
            updateAll={() => this.updateAll()}
            emoji={this.state.emoji}
          ></Room>
        ))}
      </div>
    );
  }
}
