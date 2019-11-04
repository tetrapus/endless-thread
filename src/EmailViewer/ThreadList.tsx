import * as React from "react";
import { Thread } from "./Thread";
import "./ThreadList.scss";
import { Spinner } from "./UI/Spinner";

interface Props {
  email?: string;
}

interface State {
  threadsList?: ReadonlyArray<gapi.client.gmail.Thread>;
}

class ThreadList extends React.Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = { threadsList: [] };
    gapi.client
      .load(
        "https://content.googleapis.com/discovery/v1/apis/gmail/v1/rest",
        "1"
      )
      .then(() => this.populateThreadList());
  }

  async populateThreadList() {
    if (!this.props.email) {
      return;
    }
    const email = this.props.email;
    const threadsResponse = await gapi.client.gmail.users.threads.list({
      userId: email,
      maxResults: 10
    });
    // Handle the results here (response.result has the parsed body).
    const batch = gapi.client.newBatch();
    const miniThreads = threadsResponse.result.threads || [];
    miniThreads.forEach(thread => {
      batch.add(
        gapi.client.gmail.users.threads.get({
          id: thread.id || "",
          userId: email
        })
      );
    });
    const threads = await batch;
    this.setState({
      threadsList: Object.values(threads.result).map(response => {
        const details = response.result as gapi.client.gmail.Thread;
        return { ...details };
      })
    });
  }

  render() {
    return (
      <div className="ThreadList">
        {this.state.threadsList && this.state.threadsList.length ? (
          this.state.threadsList.map(thread => (
            <Thread key={thread.id} thread={thread}></Thread>
          ))
        ) : (
          <Spinner></Spinner>
        )}
      </div>
    );
  }
}

export { ThreadList };
