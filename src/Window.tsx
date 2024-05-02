import * as React from 'react';
import {
  MosaicBranch,
  MosaicWindow,
  ExpandButton,
  RemoveButton,
} from 'react-mosaic-component';
import { useStore } from './store';


interface WindowProps {
  id: number;
  path: MosaicBranch[];
}

const ToolbarControls = React.Children.toArray([
  <ExpandButton />,
  <RemoveButton />,
]);



export const Window = ({ id, path }: WindowProps) => {
  const { windowId2name } = useStore();

  let title = `Window ${id}`;
  if (windowId2name[id]) {
    title = windowId2name[id];
  }
  return (
    <MosaicWindow<number>
      title={title}
      path={path}
      onDragStart={() => console.log('MosaicWindow.onDragStart')}
      onDragEnd={(type) => console.log('MosaicWindow.onDragEnd', type)}
      toolbarControls={ToolbarControls}
    >
      <div className="example-window" style={{padding: 5}}>
        <div id={`win-${id}`} style={{"height": "100%", "width": "100%"}}>
        </div>
      </div>
    </MosaicWindow>
  );
};