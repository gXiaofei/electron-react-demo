import React from 'react';
import { Layout } from 'antd';
import { observer } from 'mobx-react';
import store from './store';
import './index.css';
import { ipcRenderer } from "electron";
const { Content } = Layout;

@observer
class Home extends React.Component {


  state = {
    downloadPercent: 0,
    tips: ''
  }
  componentDidMount() {
    store.initValue();

    // ipcRenderer.send("checkForUpdate");


    // ipcRenderer.on("message", (event, text) => {
    //   console.log(arguments);
    //   this.tips = text;
    // });
    // //注意：“downloadProgress”事件可能存在无法触发的问题，只需要限制一下下载网速就好了
    // ipcRenderer.on("downloadProgress", (event, progressObj)=> {
    //     console.log(progressObj);
    //     this.downloadPercent = progressObj.percent || 0;
    // });
    // ipcRenderer.on("isUpdateNow", () => {
    //     ipcRenderer.send("isUpdateNow");
    // });

    ipcRenderer.on('message', (event, {message, data}) => {
      console.log('message:', message);
      console.log('data:', data);
      if(message === 'isUpdateNow'){
        if(confirm('是否现在更新？')){
          ipcRenderer.send('updateNow');
        }
      }
    })
  }



  // import { ipcRenderer } from 'electron';
  //  const { ipcRenderer } = require('electron'); 
  //  export default { 
  //    name: 'my-project1', 
  //  mounted() { 
  //    var _ol = document.getElementById("content"); 
  //    ipcRenderer.on('message',(event,{message,data}) => { 
  //      let _li = document.createElement("li"); 
  //      _li.innerHTML = message + " <br>data:" + JSON.stringify(data) +"<hr>";
  //       _ol.appendChild(_li); if (message === 'isUpdateNow') {
  //          if (confirm('是否现在更新？')) { 
  //            ipcRenderer.send('updateNow'); } } }); 
  //           }, methods: { autoUpdate() { ipcRenderer.send('update'); } } 
  //         };

  autoUpdate = () => {
    ipcRenderer.send('update');
  }
  render() {
    return (
      <Content className="content">
        <div className="formCon">
          <h2>第一页</h2>
          <h2>当前环境：{store.currentEnv}</h2>
          <h2>接口前缀：{store.currentUrlPrefix}</h2>
          <div onClick={this.autoUpdate}>
            更新
          </div>
        </div>
      </Content>
    );
  }
}

export default Home;