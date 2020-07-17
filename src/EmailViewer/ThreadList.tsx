import * as React from "react";
import { Thread } from "./Thread";
import "./ThreadList.scss";
import { Spinner } from "./UI/Spinner";
import { definitely } from "../helpers";

interface Props {
  email: string;
}

interface State {
  threadsList?: ReadonlyArray<gapi.client.gmail.Thread>;
  labels: ReadonlyArray<gapi.client.gmail.Label>;
  unreadCount?: number;
}

class ThreadList extends React.Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = { labels: [] };
  }

  componentDidMount() {
    gapi.client
      .load(
        "https://content.googleapis.com/discovery/v1/apis/gmail/v1/rest",
        "1"
      )
      .then(async () => {
        this.populateLabels();
        this.populateThreadList();
        this.populateUnreadCount();
      });
  }

  async populateUnreadCount() {
    return gapi.client.gmail.users.labels
      .get({
        userId: "me",
        id: "INBOX",
      })
      .then((response) => {
        this.setState({ unreadCount: response.result.threadsUnread });
      });
  }

  async populateLabels() {
    if (!this.props.email) {
      return;
    }
    return gapi.client.gmail.users.labels
      .list({
        userId: this.props.email,
      })
      .then((response) => {
        this.setState({ labels: response.result.labels || [] });
      });
  }

  async populateThreadList() {
    const email = this.props.email;
    const threadsResponse = await gapi.client.gmail.users.threads.list({
      userId: email,
      maxResults: 10,
      labelIds: "UNREAD",
    });
    // Handle the results here (response.result has the parsed body).
    const batch = gapi.client.newBatch();
    const miniThreads = threadsResponse.result.threads || [];
    if (!miniThreads.length) {
      this.setState({
        threadsList: []
      });
      return;
    }

    miniThreads.forEach((thread) => {
      batch.add(
        gapi.client.gmail.users.threads.get({
          id: thread.id || "",
          userId: email,
        })
      );
    });
    const threads = await batch;
    // Walk all the threads and grab each attachment ID

    this.setState({
      threadsList: Object.values(threads.result)
        .map((response) => {
          const details = response.result as gapi.client.gmail.Thread;
          return { ...details };
        })
        .sort(
          (a, b) =>
            parseInt(definitely(b.historyId)) -
            parseInt(definitely(a.historyId))
        ),
    });
  }

  render() {
    return (
      <div className="ThreadList">
        {this.state.threadsList !== undefined ? (
          this.state.threadsList.map((thread) => (
            <Thread
              key={thread.id}
              thread={thread}
              labels={this.state.labels}
              email={this.props.email}
            ></Thread>
          ))
        ) : (
          <Spinner></Spinner>
        )}
        <button
          className="ReloadButton"
          onClick={() => {
            this.populateThreadList();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          data-shortcut="t"
          data-trigger="click"
        >
          Reload
        </button>
      </div>
    );
  }
}

export { ThreadList };
