export const dataDemo = {
    nodes: [
      {
        id: '0',
        shape: 'start-react-node',
        width: 90,
        height: 40,
        zIndex: 2,
        position: {
          x: 25,
          y: 20
        }
      },
      {
        id: '1',
        shape: 'examine-react-node',
        zIndex: 2,
        width: 200,
        height: 80,
        position: {
          x: -30,
          y: 140
        }
      },
      {
        id: '2',
        shape: 'bpmn-edge',
        source: '0',
        zIndex: 0,
        target: '1'
      },
      {
        id: 'id000branch-react-node',
        shape: 'branch-react-node',
        zIndex: 2,
        width: 560,
        height: 220,
        position: {
          x: -210,
          y: 300
        },
        data: {
          isCondition: false,
          branches: [
            {
              ids: ['condition-react-node-1'],
              name: '条件1',
              nextNodesHeight: 160,
              nextNodesWidth: 200,
              priority: 0,
              lastCondition: false
            },
            {
              ids: ['condition-react-node-2'],
              name: '其他情况',
              nextNodesHeight: 160,
              nextNodesWidth: 200,
              priority: 1,
              lastCondition: true
            }
          ]
        }
      },
      {
        id: 'condition-react-node-1',
        shape: 'condition-react-node',
        zIndex: 2,
        width: 200,
        height: 80,
        position: {
          x: -210 + (280 - 200) / 2,
          y: 300 + 70
        },
        data: {
          name: '条件1',
          isCondition: true,
          lastCondition: false,
          priority: 0
        }
      },
      {
        id: 'condition-react-node-2',
        shape: 'condition-react-node',
        zIndex: 2,
        width: 200,
        height: 80,
        position: {
          x: -210 + (280 - 200) / 2 + 280,
          y: 300 + 70
        },
        data: {
          name: '其他情况进入此流程',
          isCondition: true,
          lastCondition: true,
          priority: 1
        }
      },
  
      {
        id: 'bpmn-edge2-1',
        shape: 'bpmn-edge2',
        zIndex: 0,
        source: 'id000branch-react-node',
        target: 'condition-react-node-1'
      },
      {
        id: 'bpmn-edge2-2',
        shape: 'bpmn-edge2',
        zIndex: 0,
        source: 'id000branch-react-node',
        target: 'condition-react-node-2'
      },
  
      {
        id: '4',
        shape: 'bpmn-edge',
        zIndex: 0,
        source: '1',
        target: 'id000branch-react-node'
      },
      {
        id: '3',
        shape: 'end-react-node',
        zIndex: 2,
        position: {
          x: 30,
          y: 600
        }
      },
      {
        id: '5',
        shape: 'bpmn-edge',
        zIndex: 0,
        source: 'id000branch-react-node',
        target: '3'
      }
    ]
}
