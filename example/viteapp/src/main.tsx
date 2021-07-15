import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// vite-plugin-qiankun helper
import { renderWithQiankun, qiankunWindow } from "../../../es/helper";

function render(props: any) {
  const { container } = props;
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    container
      ? container.querySelector("#root")
      : document.getElementById("root")
  );
}

renderWithQiankun({
  mount(props) {
    console.log("purehtml mount");
    render(props);
  },
  bootstrap() {
    console.log("bootstrap");
  },
  unmount(props: any) {
    console.log("purehtml unmount");
    const { container } = props;
    const mountRoot = container?.querySelector("#root");
    ReactDOM.unmountComponentAtNode(
      mountRoot || document.querySelector("#root")
    );
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
