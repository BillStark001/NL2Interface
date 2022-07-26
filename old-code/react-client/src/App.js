import React from "react";
import ReactDataGrid from "react-data-grid";
import "react-data-grid/dist/react-data-grid.css";
import { TextField, Button } from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SendIcon from "@material-ui/icons/Send";
import EditIcon from "@material-ui/icons/Edit";
import Dropzone from "react-dropzone";
import { colors } from "./Colors";
import parse from "csv-parse/lib/sync";
import SyntaxHighlighter from "react-syntax-highlighter";
import sqlFormatter from "sql-formatter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  AiOutlineNumber,
  AiOutlineTable,
  AiOutlineQuestion,
} from "react-icons/ai";
import { MdTextFormat } from "react-icons/md";
import EditSchemaModal from "./EditSchemaModal";
import axios from "axios";

const typeMap = {
  text: <MdTextFormat style={{ color: colors.red }} />,
  number: <AiOutlineNumber style={{ color: colors.blue }} />,
  other: <AiOutlineQuestion style={{ color: colors.green }} />,
};
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      tables: [],
      activeTable: 0,
      editSchemaModalVisible: false,
      predictedSQL: "",
      query: "",
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  _header = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        backgroundColor: colors.blue,
        height: 80,
      }}
    >
      <div
        style={{
          fontSize: 35,
          color: "white",
          fontWeight: "bold",
          width: 250,
          textAlign: "center",
        }}
      >
        Text2SQL
      </div>
    </div>
  );

  _csvUpload = () => (
    <Dropzone
      onDrop={(acceptedFiles) => {
        let newTables = [];
        acceptedFiles.forEach((file) => {
          let reader = new FileReader();
          reader.onload = () => {
            let parsedCSV = parse(reader.result);
            let newTable = {
              rows: [],
              columns: [],
              name: file.name.split(".")[0],
            };
            let columnData = parsedCSV[0];
            newTable.columns = columnData.map((col) => {
              return {
                key: col,
                name: col,
                originalName: col,
                editable: true,
                dataType: "number",
              };
            });

            parsedCSV.forEach((row, i) => {
              if (i === 0) return;
              let rowToAdd = {};
              columnData.forEach((columnKey, j) => {
                if (isNaN(row[j])) {
                  newTable.columns[j].dataType = "text";
                }
                rowToAdd[columnKey] = row[j];
              });
              newTable.rows.push(rowToAdd);
            });
            newTables.push(newTable);
            this.setState({ tables: newTables });
          };
          reader.readAsText(file);
        });
      }}
      multiple={true}
      accept={".csv"}
    >
      {({ getRootProps, getInputProps }) => (
        <Button
          {...getRootProps()}
          variant="contained"
          style={{
            borderRadius: 10,
            backgroundColor: colors.blue,
            margin: 5,
            fontWeight: "bold",
            color: colors.white,
            fontSize: 14,
            textTransform: "none",
          }}
          endIcon={<CloudUploadIcon />}
        >
          <input type=".csv" {...getInputProps()} />
          Upload
        </Button>
      )}
    </Dropzone>
  );

  _leftBar = () => {
    const { tables, activeTable } = this.state;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 240,
          backgroundColor: colors.offWhite,
          padding: 5,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: colors.black,
            fontWeight: "bold",
            margin: 5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 5,
          }}
        >
          TABLES
          {this._csvUpload()}
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            position: "relative",
            marginBottom: 5,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "auto",
              display: "flex",
              flex: 1,
              flexDirection: "column",
            }}
          >
            {tables.map((table, i) => {
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
                      textTransform: "none",
                      justifyContent: "flex-start",
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
                  {table.columns.map((column) => {
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
                          textTransform: "none",
                          justifyContent: "flex-start",
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

  render() {
    const {
      height,
      width,
      tables,
      activeTable,
      editSchemaModalVisible,
      predictedSQL,
      query,
    } = this.state;
    return (
      <div style={styles.container}>
        {this._header()}
        <div style={styles.contentContainer}>
          {this._leftBar()}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: height - 80 - 50,
              flex: 1,
              padding: 25,
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
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
                  let db_schema = {};
                  db_schema["column_names"] = [[-1, "*"]];
                  db_schema["column_names_original"] = [[-1, "*"]];
                  db_schema["column_types"] = ["text"];
                  db_schema["foreign_keys"] = [];
                  db_schema["primary_keys"] = [];
                  db_schema["table_names"] = [];
                  db_schema["table_names_original"] = [];
                  tables.forEach((table, i) => {
                    db_schema["table_names"].push(table.name);
                    db_schema["table_names_original"].push(table.name);
                    table.columns.forEach((column) => {
                      db_schema["column_types"].push(column.dataType);
                      db_schema["column_names"].push([i, column.name]);
                      db_schema["column_names_original"].push([
                        i,
                        column.originalName,
                      ]);
                    });
                  });

                  axios
                    .post("http://35.192.1.2/predict", {
                      query: query,
                      db: db_schema,
                    })
                    .then((res) =>
                      this.setState({ predictedSQL: res.data.sql })
                    )
                    .catch((err) => console.log(err));
                }}
              >
                <SendIcon style={{ color: colors.white }} />
              </Button>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                marginBottom: 10,
              }}
            >
              <SyntaxHighlighter language="sql" style={vs}>
                {sqlFormatter.format(predictedSQL)}
              </SyntaxHighlighter>
            </div>

            {tables.length ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Button
                    variant="contained"
                    style={{
                      backgroundColor: colors.blue,
                      fontWeight: "bold",
                      color: colors.white,
                      fontSize: 14,
                      textTransform: "none",
                    }}
                    endIcon={<EditIcon />}
                    onClick={() =>
                      this.setState({ editSchemaModalVisible: true })
                    }
                  >
                    Edit Schema
                  </Button>
                  <div
                    style={{
                      fontWeight: "bold",
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
                    overflow: "hidden",
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
          tables={tables}
          visible={editSchemaModalVisible}
          close={() => this.setState({ editSchemaModalVisible: false })}
          updateTables={(tables) =>
            this.setState({
              tables: tables,
              editSchemaModalVisible: false,
            })
          }
        />
      </div>
    );
  }
}

const styles = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    width: "100%",
  },
};
export default App;
