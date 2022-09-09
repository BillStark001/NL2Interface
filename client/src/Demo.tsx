/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */


import React from 'react';
import ReactDataGrid from 'react-data-grid';
import 'react-data-grid/dist/react-data-grid.css';
import { TextField, Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SendIcon from '@material-ui/icons/Send';
import EditIcon from '@material-ui/icons/Edit';
import Dropzone from 'react-dropzone';
import {parse} from 'csv-parse/lib/sync';
import SyntaxHighlighter from 'react-syntax-highlighter';
import sqlFormatter from 'sql-formatter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  AiOutlineNumber,
  AiOutlineTable,
  AiOutlineQuestion,
} from 'react-icons/ai';
import { MdTextFormat } from 'react-icons/md';
import axios from 'axios';
import * as XLSX from 'xlsx';
import EditSchemaModal from './EditSchemaModal';
import ChooseDatabaseModal from './components/ChooseDatabaseModal';
import { colors } from './Colors';
// import { PIWorkflow } from './pi-server/static/js/pi-client';
// // import './pi-server/static/js/vega-lite-api';
// // import './pi-server/static/js/vega-lite.5.1.1';
// // import './pi-server/static/js/vega.5.7.2';
// // import './pi-server/static/js/vega-embed.6';
// import * as vl from './pi-server/static/js/vega-lite-api';
// // import { vega, vegaLite, vl } from './pi-server/static/js/vega-embed.6';
// import { io } from './pi-server/static/js/socket.io';
// import * as vega from 'vega';
// import * as vegaLite from 'vega-lite';
// // import { vl } from 'vega-lite-api';
// // import * as vl from 'vega-lite-api';
// // import LoginModal from './components/login/LoginModal';
// // import { any } from "sequelize/types/lib/operators";

const typeMap: any = {
  text: <MdTextFormat style={{ color: colors.red }} />,
  number: <AiOutlineNumber style={{ color: colors.blue }} />,
  other: <AiOutlineQuestion style={{ color: colors.green }} />,
};
const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    width: '100%',
  },
};

// const session = "demo-" + Date.now();
// const socket = io.connect('http://localhost:8000');

// const workflow = PIWorkflow(socket, session, { enableHelp: false });

