import React from "react";
import "./Tasklist.scss";
import { Task } from "./Task";
import { TaskEntry } from "./TaskEntry";

interface Props {}
interface State {
  tasks: ReadonlyArray<Task>;
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

  onTaskUpdate(id: string, updatedTask?: Task) {
    if (!updatedTask) {
      this.setState({
        tasks: this.state.tasks.filter((task) => task.id !== id),
      });
    } else {
      this.setState({
        tasks: this.state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      });
    }
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
            data-shortcut="c"
            data-trigger="focus"
          ></div>
          <div className="Tasks">
            {tasks.map((task, idx) => (
              <TaskEntry
                key={task.id}
                task={task}
                position={idx}
                lastId={this.state.tasks[this.state.tasks.length - 1].id}
                onUpdate={(updatedTask?: Task) =>
                  this.onTaskUpdate(task.id, updatedTask)
                }
                onChange={async () => await this.updateTasks()}
              ></TaskEntry>
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

  async onTaskEdit(event: React.FocusEvent<HTMLDivElement>, task: any) {
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
