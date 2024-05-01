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

import {
  Corner,
  createBalancedTreeFromLeaves,
  getLeaves,
  getNodeAtPath,
  getOtherDirection,
  getPathToCorner,
  Mosaic,
  MosaicBranch,
  MosaicDirection,
  MosaicNode,
  MosaicParent,
  MosaicWindow,
  MosaicZeroState,
  updateTree,
} from 'react-mosaic-component';


export const THEMES = {
  ['Blueprint']: 'mosaic-blueprint-theme',
  ['Blueprint Dark']: classNames('mosaic-blueprint-theme', Classes.DARK),
  ['None']: '',
};

export type Theme = keyof typeof THEMES;


export interface ExampleAppState {
  currentNode: MosaicNode<number> | null;
  currentTheme: Theme;
  imjoy: any;
}

export class App extends React.PureComponent<{}, ExampleAppState> {
  state: ExampleAppState = {
    currentNode: {
      direction: 'row',
      first: 1,
      second: {
        direction: 'column',
        first: 2,
        second: 3,
      },
      splitPercentage: 40,
    },
    currentTheme: 'Blueprint',
    imjoy: null
  };

  async componentDidMount() {
    const imjoy = new imjoyCore.ImJoy({
      imjoy_api: {},
      //imjoy config
    });

    imjoy.start({workspace: 'default'}).then(async ()=>{

      imjoy.event_bus.on("add_window", (win: any) => {
        // Create mosaic window
        const winId = this.addToTopRight()
        const mosaicContainer = document.getElementById(`win-${winId}`)
        if (mosaicContainer) {
          mosaicContainer.id = win.window_id; // <--- this is important
        }
      })
      await imjoy.api.createWindow({src: "https://kaibu.org"})
    })
  }

  addToTopRight(){
    let { currentNode } = this.state;
    const totalWindowCount = getLeaves(currentNode).length;
    if (currentNode) {
      const path = getPathToCorner(currentNode, Corner.TOP_RIGHT);
      const parent = getNodeAtPath(currentNode, dropRight(path)) as MosaicParent<number>;
      const destination = getNodeAtPath(currentNode, path) as MosaicNode<number>;
      const direction: MosaicDirection = parent ? getOtherDirection(parent.direction) : 'row';

      let first: MosaicNode<number>;
      let second: MosaicNode<number>;
      if (direction === 'row') {
        first = destination;
        second = totalWindowCount + 1;
      } else {
        first = totalWindowCount + 1;
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
    } else {
      currentNode = totalWindowCount;
    }

    this.setState({ currentNode });
    return totalWindowCount;
  };

  render() {

    const totalWindowCount = getLeaves(this.state.currentNode).length;
    return (
      <React.StrictMode>
        <div className="react-mosaic-example-app">
          {this.renderNavBar()}
          <Mosaic<number>
            renderTile={(count, path) => (
              <ExampleWindow count={count} path={path} totalWindowCount={totalWindowCount} />
            )}
            zeroStateView={<MosaicZeroState createNode={() => totalWindowCount + 1} />}
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
          </div>
        </div>
        <div className={classNames(Classes.NAVBAR_GROUP, Classes.BUTTON_GROUP)}>
          <label className={classNames('theme-selection', Classes.LABEL, Classes.INLINE)}>
            Theme:
            <HTMLSelect
              value={this.state.currentTheme}
              onChange={(e: any) => this.setState({ currentTheme: e.currentTarget.value as Theme })}
            >
              {React.Children.toArray(Object.keys(THEMES).map((label) => <option>{label}</option>))}
            </HTMLSelect>
          </label>
          <div className="navbar-separator" />
          <span className="actions-label">Example Actions:</span>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.GRID_VIEW))}
            onClick={this.autoArrange}
          >
            Auto Arrange
          </button>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.ARROW_TOP_RIGHT))}
            onClick={this.addToTopRight}
          >
            Add Window to Top Right
          </button>
        </div>
      </div>
    );
  }
}

interface ExampleWindowProps {
  count: number;
  path: MosaicBranch[];
  totalWindowCount: number;
}

const ExampleWindow = ({ count, path, totalWindowCount }: ExampleWindowProps) => {

  return (
    <MosaicWindow<number>
      title={`Window ${count}`}
      createNode={() => totalWindowCount + 1}
      path={path}
      onDragStart={() => console.log('MosaicWindow.onDragStart')}
      onDragEnd={(type) => console.log('MosaicWindow.onDragEnd', type)}
    >
      <div className="example-window" style={{padding: 0}}>
        <div id={`win-${count}`} style={{"height": "100%", "width": "100%"}}>
        </div>
      </div>
    </MosaicWindow>
  );
};
