import * as React from 'react';
import {
  MosaicBranch,
  MosaicWindow,
  ExpandButton,
  RemoveButton,
} from 'react-mosaic-component';


interface WindowProps {
  id: number;
  path: MosaicBranch[];
  totalWindowCount: number;
}

const ToolbarControls = React.Children.toArray([
  <ExpandButton />,
  <RemoveButton />,
]);



export const Window = ({ id, path }: WindowProps) => {
  return (
    <MosaicWindow<number>
      title={`Window ${id}`}
      path={path}
      onDragStart={() => console.log('MosaicWindow.onDragStart')}
      onDragEnd={(type) => console.log('MosaicWindow.onDragEnd', type)}
      toolbarControls={ToolbarControls}
    >
      <div className="example-window" style={{padding: 0}}>
        <div id={`win-${id}`} style={{"height": "100%", "width": "100%"}}>
        </div>
      </div>
    </MosaicWindow>
  );
};