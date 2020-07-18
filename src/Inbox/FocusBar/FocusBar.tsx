import "./FocusBar.scss";
import ReactTimeAgo from "react-timeago";

import React from "react";

interface Props {}
interface State {
  events: ReadonlyArray<gapi.client.calendar.Event>;
  nextEvent?: gapi.client.calendar.Event;
  skipped: ReadonlyArray<string>;
}

export class FocusBar extends React.Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = { events: [], skipped: [] };
  }

  componentDidMount() {
    gapi.client
      .load(
        "https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        "1"
      )
      .then(async () => {
        this.populateCalendar();
      });
  }

  skipEvent() {
    if (this.state.nextEvent) {
      const skipped = [...this.state.skipped, this.state.nextEvent.id];
      const events = this.state.events.filter(
        (event) => !skipped.includes(event.id)
      );
      const nextEvent = events[0];
      this.setState({
        skipped,
        events,
        nextEvent,
      });
    }
  }

  async populateCalendar() {
    return gapi.client.calendar.events
      .list({
        calendarId: "primary",
        orderBy: "startTime",
        singleEvents: true,
        timeMin: this.dateToLocalISO(new Date(Date.now())),
      })
      .then((response) => {
        const events = response.result.items.filter(
          (event) =>
            new Date(event.end.dateTime) > new Date(Date.now() + 60000) &&
            new Date(event.start.dateTime) <
              new Date(Date.now() + 12 * 60 * 60 * 1000)
        );
        this.setState({
          events: events,
          nextEvent: events[0],
        });
        setInterval(() => {
          const events = this.state.events.filter(
            (event) =>
              new Date(event.end.dateTime) > new Date(Date.now() + 60000) &&
              new Date(event.start.dateTime) <
                new Date(Date.now() + 12 * 60 * 60 * 1000)
          );
          this.setState({ events, nextEvent: events[0] });
        }, 30000);
      });
  }

  private dateToLocalISO(date: Date) {
    const off = date.getTimezoneOffset();
    const absoff = Math.abs(off);
    return (
      new Date(date.getTime() - off * 60 * 1000).toISOString().substr(0, 23) +
      (off > 0 ? "-" : "+") +
      (absoff / 60).toFixed(0).padStart(2, "0") +
      ":" +
      (absoff % 60).toString().padStart(2, "0")
    );
  }

  render() {
    if (!this.state.nextEvent) {
      return (
        <div className="FocusBar Inactive">
          <div className="Content">
            <div className="Event">☀️ No events today!</div>
          </div>
        </div>
      );
    }

    const topEvent = this.state.nextEvent;
    if (new Date(topEvent.start.dateTime) < new Date(Date.now() + 120000)) {
      return (
        <div className="FocusBar Active">
          <div className="Content">
            <div className="Event">
              <a
                href={topEvent.hangoutLink}
                target="_blank"
                data-shortcut="j"
                data-trigger="click"
              >
                🗓️ {topEvent.summary}
              </a>
            </div>
            <div className="EventTimestamp">
              <span>Ends&nbsp;</span>
              <ReactTimeAgo date={topEvent.end.dateTime}></ReactTimeAgo>
            </div>
            <span className="ActionBar" onClick={() => this.skipEvent()}>
              ✓
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="FocusBar">
        <div className="Content">
          <div className="Event">
            <a
              href={topEvent.hangoutLink}
              target="_blank"
              data-shortcut="j"
              data-trigger="click"
            >
              🗓️ {topEvent.summary}
            </a>
          </div>
          <div className="EventTimestamp">
            Starts&nbsp;
            <ReactTimeAgo date={topEvent.start.dateTime}></ReactTimeAgo>
          </div>
          <span className="ActionBar" onClick={() => this.skipEvent()}>
            ✓
          </span>
        </div>
      </div>
    );
  }
}
