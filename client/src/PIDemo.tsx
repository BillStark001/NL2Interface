/* eslint-disable no-underscore-dangle */
/* eslint-disable no-cond-assign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/button-has-type */
/* eslint-disable lines-between-class-members */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
/* eslint-disable prefer-template */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */

import React from "react";
import { PIWorkflow } from 'pi-client';
import { io, Socket } from 'socket.io-client';
import ReactDOM from "react-dom";

const PI_SERVER_ADDR = 'http://localhost:8888/';

export interface PIDemoState {
  log: string,
  generalize: boolean,
}

class PIDemo extends React.Component {

  state: Readonly<PIDemoState>;
  session: string;
  workflow:any;
  socket: Socket;
  divInterface: React.RefObject<HTMLDivElement>;
  divPreview: React.RefObject<HTMLDivElement>;
  inputGeneralize: React.RefObject<HTMLInputElement>;

  constructor(props: any) {
    super(props);
    this.socket = io(PI_SERVER_ADDR);
    /* vl.register(vega, vegaLite, {
      config: {
        axis: {
          titleFontSize: 30,
          labelFontSize: 30
        }
      },
      view: { renderer: "svg" }
    }); */
    this.session = "demo-" + Date.now().toString();
    this.workflow = PIWorkflow(this.socket, this.session, { enableHelp: false });
    this.state = {
      log: "",
      generalize: false,
    }
    this.divInterface = React.createRef();
    this.divPreview = React.createRef();
    this.inputGeneralize = React.createRef();

    this.initSocket();

    this.socket.emit("reset", {"session": this.session});
  }

  handleLogChange = (event: { target: { value: string; }; }): void => {
    this.setState({ log: event.target.value });
  }

  initSocket = (): void => {
    const socket = this.socket;
    socket.on("spec", (spec) => {
      this.resetInterface();
      this.workflow.init(spec, this.divInterface.current!);
    });
    socket.on("preview", ({ preview }) => {
      const div = this.divPreview.current!;
      const regex = /(.*?)~\$(.*?)\$~(.*)/;

      preview.forEach((q: string) => {
        const previewStr: JSX.Element[] = [];
        let m: RegExpExecArray | null;
        let _q: string = q;
        while ((m = regex.exec(q)) != null) {
          m[2] = m[2].replace(/~\$/, "");
          m[2] = m[2].replace(/\$~/, "");
          m[1] = m[1].replace(/~\$/, "");
          m[1] = m[1].replace(/\$~/, "");
          previewStr.push(<>{m[1]}</>);
          previewStr.push(<span style={{backgroundColor: 'yellow'}}>{m[2]}</span>);
          _q = m[3];
        }

        if (_q !== ""){
          previewStr.push(<>{_q.replace(/~\$/, "").replace(/\$~/, "")}</>);
        }
        ReactDOM.render(<p style={{width:'100%'}}>{previewStr}</p>, div);
        console.log(previewStr);
      });
    })
    /*
    socket.on("sql", ({ sql }) => {
      let div = $("#sql").empty();
      let helpDiv = $("#default").empty();
      let regex = /(.*?)~\$(.*?)\$~(.*)/;

      sql.forEach((q) => {
        let stripped_q = q.replaceAll(/~\$/g, "").replaceAll(/\$~/g, "")
        div.append($(`<p style='width:100%'>${stripped_q}</p>`))
        let preview_str = ""
        while ((m = regex.exec(q)) != null) {
          m[2] = m[2].replace(/~\$/, "")
          m[2] = m[2].replace(/\$~/, "")
          m[1] = m[1].replace(/~\$/, "")
          m[1] = m[1].replace(/\$~/, "")
          preview_str += m[1] + "<span style='background-color: yellow;'>" + m[2] + "</span>"
          q = m[3]
        }

        if (q !== "")
          preview_str += q

        preview_str = preview_str.replace(/~\$/, "")
        preview_str = preview_str.replace(/\$~/, "")

        helpDiv.append($(`<p style='width:100%'>${preview_str}</p>`))
      })

      helpDiv.show()
      $("#preview").hide()
    })
    socket.on("log", (qs) => {
      let log = $("#log").empty()
      qs.forEach((q) => {
        log.append($(`<p style='font-size: 12pt; width:100%'>${q}</p>`))
      })
    })
    socket.on("table", ({ rows, columns }) => {
      let table = $("#results").empty();
      let headertr = $("<tr/>")
      table.append(headertr)
      let body = $("<tbody/>")
      table.append(body)
      columns.map((c) =>
        headertr.append($(`<th>${c}</th>`)))
      rows.forEach((row) => {
        let tr = $("<tr/>")
        columns.map((c) =>
          tr.append($(`<td>${row[c]}</td>`))
        )
        body.append(tr)
      })
    })

    */
  }

  // funcs

  resetInterface = (): void => {
    const spec = this.divInterface.current;
    this.workflow.clear();
    while (spec && spec.firstChild) {
      spec.removeChild(spec.firstChild);
    }
  }

  submitQ = (): void => {
    const q = this.state.log;
    const generalize = this.inputGeneralize.current?.checked || false;
    this.socket.emit("generalize", { "payload": generalize, "session": this.session });
    this.socket.emit("runq", { "payload": q, "session": this.session });
  }
  submitLog = (): void => {
    const q = this.state.log;
    this.socket.emit("log", { "payload": q, "session": this.session });
  }

  runpi = (): void => {
    this.resetInterface();
    this.socket.emit("runpi", { "session": this.session });
  }

  render(): JSX.Element {
    return (
      <>
        <div style={{
          textAlign: 'center',
          width: '100%',
          display: 'block',
          fontSize: '20pt',
        }}
        >
          PI-Client
          <button onClick={this.runpi} style={{ fontSize: '14pt' }}>Re-generate Interface</button>
        </div>
        <div className="row" style={{ width: '90%', margin: 'auto', }}>
          <div className="col-md-5" style={{ alignContent: 'flex-start' }}>
            <div className="row" style={{ width: '100%' }}>
              <div className="col-md-12">
                <h3>Submit Queries</h3>

                <textarea
                  id="logarea"
                  className="mousetrap"
                  rows={6}
                  style={{ width: '100%' }}
                  placeholder="Type query"
                  value={this.state.log}
                  onChange={this.handleLogChange}
                ></textarea>

                <input type="button" onClick={this.submitQ} value="submit" style={{ width: '100%' }} />
                <label>
                  <input id="generalize_toggle" ref={this.inputGeneralize} type="checkbox"></input>
                  Generalize
                </label>
              </div>
            </div>
            <div className="row" style={{ width: '100%' }}>
              <div className="col-md-12">
                <h3>Query Log</h3>
                <div id="log" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="row" style={{ width: '100%' }}>
              <div className="col-md-12">
                <h3>Latest Query Results</h3>
                <table id="results" style={{ width: '100%' }}></table>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="row">
              <div className="col-md-12">
                <h3>Interface Queries</h3>
              </div>
              <div className="col-md-12" style={{ alignContent: 'flex-start' }}>
                <div id="sql" style={{ width: '100%' }}></div>
              </div>
              <div className="col-md-12">
                <h3>Interface</h3>
              </div>
              <div className="col-md-12" style={{ alignContent: 'flex-start' }}>
                <div id="interface" ref={this.divInterface} style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

}


export default PIDemo;