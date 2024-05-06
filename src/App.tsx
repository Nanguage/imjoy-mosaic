import { Classes, HTMLSelect } from '@blueprintjs/core';
import { Overlay2, OverlaysProvider } from "@blueprintjs/core"; 
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import dropRight from 'lodash/dropRight';
import React, {useState, useEffect} from 'react';
import * as imjoyCore from "imjoy-core"
  
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/styles/index.less';
import './carbon.less';
import './app.less';
import { Window } from './Window';
import { useStore } from './store';


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


const THEMES = {
  ['Light']: 'mosaic-blueprint-theme',
  ['Dark']: classNames('mosaic-blueprint-theme', Classes.DARK),
};

type Theme = keyof typeof THEMES;

type NewWindowPosition = "right" | "topRight"

type NodeType = number;


export const App = () => {
  const [currentNode, setCurrentNode] = useState<MosaicNode<NodeType> | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>('Dark');
  const [imjoy, setImjoy] = useState<any>(null);
  const [idCounter, setIdCounter] = useState<number>(0);
  const [Loading, setLoading] = useState<boolean>(false);
  const [initRun, setInitRun] = useState<boolean>(false);

  const { setWindowId2name, title } = useStore()

  const addWindow = React.useCallback((position: NewWindowPosition = "topRight") => {
    let current = currentNode;
    const newId = idCounter + 1;
    if (current === null) {
      setCurrentNode(newId);
      setIdCounter(newId);
      return newId;
    }
    const path = getPathToCorner(current, Corner.TOP_RIGHT);
    const parent = getNodeAtPath(current, dropRight(path)) as MosaicParent<NodeType>;
    const destination = getNodeAtPath(current, path) as MosaicNode<NodeType>;
    let direction: MosaicDirection
    if (position === "topRight") {
      direction = parent ? getOtherDirection(parent.direction) : 'row';
    } else {
      direction = "row"
    }

    let first: MosaicNode<NodeType>;
    let second: MosaicNode<NodeType>;
    if (direction === 'row') {
      first = destination;
      second = newId;
    } else {
      first = newId;
      second = destination;
    }

    current = updateTree(current, [
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

    setCurrentNode(current);
    setIdCounter(newId);
    return newId;
  }, [currentNode, idCounter, setCurrentNode, setIdCounter]);


  const newImjoyWindow = React.useCallback(async (pluginUrl: string | null = null) => {
    if (imjoy) {
      // Let user input the plugin url
      if (!pluginUrl) {
        pluginUrl = prompt("Please enter the plugin url", "https://kaibu.org");
      }
      try {
        const plugin = await imjoy.api.loadPlugin({src: pluginUrl})
        await plugin.run()
        console.log('new plugin:', plugin)
      } catch (e) {
        console.error(e)
      }
    } else {
      setTimeout(() => {
        newImjoyWindow(pluginUrl)
      }, 1000)
    }
  }, [imjoy])

  useEffect(() => {
    setLoading(true)
    const imjoy_ = new imjoyCore.ImJoy({
      imjoy_api: {},
      //imjoy config
    });
    imjoy_.start().then(() => {
      setImjoy(imjoy_);
      setLoading(false)
    });
  }, []);

  useEffect(() => {
    if (imjoy) {
      imjoy.event_bus.on("add_window", (win: any) => {
        // Create mosaic window
        const winId = addWindow()
        // wait for the window to be created
        const intervalId = setInterval(() => {
          const mosaicContainer = document.getElementById(`win-${winId}`);
          if (mosaicContainer) {
            mosaicContainer.id = win.window_id; // <--- this is important
            console.log('Imjoy window created:', win)
            setWindowId2name(winId, win.name)
            clearInterval(intervalId)
          }
        }, 500)
      })

      if (!initRun) {
        setInitRun(true)
        // get parameter from the url
        const urlParams = new URLSearchParams(window.location.search);
        const pluginUrl = urlParams.get('plugin');
        console.log('pluginUrl:', pluginUrl)
        if (pluginUrl) {
          newImjoyWindow(pluginUrl)
        }
      }
    }

  }, [imjoy, addWindow, setWindowId2name, newImjoyWindow, initRun]);

  const onChange = (current: MosaicNode<NodeType> | null) => {
    setCurrentNode(current);
  };

  const onRelease = (current: MosaicNode<NodeType> | null) => {
    console.log('Mosaic.onRelease():', current);
  };

  const autoArrange = () => {
    const leaves = getLeaves(currentNode);

    setCurrentNode(createBalancedTreeFromLeaves(leaves));
  };

  const renderNavBar = () => {
    return (
      <div className={classNames(Classes.NAVBAR, Classes.DARK)}>
        <div className={Classes.NAVBAR_GROUP}>
          <div className={Classes.NAVBAR_HEADING}>
            {title}
          </div>
        </div>
        <div className={classNames(Classes.NAVBAR_GROUP, Classes.BUTTON_GROUP)}>
          <label className={classNames('theme-selection', Classes.LABEL, Classes.INLINE)}>
            Theme:
            <HTMLSelect
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.currentTarget.value as Theme)}
            >
              {React.Children.toArray(Object.keys(THEMES).map((label) => <option>{label}</option>))}
            </HTMLSelect>
          </label>
          <div className="navbar-separator" />
          <span className="actions-label">Actions:</span>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.GRID_VIEW))}
            onClick={autoArrange}
          >
            Auto Arrange
          </button>
          <button
            className={classNames(Classes.BUTTON, Classes.iconClass(IconNames.ARROW_TOP_RIGHT))}
            onClick={() => {
              newImjoyWindow(null)
            }}
          >
            Add Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <React.StrictMode>
      <div className="react-mosaic-example-app">
        {renderNavBar()}
        <Mosaic<NodeType>
          renderTile={(id, path) => {
            return (
              <Window id={id} path={path} />
            )
          }}
          zeroStateView={<MosaicZeroState/>}
          value={currentNode}
          onChange={onChange}
          onRelease={onRelease}
          className={THEMES[currentTheme]}
          blueprintNamespace="bp5"
        />
        <OverlaysProvider>
          <Overlay2 isOpen={Loading} className='overlay2'>
            <div className="loading-animation"></div>
          </Overlay2>
        </OverlaysProvider>
      </div>
    </React.StrictMode>
  );
}