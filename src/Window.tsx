import {
  MosaicBranch,
  MosaicWindow,
} from 'react-mosaic-component';

interface WindowProps {
  count: number;
  path: MosaicBranch[];
  totalWindowCount: number;
}


export const Window = ({ count, path, totalWindowCount }: WindowProps) => {
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