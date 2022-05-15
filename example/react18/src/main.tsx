import React from 'react'
import ReactDOM, { Root } from 'react-dom/client'
import App from './App'
import './index.css'
import { renderWithQiankun, qiankunWindow } from "../../../es/helper";

let root: Root;
console.log(React);

function render(props: any) {
  const { container } = props;
  root = ReactDOM.createRoot(container
    ? container.querySelector("#root")
    : document.getElementById("root"))
    
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

renderWithQiankun({
  mount(props) {
    console.log("react18 mount");
    render(props);
  },
  bootstrap() {
    console.log("bootstrap");
  },
  unmount(props: any) {
    console.log("react18 unmount");
    root.unmount();
  },
  update(props: any) {
    console.log("react18 update");
    console.log(props)
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}


