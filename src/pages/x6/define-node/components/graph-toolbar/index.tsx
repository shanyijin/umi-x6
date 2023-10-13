import { useCallback, useState } from 'react';

import type { Graph } from '@antv/x6';

import {
  RedoOutlined,
  SyncOutlined,
  UndoOutlined,
  WalletOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';

import { Button } from 'antd';

import type { X6Graph } from '@/components/X6';

import style from './style.less';

type GraphToolbarPropsType = {
  graph: Graph;
  STATUS: X6Graph['STATUS'];
};
const GraphToolbar = (props: GraphToolbarPropsType) => {
  const { graph, STATUS } = props;

  const [zoomValue, setZoomValue] = useState('100%');
  const [historyState, setHistoryState] = useState({
    canRedo: false,
    canUndo: false
  });

  graph?.on('history:change', () => {
    setHistoryState({
      canRedo: graph.canRedo(),
      canUndo: graph.canUndo()
    });
  });

  const onUndo = () => {
    graph.undo();
  };

  const onRedo = () => {
    graph.redo();
  };

  const minScale = () => {
    const zoom = graph.zoom();
    graph.zoomTo(zoom - 0.1, {
      minScale: 0.6
    });
    if (zoom - 0.1 > 0.6) {
      setZoomValue(`${Math.round((zoom - 0.1) * 100)}/%`);
    }
  };

  const maxScale = useCallback(() => {
    const zoom = graph.zoom();
    graph.zoomTo(zoom + 0.1, {
      maxScale: 1.8
    });
    if (zoom + 0.1 <= 1.8) {
      setZoomValue(`${Math.round((zoom + 0.1) * 100)}/%`);
    }
  }, [graph]);

  const center = useCallback(() => {
    graph.centerContent(); // 居中显示
    graph.zoomTo(1);
    setZoomValue('100%');
  }, [graph]);

  const save = () => {
    const value = graph.toJSON();
    console.log(value);
  };

  return (
    <div className={style.toolbar}>
      <div className={style.zoom}>
        <Button onClick={minScale} style={{ paddingLeft: 8, paddingRight: 8 }}>
          <ZoomOutOutlined />
        </Button>
        <span className={style.text}>{zoomValue}</span>
        <Button onClick={maxScale} style={{ paddingLeft: 8, paddingRight: 8 }}>
          <ZoomInOutlined />
        </Button>
      </div>
      <Button className={style.center} onClick={center} style={{ paddingLeft: 8, paddingRight: 8 }}>
        <SyncOutlined />
      </Button>
      {STATUS === 'EDIT' ? (
        <>
          <Button.Group>
            <Button
              onClick={onUndo}
              disabled={!historyState.canUndo}
              style={{ paddingLeft: 8, paddingRight: 8 }}
            >
              <UndoOutlined />
            </Button>
            <Button
              onClick={onRedo}
              disabled={!historyState.canRedo}
              style={{ paddingLeft: 8, paddingRight: 8 }}
            >
              <RedoOutlined />
            </Button>
          </Button.Group>
          <div className={style.save}>
            <Button type="primary" onClick={save}>
              保存
              <WalletOutlined />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default GraphToolbar;
