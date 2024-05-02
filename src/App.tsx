import { Classes, HTMLSelect } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import dropRight from 'lodash/dropRight';
import React from 'react';
import * as imjoyCore from "imjoy-core"
  
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/styles/index.less';
import './carbon.less';
import './app.less';
import { Window } from './Window';

import {
  Corner,
  createBalancedTreeFromLeaves,
  getLeaves,
  getNodeAtPath,
  getOtherDirection,
  getPathToCorner,
  Mosaic,
  MosaicDirection,
  MosaicNode,
  MosaicParent,
  MosaicZeroState,
  updateTree,
} from 'react-mosaic-component';


export const THEMES = {
  ['Light']: 'mosaic-blueprint-theme',
  ['Dark']: classNames('mosaic-blueprint-theme', Classes.DARK),
};


type Theme = keyof typeof THEMES;


type NewWindowPosition = "right" | "topRight"


interface AppState {
  currentNode: MosaicNode<number> | null;
  currentTheme: Theme;
  imjoy: any;
  idCounter: number;
  id2props: {[key: number]: any}
}


export class App extends React.PureComponent<object, AppState> {
  state: AppState = {
    currentNode: null,
    currentTheme: 'Dark',
    imjoy: null,
    idCounter: 0,
    id2props: {}
  };

  async componentDidMount() {
    const imjoy = new imjoyCore.ImJoy({
      imjoy_api: {},
      //imjoy config
    });

    imjoy.start({workspace: 'default'}).then(async ()=>{

      imjoy.event_bus.on("add_window", (win: any) => {
        // Create mosaic window
        const winId = this.addWindow()
        // wait for the window to be created
        const intervalId = setInterval(() => {
          const mosaicContainer = document.getElementById(`win-${winId}`);
          if (mosaicContainer) {
            mosaicContainer.id = win.window_id; // <--- this is important
            clearInterval(intervalId)
          }
        }, 500)
      })

      this.setState({imjoy})
    })
  }

  private newImjoyWindow = async () => {
    const imjoy = this.state.imjoy
    if(!imjoy) return
    // Let user input the plugin url
    const pluginUrl = prompt("Please enter the plugin url", "https://kaibu.org");
    const win = await imjoy.api.createWindow({src: pluginUrl})
    console.log('new window:', win)
  }

  private addWindow = (position: NewWindowPosition = "right") => {
    let { currentNode } = this.state;
    const { idCounter } = this.state;
    const newId = idCounter + 1;
    console.log('Adding window', idCounter + 1);
    if (currentNode === null) {
      this.setState({ currentNode: newId, idCounter: newId});
      return newId;
    }
    const path = getPathToCorner(currentNode, Corner.TOP_RIGHT);
    const parent = getNodeAtPath(currentNode, dropRight(path)) as MosaicParent<number>;
    const destination = getNodeAtPath(currentNode, path) as MosaicNode<number>;
    let direction: MosaicDirection
    if (position === "topRight") {
      direction = parent ? getOtherDirection(parent.direction) : 'row';
    } else {
      direction = "row"
    }

    let first: MosaicNode<number>;
    let second: MosaicNode<number>;
    if (direction === 'row') {
      first = destination;
      second = newId;
    } else {
      first = newId;
      second = destination;
    }

    currentNode = updateTree(currentNode, [
      {
        path,
        spec: {
          $set: {
            direction,
            first,
            second,
          },
        },
      },
    ]);

    this.setState({ currentNode, idCounter: newId});
    return newId;
  };

  render() {

    return (
      <React.StrictMode>
        <div className="react-mosaic-example-app">
          {this.renderNavBar()}
          <Mosaic<number>
            renderTile={(id, path) => (
              <Window id={id} path={path} />
            )}
            zeroStateView={<MosaicZeroState createNode={this.addWindow} />}
            value={this.state.currentNode}
            onChange={this.onChange}
            onRelease={this.onRelease}
            className={THEMES[this.state.currentTheme]}
            blueprintNamespace="bp5"
          />
        </div>
      </React.StrictMode>
    );
  }

  private onChange = (currentNode: MosaicNode<number> | null) => {
    this.setState({ currentNode });
  };

  private onRelease = (currentNode: MosaicNode<number> | null) => {
    console.log('Mosaic.onRelease():', currentNode);
  };

  private autoArrange = () => {
    const leaves = getLeaves(this.state.currentNode);

    this.setState({
      currentNode: createBalancedTreeFromLeaves(leaves),
    });
  };

  private renderNavBar() {
    return (
      <div className={classNames(Classes.NAVBAR, Classes.DARK)}>
        <div className={Classes.NAVBAR_GROUP}>
          <div className={Classes.NAVBAR_HEADING}>
            ImJoy Mosaic
          </div>
        </div>
        <div className={classNames(Classes.NAVBAR_GROUP, Classes.BUTTON_GROUP)}>
          <label className={classNames('theme-selection', Classes.LABEL, Classes.INLINE)}>
            Theme:
            <HTMLSelect
              value={this.state.currentTheme}
              onChange={(e) => this.setState({ currentTheme: e.currentTarget.value as Theme })}
            >
              {React.Children.toArray(Object.keys(THEMES).map((label) => <option>{label}</option>))}
            </HTMLSelect>
          </label>
          <div className="navbar-separator" />
          <span className="actions-label">Actions:</span>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.GRID_VIEW))}
            onClick={this.autoArrange}
          >
            Auto Arrange
          </button>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.ARROW_TOP_RIGHT))}
            onClick={() => {this.newImjoyWindow()}}
          >
            Add Window
          </button>
        </div>
      </div>
    );
  }
}

