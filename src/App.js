import "./App.css";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";
import DoneIcon from "@material-ui/icons/Done";
import { useEffect, useState } from "react";

function Header({ title }) {
  return (
    <legend>
      <h1>{title || "Default Header"}</h1>
    </legend>
  );
}

function Task({ task, onToggleTask, onDeleteTask }) {
  const { completed } = task;

  const handleClick = () => {
    onToggleTask(task.id);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
  };

  const Icon = () =>
    completed ? (
      <DoneIcon className="icon" onClick={handleClick} />
    ) : (
      <ClearIcon className="icon" onClick={handleClick} />
    );
  return (
    <p
      className={`task ${completed ? "done" : "ongoing"}`}
      onDoubleClick={handleClick}
    >
      <span>{task.title}</span>{" "}
      <span className="icon-group">
        <Icon />
        <DeleteIcon className="icon delete-icon" onClick={handleDelete} />
      </span>
    </p>
  );
}

function Tasks({ tasks, onToggleTask, onDeleteTask }) {
  const renderTasks = () => {
    return tasks.map((task) => (
      <Task
        task={task}
        key={task.id}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
      />
    ));
  };
  return <div className="tasks">{renderTasks()}</div>;
}

function App() {
  const [tasks, setTasks] = useState([]);

  // componentDidMount() {}
  useEffect(() => {
    async function fetchData() {
      const limit = 10;
      let data = await fetch(
        `https://jsonplaceholder.typicode.com/todos?_limit=${limit}`
      );
      data = await data.json();
      setTasks(data);
    }
    fetchData();
  }, []);

  const onToggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const onDeleteTask = (id) => {
    setTasks(tasks.filter((task) => (task.id === id ? false : true)));
  };

  return (
    <div className="app-light">
      <fieldset className="task-tracker">
        <Header title="Task tracker" />
        <Tasks
          tasks={tasks}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />
      </fieldset>
    </div>
  );
}

export default App;
