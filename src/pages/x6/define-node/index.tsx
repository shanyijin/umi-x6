import { Graph } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import BranchNode from './branch-node';
import ConditionNode from './condition-node';
import EndComp from './end-node';
import ExamineNode from './examine-node';
import ExecutorNode from './executor-node';
import SendNode from './send-node';

import StartComp from './start-node';

import type { Node } from '@antv/x6';

import type { X6Graph } from '../index';

export type DefineNodePropsType = { graph: X6Graph; node: Node };

const defineRegisterNode = () => {
  register({
    shape: 'branch-react-node',
    width: 560,
    height: 192,
    component: BranchNode,
    effect: ['data']
  });

  register({
    shape: 'condition-react-node',
    width: 200,
    height: 84,
    component: ConditionNode,
    effect: ['data']
  });
  register({
    shape: 'examine-react-node',
    width: 200,
    height: 84,
    component: ExamineNode,
    effect: ['data']
  });
  register({
    shape: 'executor-react-node',
    width: 200,
    height: 84,
    component: ExecutorNode,
    effect: ['data']
  });
  register({
    shape: 'send-react-node',
    width: 200,
    height: 84,
    component: SendNode,
    effect: ['data']
  });
  register({
    shape: 'start-react-node',
    width: 90,
    height: 40,
    component: StartComp
  });
  register({
    shape: 'end-react-node',
    width: 80,
    height: 40,
    component: EndComp
  });

  Graph.registerNode(
    'event',
    {
      inherit: 'circle',
      attrs: {
        body: {
          strokeWidth: 2,
          stroke: '#5F95FF',
          fill: '#FFF'
        }
      },
      tools: [
        {
          name: 'button-remove',
          args: {
            x: '100%',
            y: 0,
            offset: { x: -10, y: 10 }
          }
        }
      ]
    },
    true
  );

  Graph.registerNode(
    'activity',
    {
      inherit: 'rect',
      markup: [
        {
          tagName: 'rect',
          selector: 'body'
        },

        {
          tagName: 'image',
          selector: 'img'
        },
        {
          tagName: 'text',
          selector: 'label'
        }
      ],
      attrs: {
        body: {
          rx: 6,
          ry: 6,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
          strokeWidth: 1
        },
        img: {
          x: 6,
          y: 6,
          width: 16,
          height: 16,
          'xlink:href':
            'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*pwLpRr7QPGwAAAAAAAAAAAAAARQnAQ'
        },
        label: {
          fontSize: 12,
          fill: '#262626'
        }
      }
    },
    true
  );

  Graph.registerNode(
    'gateway',
    {
      inherit: 'polygon',
      attrs: {
        body: {
          refPoints: '0,10 10,0 20,10 10,20',
          strokeWidth: 2,
          stroke: '#5F95FF',
          fill: '#EFF4FF'
        },
        label: {
          text: '+',
          fontSize: 40,
          fill: '#5F95FF'
        }
      }
    },
    true
  );
  Graph.registerEdge(
    'bpmn-edge2',
    {
      inherit: 'edge',
      attrs: {
        line: {
          // stroke: '#00FFFFFF',
          stroke: 'rgba(255,0,0,0)',
          strokeWidth: 2
        }
      }
    },
    true
  );
  Graph.registerEdge(
    'bpmn-edge',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#A2B1C3',
          strokeWidth: 2
        }
      }
    },
    true
  );
};

export { defineRegisterNode };
