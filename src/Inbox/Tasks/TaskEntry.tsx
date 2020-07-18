import React from "react";
import { Task } from "./Task";
import { Markdown } from "../UI/Markdown";
import { Icon, IconType } from "../UI/Icon";

interface Props {
  task: Task;
  lastId: string;
  onUpdate: (task?: Task) => void;
  onChange: () => Promise<void>;
}
interface State {}

interface TaskButtonProps {
  onClick: () => void;
  shortcut: string;
  trigger: string;
  icon: IconType;
}

const TaskButton = (props: TaskButtonProps) => (
  <button
    className="TaskButton"
    onClick={props.onClick}
    data-shortcut={props.shortcut}
    data-trigger={props.trigger}
  >
    <Icon type={props.icon} size={16}></Icon>
  </button>
);

export class TaskEntry extends React.Component<Props, State> {
  async onTaskEdit(event: React.FocusEvent<HTMLDivElement>, task: any) {
    await gapi.client.tasks.tasks.update({
      tasklist: "@default",
      task: task.id,
      resource: {
        ...task,
        title: event.currentTarget.innerText,
      },
    });
    await this.props.onChange();
  }

  onEnter(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  }

  async bumpTask(taskId: string) {
    this.props.onUpdate({ ...this.props.task, position: "0" });
    await gapi.client.tasks.tasks.move({
      task: taskId,
      tasklist: "@default",
    });
    await this.props.onChange();
  }

  async deferTask(taskId: string) {
    this.props.onUpdate({
      ...this.props.task,
      position: "99999999999999999999",
    });

    await gapi.client.tasks.tasks.move({
      task: taskId,
      tasklist: "@default",
      previous: this.props.lastId,
    });
    await this.props.onChange();
  }

  async completeTask(task: any) {
    this.props.onUpdate();
    await gapi.client.tasks.tasks.update({
      tasklist: "@default",
      task: task.id,
      resource: {
        ...task,
        status: "completed",
      },
    });
    await this.props.onChange();
  }

  render() {
    const { task } = this.props;
    return (
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
          <TaskButton
            icon="top"
            shortcut="a"
            trigger="click"
            onClick={() => this.bumpTask(task.id)}
          ></TaskButton>
          <TaskButton
            icon="bottom"
            shortcut="z"
            trigger="click"
            onClick={() => this.deferTask(task.id)}
          ></TaskButton>
          <TaskButton
            icon="check"
            shortcut="d"
            trigger="click"
            onClick={() => this.completeTask(task.id)}
          ></TaskButton>
        </div>
      </div>
    );
  }
}