class Demo extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      tables: [],
      activeTable: 0,
      editSchemaModalVisible: false,
      predictedSQL: '',
      query: ''
      // chooseDatabaseModalVisible: true,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    // vl.register(vega, vegaLite, {
    //     config: {
    //       axis: { 
    //         titleFontSize: 30,
    //         labelFontSize: 30 
    //       }
    //     },
    //     view: { renderer: "svg" }
    // });
  }

  componentDidMount(): void {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  header = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        backgroundColor: colors.black,
        height: 80,
      }}
    >
      <div
        style={{
          fontSize: 35,
          color: 'white',
          fontWeight: 'bold',
          width: 250,
          textAlign: 'center',
        }}
      >
        NL2Interface
      </div>
    </div>
  );

  csvUpload = () => (
    <Dropzone
      onDrop={(acceptedFiles) => {
        const newTables: any[] = [];
        acceptedFiles.forEach((file) => {
          if (file.name.split('.')[1] === 'sqlite') {
            axios.post('http://localhost:8000/api/uploadDB', {
                  "filename": file.name
            })
              .then((res) => {
                console.log(res.data);
                // display the tables
                
                /* eslint-disable */
                for (const table in res.data) {
                  const newTable = {
                    rows: [],
                    columns: [],
                    name: "",
                  };
                  newTable.name = table;
                  newTable.columns = res.data[table]["columns"].map((col: any) => {
                    return {
                      key: col,
                      name: col,
                      originalName: col,
                      editable: true,
                      dataType: 'number',
                    };
                  });

                  const rows = res.data[table]["values"];
                  rows.forEach((row: any[], i: number) => {
                    if (i === 0) return;
                    // const rowToAdd: any = {};
                    newTable.columns.forEach((column: any, j: number) => {
                      if (Number.isNaN(row[column])) {
                        (newTable.columns[j] as any).dataType = 'text';
                      }
                      // rowToAdd[column] = row[column];
                    });
                    (newTable.rows as any).push(row);
                  });
                  newTables.push(newTable);
                  console.log(newTable.rows)
                  this.setState({ tables: newTables });
                }
              }
            )
            // eslint-disable-next-line no-console
            .catch((err) => console.log(err));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            let readerResult = reader!.result!;
            if (file.name.split('.')[1] === 'xlsx') {
              const workbook = XLSX.read(readerResult, { type: 'buffer' });
              readerResult = XLSX.utils.sheet_to_csv(
                workbook.Sheets[workbook.SheetNames[0]]
              );
            } else readerResult = readerResult.toString();
            const parsedCSV = parse(readerResult as string);
            const newTable = {
              rows: [],
              columns: [],
              name: file.name.split('.')[0],
            };
            const columnData = parsedCSV[0];
            newTable.columns = columnData.map((col: any) => {
              return {
                key: col,
                name: col,
                originalName: col,
                editable: true,
                dataType: 'number',
              };
            });

            parsedCSV.forEach((row: any[], i: number) => {
              if (i === 0) return;
              const rowToAdd: any = {};
              columnData.forEach((columnKey: any, j: number) => {
                if (Number.isNaN(row[j])) {
                  (newTable.columns[j] as any).dataType = 'text';
                }
                rowToAdd[columnKey] = row[j];
              });
              (newTable.rows as any).push(rowToAdd);
            });
            newTables.push(newTable);
            console.log(newTable.rows)
            this.setState({ tables: newTables });
          };
          if (file.name.split('.')[1] === 'xlsx')
            reader.readAsArrayBuffer(file);
          else reader.readAsText(file);
        });
      }}
      multiple
      accept=".csv,.xlsx,.sqlite"
    >
      {({ getRootProps, getInputProps }) => (
        // @ts-ignore
        <Button
          {...getRootProps()}
          variant="contained"
          style={{
            borderRadius: 10,
            backgroundColor: colors.blue,
            margin: 5,
            fontWeight: 'bold',
            color: colors.white,
            fontSize: 14,
            textTransform: 'none',
          }}
          endIcon={<CloudUploadIcon />}
        >
          <input type=".csv,.xlsx" {...getInputProps()} />
          Upload
        </Button>
      )}
    </Dropzone>
  );

  leftBar = () => {
    const { tables, activeTable } = this.state as any;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 240,
          backgroundColor: colors.offWhite,
          padding: 5,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: colors.black,
            fontWeight: 'bold',
            margin: 5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 5,
          }}
        >
          TABLES
          {this.csvUpload()}
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            position: 'relative',
            marginBottom: 5,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'auto',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
            }}
          >
            {tables.map((table: any, i: any) => {
              return (
                <>
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor:
                        i === activeTable ? colors.blue : colors.white,
                      margin: 4,
                      color: i === activeTable ? colors.white : colors.black,
                      fontSize: 14,
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                    }}
                    startIcon={
                      <AiOutlineTable
                        style={{
                          color:
                            i === activeTable ? colors.white : colors.black,
                        }}
                      />
                    }
                    onClick={() => {
                      this.setState({
                        activeTable: i,
                      });
                    }}
                  >
                    {table.name}
                  </Button>
                  {table.columns.map((column: any) => {
                    return (
                      <Button
                        variant="contained"
                        disableElevation
                        style={{
                          backgroundColor: colors.white,
                          marginRight: 4,
                          marginBottom: 2,
                          marginTop: 2,
                          marginLeft: 30,
                          color: colors.black,
                          fontSize: 14,
                          textTransform: 'none',
                          justifyContent: 'flex-start',
                          boxShadow: colors.getShadow(0, 0, 3, colors.gray),
                          borderRadius: 5,
                        }}
                        startIcon={typeMap[column.dataType]}
                        onClick={() => {
                          this.setState({
                            activeTable: i,
                          });
                        }}
                      >
                        {column.name}
                      </Button>
                    );
                  })}
                </>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  updateWindowDimensions(): void {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const {
      height,
      width,
      tables,
      activeTable,
      editSchemaModalVisible,
      predictedSQL,
      query,
    } = this.state as any;
    return (
      <div style={styles.container as any}>
        {/* TODO: Move LoginModal somewhere */}
        {/* <LoginModal isLogin /> */}
        {/* <ChooseDatabaseModal /> */}
        {this.header()}
        <div style={styles.contentContainer as any}>
          {this.leftBar()}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: height - 80 - 50,
              flex: 1,
              padding: 25,
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
              }}
            >
              <TextField
                label="Enter query"
                variant="outlined"
                fullWidth
                value={query}
                onChange={(e) => this.setState({ query: e.target.value })}
              />
              <Button
                variant="contained"
                style={{
                  marginLeft: 10,
                  height: 55,
                  backgroundColor: colors.blue,
                }}
                onClick={() => {
                  const dbSchema: Record<string, any> = {};
                  dbSchema.column_names = [[-1, '*']];
                  dbSchema.column_names_original = [[-1, '*']];
                  dbSchema.column_types = ['text'];
                  dbSchema.foreign_keys = [];
                  dbSchema.primary_keys = [];
                  dbSchema.table_names = [];
                  dbSchema.table_names_original = [];
                  tables.forEach((table: any, i: number) => {
                    dbSchema.table_names.push(table.name);
                    dbSchema.table_names_original.push(table.name);
                    table.columns.forEach((column: any) => {
                      dbSchema.column_types.push(column.dataType);
                      dbSchema.column_names.push([i, column.name]);
                      dbSchema.column_names_original.push([
                        i,
                        column.originalName,
                      ]);
                    });
                  });
                  let database = "";
                  dbSchema.column_names.forEach((column: string) => {
                      database += (column.slice(1).concat('|'))
                  });
                  database = database.slice(3, database.length - 1)
                  axios
                      .post('http://localhost:8000/api/predict', {
                          "question": query,
                          "database":database,
                    })
                      .then((res) => {
                          console.log(res.data);
                          let prediction = res.data.text;
                          (document.getElementById('inputClassifier') as HTMLImageElement).innerHTML = "SELECT " + prediction + ";";
                          // this.setState({predictedSQL: res.data.sql});
                      }
                    )
                    // eslint-disable-next-line no-console
                    .catch((err) => console.log(err));
                }}
              >
                <SendIcon style={{ color: colors.white }} />
              </Button>
            </div>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                marginBottom: 10,
              }}
            >
              <div id="inputClassifier"> </div>
              <SyntaxHighlighter language="sql" style={vs}>
                {predictedSQL}
              </SyntaxHighlighter>
            </div>

            {tables.length ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: colors.blue,
                      fontWeight: 'bold',
                      color: colors.white,
                      fontSize: 14,
                      textTransform: 'none',
                    }}
                    endIcon={<EditIcon />}
                    onClick={() => {
                      this.setState({ editSchemaModalVisible: true });
                    }}
                  >
                    Edit Schema
                  </Button>
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: colors.black,
                      fontSize: 14,
                      marginLeft: 10,
                    }}
                  >
                    (recommended)
                  </div>
                </div>

                <div
                  style={{
                    overflow: 'hidden',
                    boxShadow: colors.getShadow(
                      0,
                      0,
                      15,
                      colors.hexWithOpacity(colors.black, 0.2)
                    ),
                    backgroundColor: colors.white,
                  }}
                >
                  <ReactDataGrid
                    width={width - 250 - 50}
                    columns={tables[activeTable].columns}
                    rows={tables[activeTable].rows}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
        <EditSchemaModal
          // @ts-ignore
          tables={tables}
          visible={editSchemaModalVisible}
          close={() => this.setState({ editSchemaModalVisible: false })}
          updateTables={(__tables: any) => {
            this.setState({
              tables: __tables,
              editSchemaModalVisible: false,
            });
          }}
        />
      </div>
    );
  }
}

export default Demo;
