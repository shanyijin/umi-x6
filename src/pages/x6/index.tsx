import { Graph } from '@antv/x6';

import { useCallback, useRef, useState } from 'react';

import { useMount } from 'ahooks';

import { dataDemo } from './data';

import { History } from '@antv/x6-plugin-history';

import { defineRegisterNode } from './define-node/index';

import { GraphToolbar } from './define-node/components';

import style from './style.less';

export type X6Graph = Graph & { STATUS?: 'EDIT' | 'READONLY' };

const X6 = (props: { STATUS?: X6Graph['STATUS'] }) => {
  const { STATUS = 'EDIT' } = props;
  const X6Ref = useRef(null);
  const [graphInstance, setGraphInstance] = useState<Graph>();

  const init = useCallback(() => {
    if (!X6Ref.current) {
      return {};
    }
    const graph: X6Graph = new Graph({
      interacting: {
        nodeMovable: false,
        edgeMovable: false,
        edgeLabelMovable: false,
        arrowheadMovable: false,
        vertexDeletable: false
      },
      mousewheel: {
        enabled: false,
        modifiers: ['ctrl', 'meta']
      },
      panning: true,
      translating: {
        restrict: true
      },
      grid: {
        size: 8, // 网格大小 10px
        visible: true,
        type: 'fixedDot'
      },
      background: {
        color: 'rgb(250,250,250)'
      },
      autoResize: true,
      container: X6Ref.current
    });
    if ('production' !== process.env.NODE_ENV) {
      window.__x6_instances__ = [];
      window.__x6_instances__.push(graph);
    }
    const graphHistory = new History({
      enabled: true
    });
    graph.use(graphHistory);
    defineRegisterNode();

    graph.fromJSON(dataDemo); // 渲染元素
    graph.centerContent(); // 居中显示
    setGraphInstance(graph);
    graph.STATUS = STATUS;
  }, [STATUS]);

  useMount(init);

  return (
    <div className={style['x6-box']}>
      {graphInstance ? <GraphToolbar graph={graphInstance} STATUS={STATUS} /> : null}
      <div style={{ width: '100%', height: '100%' }} ref={X6Ref} />
    </div>
  );
};

export default X6;
