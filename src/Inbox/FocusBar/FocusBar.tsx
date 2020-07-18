import "./FocusBar.scss";
import ReactTimeAgo from "react-timeago";
import classNames from "classnames";

import React from "react";
import { Icon } from "../UI/Icon";

const Attendee = ({ attendee }) => {
  const statuses = {
    declined: "close",
    accepted: "check",
  };
  console.log(attendee);
  const icon = statuses[attendee.responseStatus] ? (
    <Icon size={12} type={statuses[attendee.responseStatus]}></Icon>
  ) : null;
  return (
    <div>
      {attendee.displayName || attendee.email} {icon}
    </div>
  );
};

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
        console.log(response);
        const events = response.result.items.filter(
          (event) =>
            new Date(event.end.dateTime) > new Date(Date.now() + 60000) &&
            new Date(event.start.dateTime) <
              new Date(Date.now() + 120 * 60 * 60 * 1000) &&
            (!event.attendees ||
              !event.attendees.some(
                (attendee) =>
                  attendee.self && attendee.responseStatus == "declined"
              ))
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
    const topEvent = this.state.nextEvent;

    const isActive =
      topEvent &&
      new Date(topEvent.start.dateTime) < new Date(Date.now() + 120000);

    return (
      <div
        className={classNames({
          FocusBar: true,
          Active: isActive,
          Inactive: !topEvent,
        })}
      >
        <div className="Content">
          <div className="Event">
            {topEvent ? (
              <a
                href={topEvent.hangoutLink}
                target="_blank"
                data-shortcut="j"
                data-trigger="click"
              >
                🗓️ {topEvent.summary}
              </a>
            ) : (
              "☀️ No events today!"
            )}
          </div>
          {topEvent ? (
            <div className="EventTimestamp">
              {isActive ? (
                <span>
                  Ends&nbsp;
                  <ReactTimeAgo date={topEvent.end.dateTime}></ReactTimeAgo>
                </span>
              ) : (
                <span>
                  Starts&nbsp;
                  <ReactTimeAgo date={topEvent.start.dateTime}></ReactTimeAgo>
                </span>
              )}
            </div>
          ) : null}
          {topEvent ? (
            <span className="ActionBar" onClick={() => this.skipEvent()}>
              <Icon type="check" size={16}></Icon>
            </span>
          ) : null}
        </div>
        {topEvent ? (
          <div className="EventDetails">
            <div
              className="EventDescription"
              dangerouslySetInnerHTML={{ __html: topEvent.description }}
            ></div>
            <div className="EventAttendees">
              {topEvent.attendees
                .filter((attendee) => !attendee.self)
                .map((attendee) => (
                  <Attendee attendee={attendee}></Attendee>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
