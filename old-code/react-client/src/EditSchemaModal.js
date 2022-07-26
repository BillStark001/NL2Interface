import React from "react";
import { TextField, Button } from "@material-ui/core";
import { colors } from "./Colors";

class EditSchemaModal extends React.Component {
  state = { tables: [] };
  componentWillReceiveProps() {
    this.setState({
      tables: this.props.tables,
    });
  }

  render() {
    const { visible } = this.props;
    const { tables } = this.state;

    if (!visible) return null;
    return (
      <div style={styles.container}>
        <div style={styles.contentContainer}>
          <div
            style={{
              width: "100%",
              height: 60,
              backgroundColor: colors.blue,
              paddingLeft: 25,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: colors.white,
              }}
            >
              Schema Settings
            </div>
          </div>
          <div
            style={{
              overflow: "scroll",
              display: "flex",
              flex: 1,
              flexDirection: "column",
              padding: 25,
              paddingBottom: 0,
            }}
          >
            {tables.map((table, i) => {
              return (
                <>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      color: colors.black,
                      marginBottom: 24,
                    }}
                  >
                    {table.name}
                  </div>
                  {table.columns.map((column, j) => {
                    return (
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: colors.black,
                            flex: 1,
                            marginRight: 32,
                            marginLeft: 12,
                          }}
                        >
                          {column.originalName}
                        </div>
                        <TextField
                          value={column.name}
                          label="Column Rename"
                          variant="outlined"
                          style={{ marginRight: 12 }}
                          onChange={(e) => {
                            tables[i].columns[j].name = e.target.value;
                            this.setState({ tables: tables });
                          }}
                        />
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor:
                              column.dataType === "text"
                                ? colors.blue
                                : colors.white,
                            height: 40,
                            fontWeight:
                              column.dataType === "text" ? "bold" : "normal",
                            color:
                              column.dataType === "text"
                                ? colors.white
                                : colors.black,
                            marginRight: 12,
                            fontSize: 14,
                            textTransform: "none",
                          }}
                          onClick={() => {
                            tables[i].columns[j].dataType = "text";
                            this.setState({ tables: tables });
                          }}
                        >
                          text
                        </Button>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor:
                              column.dataType === "number"
                                ? colors.blue
                                : colors.white,
                            height: 40,
                            fontWeight:
                              column.dataType === "number" ? "bold" : "normal",
                            color:
                              column.dataType === "number"
                                ? colors.white
                                : colors.black,
                            marginRight: 12,
                            fontSize: 14,
                            textTransform: "none",
                          }}
                          onClick={() => {
                            tables[i].columns[j].dataType = "number";
                            this.setState({ tables: tables });
                          }}
                        >
                          number
                        </Button>
                        <Button
                          variant="contained"
                          style={{
                            backgroundColor:
                              column.dataType === "other"
                                ? colors.blue
                                : colors.white,
                            height: 40,
                            fontWeight:
                              column.dataType === "other" ? "bold" : "normal",
                            color:
                              column.dataType === "other"
                                ? colors.white
                                : colors.black,
                            marginRight: 12,
                            fontSize: 14,
                            textTransform: "none",
                          }}
                          onClick={() => {
                            tables[i].columns[j].dataType = "other";
                            this.setState({ tables: tables });
                          }}
                        >
                          other
                        </Button>
                      </div>
                    );
                  })}
                  <div style={{ marginBottom: 12 }}></div>
                </>
              );
            })}
          </div>
          <div
            style={{
              width: "100%",
              height: 60,
              backgroundColor: colors.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.white,
                height: 40,
                fontWeight: "normal",
                color: colors.black,
                fontSize: 14,
                textTransform: "none",
                marginLeft: 10,
                marginRight: 10,
              }}
              onClick={() => {
                this.props.close();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.blue,
                height: 40,
                fontWeight: "bold",
                color: colors.white,
                fontSize: 14,
                textTransform: "none",
                marginLeft: 10,
                marginRight: 10,
              }}
              onClick={() => {
                this.props.updateTables(tables);
              }}
            >
              Save
            </Button>
          </div>
        </div>
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.hexWithOpacity(colors.black, 0.5),
    zIndex: 1,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    height: "60%",
    backgroundColor: colors.white,
    borderRadius: 5,
    boxShadow: colors.getShadow(
      0,
      0,
      10,
      colors.hexWithOpacity(colors.black, 0.2)
    ),
    overflow: "hidden",
  },
};
export default EditSchemaModal;
