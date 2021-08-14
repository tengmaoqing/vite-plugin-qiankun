import React, { lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { Divider } from "antd";
import { qiankunWindow } from "../../../es/helper";

import Home from "./pages/Home";
const About = lazy(() => import("./pages/About"));

const RouteExample = () => {
  return (
    <Router basename={qiankunWindow.__POWERED_BY_QIANKUN__ ? "/viteapp" : "/"}>
      <nav>
        <Link to="/">Home</Link>
        <Divider type="vertical" />
        <Link to="/about">About1</Link>
      </nav>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
        </Switch>
      </Suspense>
    </Router>
  );
};

function App() {
  return (
    <div className="App">
      <RouteExample />
    </div>
  );
}

export default App;
