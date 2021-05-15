import "./App.css";
import LightIcon from "@material-ui/icons/Brightness7";
import DarkIcon from "@material-ui/icons/Brightness5";
import ClearIcon from "@material-ui/icons/Clear";
import DeleteIcon from "@material-ui/icons/Delete";
import DoneIcon from "@material-ui/icons/Done";
import {
  createContext,
  createRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, FormControl, Input, InputLabel } from "@material-ui/core";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { v4 } from "uuid";

const domain = "http://localhost:8080";

function AddTask({ onAddTask }) {
  const [inputTask, setInputTask] = useState("");
  const handleChange = (e) => {
    setInputTask(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(inputTask);
    setInputTask("");
  };
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <form className={`add-task ${theme}`} onSubmit={handleSubmit}>
          <FormControl fullWidth={true} className={`add-task-input ${theme}`}>
            <InputLabel htmlFor="task-name">Task name</InputLabel>
            <Input id="task-name" onChange={handleChange} value={inputTask} />
          </FormControl>
          <Button variant="contained" color="primary" type="submit">
            Add task
          </Button>
        </form>
      )}
    </ThemeContext.Consumer>
  );
}

function Header({ title }) {
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <legend>
          <h1 style={theme === "dark" ? { color: "#eee" } : { color: "#000" }}>
            {title || "Default Header"}
          </h1>
        </legend>
      )}
    </ThemeContext.Consumer>
  );
}

function Tools({ toggleTheme }) {
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <div className={`task-tracker-tool ${theme}`}>
          {theme === "light" ? (
            <DarkIcon className="icon" onClick={toggleTheme} />
          ) : (
            <LightIcon className="icon" onClick={toggleTheme} />
          )}
        </div>
      )}
    </ThemeContext.Consumer>
  );
}

const Task = forwardRef(
  ({ task, onToggleTask, onDeleteTask, onAnimate }, ref) => {
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
      <ThemeContext.Consumer>
        {(theme) => (
          <p
            ref={ref}
            className={`task ${completed ? "done" : "ongoing"} ${
              !onAnimate ? "task-default" : ""
            } ${theme}`}
          >
            <span>{task.title}</span>{" "}
            <span className="icon-group">
              <Icon />
              <DeleteIcon
                className={`icon delete-icon ${theme}`}
                onClick={handleDelete}
              />
            </span>
          </p>
        )}
      </ThemeContext.Consumer>
    );
  }
);

function Tasks({ tasks, onToggleTask, onDeleteTask, loaded }) {
  const [created, setCreated] = useState(false);

  const nodeRefs = useRef([]);
  nodeRefs.current = tasks.map((task) => createRef());

  const [onAnimate, setOnAnimate] = useState(false);

  useEffect(() => {
    setOnAnimate(true);
  }, []);

  return (
    <TransitionGroup className="tasks">
      {loaded
        ? tasks.map((task, i) => {
            return (
              <CSSTransition
                in={onAnimate}
                key={task.id}
                timeout={500}
                nodeRef={nodeRefs.current[i]}
                classNames="task-transition"
                unmountOnExit
              >
                <Task
                  ref={nodeRefs.current[i]}
                  task={task}
                  onAnimate={onAnimate}
                  onToggleTask={onToggleTask}
                  onDeleteTask={onDeleteTask}
                />
              </CSSTransition>
            );
          })
        : null}
    </TransitionGroup>
  );
}

const themes = { light: "light", dark: "dark" };
const ThemeContext = createContext(themes.light);

function App() {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState(themes.dark);
  const toggleTheme = () => {
    if (theme === "light") setTheme(themes.dark);
    else setTheme(themes.light);
  };

  // fetch todos from jsonplaceholder
  useEffect(() => {
    async function fetchTasks() {
      const limit = 10;
      const response = await fetch(`${domain}/todos`);
      let tasks = await response.json();
      setTasks(tasks.reverse());
      setLoaded(true);
    }

    fetchTasks();
  }, []);

  // toggle done/ongoing for tasks
  const onToggleTask = (id) => {
    // DB
    const newTask = tasks.find((task) => task.id === id);
    newTask.completed = !newTask.completed;

    fetch(`${domain}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((newTask) => {
        // UI
        const newTasks = tasks.map((task) =>
          task.id === newTask.id ? newTask : task
        );
        setTasks(newTasks);
      });
  };

  // delete task
  const onDeleteTask = (id) => {
    fetch(`${domain}/todos/${id}`, { method: "DELETE" }).then(() => {
      const newTasks = tasks.filter((task) => task.id !== id);
      setTasks(newTasks);
    });
    // UI
  };

  // add task
  const onAddTask = async (taskName) => {
    const newTask = {
      title: taskName,
      completed: false,
    };
    const response = await fetch(`${domain}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    const task = await response.json();
    setTasks([task, ...tasks]);
  };

  return (
    <div className={`app ${theme}`}>
      <ThemeContext.Provider value={theme}>
        <fieldset className="task-tracker">
          <Header title="Task tracker" />
          <Tools toggleTheme={toggleTheme} />
          <AddTask onAddTask={onAddTask} />
          <Tasks
            loaded={loaded}
            tasks={tasks}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        </fieldset>
      </ThemeContext.Provider>
    </div>
  );
}

export default App;
