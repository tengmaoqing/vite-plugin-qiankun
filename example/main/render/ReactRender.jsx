import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { loadMicroApp } from 'qiankun';

/**
 * 渲染子应用
 */
function Render(props) {
  const { loading } = props;

  const containerRef = useRef(null)
  
  useEffect(() => {
    setTimeout(() => {
      const app = loadMicroApp({
        name: 'viteapp',
        entry: 'http://127.0.0.1:7106',
        container: containerRef.current,
        props: { brand: 'qiankun' },
      });
  
      setTimeout(() => {
        app.update({testprops: 123})
      }, 3000)
    }, 3000)
  }, [])

  return (
    <>
      {loading && <h4 className="subapp-loading">Loading...</h4>}
      <div id="subapp-viewport" />
      <hr />
      <h4>动态viteapp 传输props</h4>
      <div className="viteapp-props" ref={containerRef} />
    </>
  );
}

export default function render({ loading }) {
  const container = document.getElementById('subapp-container');
  ReactDOM.render(<Render loading={loading} />, container);
}
