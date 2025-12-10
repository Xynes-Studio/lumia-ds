import { BlockDefinition } from './types';
import { PanelBlock } from './components/renderers/blocks/PanelBlock';
import { VideoBlock } from './components/renderers/blocks/VideoBlock';
import { ImageBlock } from './components/renderers/blocks/ImageBlock';
import { FileBlock } from './components/renderers/blocks/FileBlock';
import { StatusBlock } from './components/renderers/blocks/StatusBlock';

export const defaultBlockRegistry: BlockDefinition[] = [
  {
    type: 'panel-block',
    label: 'Panel',
    component: PanelBlock,
  },
  {
    type: 'video-block',
    label: 'Video',
    component: VideoBlock,
  },
  {
    type: 'image-block',
    label: 'Image',
    component: ImageBlock,
  },
  {
    type: 'file-block',
    label: 'File',
    component: FileBlock,
  },
  {
    type: 'status',
    label: 'Status',
    component: StatusBlock,
  },
];
