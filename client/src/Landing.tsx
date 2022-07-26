/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import { Button } from '@material-ui/core';
import { colors } from './Colors';

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
    position: 'relative',
    overflow: 'hidden',
  },
};

type propTypes = {
  history: any;
};

class Landing extends React.Component<propTypes> {
  constructor(props: any) {
    super(props);
    this.state = {
      height: 0,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount(): void {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions(): void {
    this.setState({ height: window.innerHeight });
  }

  render() {
    const { height } = this.state as any;
    return (
      <div style={styles.container as any}>
        <div style={styles.contentContainer as any}>
          <div
            style={{
              transform: 'rotate(-10deg)',
              width: '100%',
              height: '60%',
              zIndex: 0,
              position: 'absolute',
              backgroundColor: colors.hexWithOpacity(colors.blue, 1),
              left: '-10%',
              top: '-60%',
              border: `10px solid ${colors.black}`,
            }}
          />
          <div
            style={{
              transform: 'rotate(-10deg)',
              width: '200%',
              height: '60%',
              zIndex: 0,
              position: 'absolute',
              backgroundColor: colors.hexWithOpacity(colors.blue, 1),
              right: '-10%',
              bottom: '-60%',
              border: `10px solid ${colors.black}`,
            }}
          />
          <div
            style={{
              flex: 1,
              height,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 'bold',
                  margin: 5,
                  color: colors.black,
                }}
              >
                Text2SQL:
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 'bold',
                  margin: 5,
                  marginTop: 10,
                  color: colors.black,
                }}
              >
                {`Natural Language -> SQL Query`}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  margin: 5,
                  marginTop: 30,
                  color: colors.hexWithOpacity(colors.blue, 0.75),
                }}
              >
                1. Upload or select a database
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  margin: 5,
                  marginTop: 10,
                  marginBottom: 75,
                  color: colors.hexWithOpacity(colors.blue, 0.75),
                }}
              >
                2. Ask a question
              </div>

              <Button
                variant="contained"
                style={{
                  backgroundColor: colors.blue,
                  fontWeight: 'bold',
                  color: colors.white,
                  fontSize: 40,
                  textTransform: 'none',
                  width: 250,
                }}
                onClick={() => {
                  const { history } = this.props;
                  history.push('/demo');
                }}
              >
                Try Demo
              </Button>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              height,
              background: colors.white,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              style={{ height: '100%', width: undefined, zIndex: 1 }}
              src="/LandingGraphic.png"
              alt="LandingPageGraphic"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
