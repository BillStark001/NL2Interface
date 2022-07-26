/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { colors } from '../Colors';

const styles = {
  modal: {
    backgroundColor: 'rgba(1,1,1,0.075)',
    position: 'fixed',
    zIndex: 5,
    width: '100vw',
    height: '100vh',
    top: 0,
    left: 0,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as React.CSSProperties,
  modalContent: {
    backgroundColor: 'white',
    width: 500,
    margin: 'auto',
    border: 1,
    borderRadius: 10,
    padding: 15,
    paddingTop: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    boxShadow: '0px 2px 10px #0000002F',
    zIndex: 6,
  } as React.CSSProperties,
  blockRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    flexDirection: 'row',
  } as React.CSSProperties,
  col: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  } as React.CSSProperties,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class ChooseDatabseModal extends React.Component {
  dbButton = (name: string, col: string) => (
    <Button
      variant="contained"
      style={{
        height: 45,
        width: '100%',
        background: col,
        marginTop: 3,
        marginBottom: 3,
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 'bold',
        color: colors.white,
      }}
    >
      {name}
    </Button>
  );

  render() {
    const databases = ['database 1', 'database 2', 'database 3', 'database 4'];

    return (
      <div style={styles.modal}>
        <div style={{ height: 80, width: 80 }} />
        <div style={{ height: 80, width: 80 }} />

        <div style={styles.modalContent}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 20,
              color: 'black',
              width: '100%',
              fontWeight: 'bold',
              textAlign: 'center',
              justifyContent: 'center',
              height: 50,
              marginTop: 5,
              marginBottom: 5,
            }}
          >
            Choose a database or upload your own
          </div>
          {databases.map((dbName) => {
            return this.dbButton(
              dbName,
              colors.hexWithOpacity(colors.blue, 0.75)
            );
          })}
          {this.dbButton('Upload database (CSV)', colors.blue)}
        </div>
        <Button
          variant="contained"
          style={{
            height: 80,
            width: 80,
            background: colors.red,
            borderRadius: 40,
          }}
        >
          <CloseIcon style={{ color: colors.white, width: 50, height: 50 }} />
        </Button>
        <div style={{ height: 80, width: 80 }} />
      </div>
    );
  }
}
