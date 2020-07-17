import React from "react";
import "./Tasklist.scss";
import { Markdown } from "../UI/Markdown";
import { Icon } from "../UI/Icon";

interface Props {}
interface State {
  tasks: ReadonlyArray<any>;
}

export class Tasklist extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { tasks: [] };
  }

  componentDidMount() {
    gapi.client
      .load("https://content.googleapis.com/discovery/v1/apis/tasks/v1/rest")
      .then(() => {
        this.updateTasks();
        setInterval(() => this.updateTasks(), 30000);
      });
  }

  async updateTasks() {
    const tasks = await gapi.client.tasks.tasks.list({
      tasklist: "@default",
      showCompleted: false,
      maxResults: 100,
    });
    console.log(tasks);
    this.setState({
      tasks: tasks.result.items.sort(
        (a, b) => parseInt(a.position) - parseInt(b.position)
      ),
    });
  }

  async bumpTask(taskId: string) {
    this.setState({
      tasks: this.state.tasks.map((task) =>
        task.id == taskId ? { ...task, position: "0" } : task
      ),
    });
    await gapi.client.tasks.tasks.move({
      task: taskId,
      tasklist: "@default",
    });
    await this.updateTasks();
  }

  async deferTask(taskId: string) {
    this.setState({
      tasks: this.state.tasks.map((task) =>
        task.id == taskId ? { ...task, position: "99999999999999999999" } : task
      ),
    });

    await gapi.client.tasks.tasks.move({
      task: taskId,
      tasklist: "@default",
      previous: this.state.tasks[this.state.tasks.length - 1].id,
    });
    await this.updateTasks();
  }

  async completeTask(task: any) {
    this.setState({
      tasks: this.state.tasks.filter((task) => task.id),
    });
    await gapi.client.tasks.tasks.update({
      tasklist: "@default",
      task: task.id,
      resource: {
        ...task,
        status: "completed",
      },
    });
    await this.updateTasks();
  }

  render() {
    const tasks = [...this.state.tasks];
    tasks.sort((a, b) => a.position.localeCompare(b.position));
    return (
      <div className="TasklistContainer">
        <div className="Tasklist">
          <div
            className="Tasklist-heading"
            contentEditable={true}
            onKeyPress={async (event) => await this.onKeyPress(event)}
          ></div>
          <div className="Tasks">
            {tasks.map((task) => (
              <div className="Task">
                <div>
                  <div
                    className="TaskTitle"
                    contentEditable={true}
                    onBlur={async (event) => await this.onTaskEdit(event, task)}
                    onKeyPress={async (event) => await this.onEnter(event)}
                  >
                    {task.title}
                  </div>
                  <div className="TaskDetails">
                    <Markdown source={task.notes || ""}></Markdown>
                    {task.links ? (
                      <div className="TaskLinks">
                        {task.links.map((link) => (
                          <div className="TaskLink">
                            <a href={link.link} target="_blank">
                              {link.description}
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="TaskActions">
                  <button
                    className="TaskButton"
                    onClick={() => this.bumpTask(task.id)}
                    data-shortcut="a"
                    data-trigger="click"
                  >
                    <Icon type="top" size={16}></Icon>
                  </button>
                  <button
                    className="TaskButton"
                    onClick={() => this.deferTask(task.id)}
                    data-shortcut="z"
                    data-trigger="click"
                  >
                    <Icon type="bottom" size={16}></Icon>
                  </button>
                  <button
                    className="TaskButton"
                    onClick={() => this.completeTask(task)}
                    data-shortcut="d"
                    data-trigger="click"
                  >
                    <Icon type="check" size={16}></Icon>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  async onKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      const value = event.currentTarget.innerText;
      event.currentTarget.innerText = "";
      event.currentTarget.blur();
      const newTask = await gapi.client.tasks.tasks.insert({
        tasklist: "@default",
        resource: {
          title: value,
        },
      });
      await this.updateTasks();
    }
  }
  onEnter(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  }

  async onTaskEdit(event: React.FocusEvent<HTMLDivElement>, task: any): void {
    await gapi.client.tasks.tasks.update({
      tasklist: "@default",
      task: task.id,
      resource: {
        ...task,
        title: event.currentTarget.innerText,
      },
    });
    await this.updateTasks();
  }
}
