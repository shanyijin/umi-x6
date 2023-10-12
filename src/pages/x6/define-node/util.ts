import { getUuid } from '@/utils/pageUtil';
import { notification } from 'antd';

import type { Cell, Graph, Node } from '@antv/x6';

export type BranchesType = {
  ids: string[];
  name: string;
  nextNodesWidth: number;
  nextNodesHeight: number;
  priority: number;
  lastCondition: boolean;
};

/** 获取一个分支内的条件节点尺寸 */
function getNodesSize(graph: Graph, ids: string[]) {
  return ids.reduce(
    (obj: { height: number; width: number }, nodeId) => {
      const cell = graph.getCellById(nodeId);
      if (!cell || !graph) {
        notification.error({
          message: '节点异常'
        });
        return obj;
      }
      if (!graph?.isNode(cell)) {
        return obj;
      }
      const size = cell.getSize();
      return {
        height: size.height + 80 + obj.height,
        width: size.width > obj.width ? size.width : obj.width
      };
    },
    { height: 0, width: 0 }
  );
}

/** 获取分支的宽高尺寸 */
function getMaxSizeBranch(branches: BranchesType[]) {
  const branchItemSize = branches.reduce(
    (obj, val) => {
      return {
        height: val.nextNodesHeight > obj.height ? val.nextNodesHeight : obj.height,
        width: val.nextNodesWidth + obj.width + 80
      };
    },
    { height: 0, width: 0 }
  );
  return branchItemSize;
}

/** 递归获取分支的某几段条件下的待删除节点 */
function getRemoveNodes(graph: Graph, branches: BranchesType[]) {
  const removes: Cell[] = [];
  function eachFn(val: BranchesType) {
    val.ids.forEach((id) => {
      const reNode = graph.getCellById(id);
      removes.push(reNode);
      if (reNode.shape === 'branch-react-node') {
        const branchData = reNode.getData();
        branchData?.branches?.forEach(eachFn);
      }
    });
  }
  branches.forEach(eachFn);
  return removes;
}

/** 后续节点移动函数 */
function moveDownNextNode(
  graph: Graph,
  newNextNodes: Cell<Cell.Properties>[],
  defineHeight: number
) {
    newNextNodes.forEach((cell) => {
        if (graph.isNode(cell)) {
          const nodePosition = cell.position();
          const nodePositionY = nodePosition?.y + 80 + defineHeight;
          cell.position(nodePosition.x, nodePositionY);
        }
      });
    }
    
    /** 普通节点获取前置分支节点  */
    function getBranchNode(graph: Graph, node: Node) {
      // 筛选出上游条件节点,仅支持一个节点
      const branchNodes = graph
        ?.getPredecessors(node)
        .filter((current) => current.prop('shape') === 'branch-react-node');
      // 返回包含当前节点信息的分支
      return branchNodes.find((item) => {
        const branchData = item?.data?.branches || [];
        return branchData.find((branchItem: BranchesType) => branchItem?.ids?.includes(node.id || ''));
      });
    }
    
    /** 分支获取后续节点，不包括分支内的节点  */
    function nextNeedMoveNodes(
      graph: Graph,
      prevNeighbor: Node<Node.Properties>,
      branches: BranchesType[]
    ) {
      return graph?.getSuccessors(prevNeighbor).filter((currentNode) => {
        const nextId = currentNode.prop('id');
        return !branches.find((item) => item?.ids?.includes(nextId || ''));
      });
    }
    
    /**
     * @param node 所在条件列的任意一节点
     * 维护所有分支data信息，得到分支尺寸信息
     */
    function branchDataHandle(
      graph: Graph,
      node: Node,
      state: {
        status: 'add' | 'deleted' | 'update';
        // 新增、删除指定节点id
        newNodeId?: string;
      }
    ) {
      const preBranchNode = getBranchNode(graph, node);
      const { status, newNodeId } = state;
    
      if (preBranchNode && graph.isNode(preBranchNode)) {
        const predBranchNodeData = preBranchNode.getData();
        const preBranchData: BranchesType[] = predBranchNodeData?.branches;
        // 将节点信息维护进分支中
        const newBranchData = preBranchData.map((item) => {
          if (item.ids.includes(node.id)) {
            const newIds = item.ids.reduce((idArr: string[], id) => {
              if (status === 'update') {
                return [...idArr, id];
              }
              /* 新增的情况，当前位置插入新的id */
              if (status === 'add' && id === node.id && newNodeId) {
                return [...idArr, id, newNodeId];
              }
              /* 删除指定id */
              if (status === 'deleted' && id === newNodeId) {
                return [...idArr];
              }
              return [...idArr, id];
            }, []);
            const newSize = getNodesSize(graph, newIds);
            return {
              ...item,
              ids: newIds,
              nextNodesHeight: newSize.height,
              nextNodesWidth: newSize.width
            };
          }
          return item;
        });
        // 分支的 Data 和 Size
        const branchItemSize = getMaxSizeBranch(newBranchData);
        preBranchNode
          .setSize({
            // padding 40 + 20 + 最高的分支
            height: 40 + 20 + branchItemSize.height,
            width: branchItemSize.width
          })
          .setData(
            {
              ...predBranchNodeData,
              branches: newBranchData
            },
            {
              overwrite: true
            }
          );
        // 更新前一个分支信息
        const preCurrentBranchNode = getBranchNode(graph, preBranchNode);
        if (preCurrentBranchNode && graph.isNode(preCurrentBranchNode)) {
          branchDataHandle(graph, preBranchNode, {
            status: 'update'
          });
        }
      }
    }
    
    /**
     * 维护分支节点信息，
     * 1、分支节点维护，调整位置
     * 2、后续节点的位置计算
     * 3、分支内部节点位置计算，重新计算条件的 priority
     */
    
    function branchHandle(graph: Graph, branchNode: Node) {
      const neighborNodes = graph?.getNeighbors(branchNode);
      // 前序节点中的邻居节点是前一个节点
      const preNode = neighborNodes.find((cell) => graph.isPredecessor(branchNode, cell));
      // 前置节点位置
      const prePosition = preNode && graph.isNode(preNode) ? preNode?.getPosition() : { x: 0, y: 0 };
      // 前置节点大小
      const preSize = preNode && graph.isNode(preNode) ? preNode?.getSize() : { width: 0, height: 0 };
    
      // 分支节点数据
      const predBranchNodeData = branchNode.getData();
      const preBranchData: BranchesType[] = predBranchNodeData?.branches;
      const branchItemSize = getMaxSizeBranch(preBranchData);
      // 1、修正分支位置，宽高
      branchNode.setPosition({
        x: prePosition?.x + (preSize.width - branchItemSize.width) / 2,
        y: prePosition.y + preSize.height + 80
      });
      const newBranchPosition = branchNode.getPosition();    
      
      let sumConditionWidth = (280 - 200) / 2;
      preBranchData.forEach((itemData) => {
        const { ids, nextNodesWidth, priority } = itemData;
        let sumConditionHight = 70;
        ids?.forEach((id: string) => {
          const currentNode = graph.getCellById(id);
          if (currentNode && graph.isNode(currentNode)) {
            const currentSize = currentNode.getSize();
            // 计算条件节点和当前节点的差值
            const offsetWidth = (nextNodesWidth - currentSize.width) / 2;
            currentNode
              .setPosition({
                x: newBranchPosition.x + sumConditionWidth + offsetWidth,
                y: newBranchPosition.y + sumConditionHight
              })
              .setData({
                priority
              });
            sumConditionHight += currentSize.height + 80;
            /* 如果当前节点是一个分支节点,分子节点中的子节点也需要移动 */
            if (currentNode.shape === 'branch-react-node') {
              branchHandle(graph, currentNode);
            }
          }
        });
        sumConditionWidth += nextNodesWidth + 80;
      });
    }
    
    /**
     * 图位置重排逻辑
     */
    function graphRedraw(graph: Graph, node: Node) {
      const neighborNodes = graph?.getNeighbors(node);
      if (node.shape === 'branch-react-node') {
        branchHandle(graph, node);
        const preBranchData: BranchesType[] = node.getData()?.branches;
        // 获取分支下一个节点
        const nextNode = nextNeedMoveNodes(graph, node, preBranchData).find((currentNode) =>
          graph.isNeighbor(node, currentNode)
        );
        if (nextNode && graph.isNode(nextNode)) {
          graphRedraw(graph, nextNode);
        }
      } else {
        // 前序节点中的邻居节点是前一个节点
        const preNode = neighborNodes.find((cell) => graph.isPredecessor(node, cell));
        // 前置节点位置
        const prePosition = preNode && graph.isNode(preNode) ? preNode?.getPosition() : { x: 0, y: 0 };
        // 前置节点大小
        const preSize = preNode && graph.isNode(preNode) ? preNode?.getSize() : { width: 0, height: 0 };
        // 当前节点尺寸
        const currentSize = node.getSize();
        node.setPosition({
          x: prePosition?.x + (preSize.width - currentSize.width) / 2,
          y: prePosition.y + preSize.height + 80
        });
        // 普通节点的后续节点
        const nextNode = neighborNodes.find((cell) => graph.isSuccessor(node, cell));
        if (nextNode && graph.isNode(nextNode)) {
          graphRedraw(graph, nextNode);
        }
      }
    }
    /**
     * 整个图需要自上而下重绘，
     * 如果后续是分支，当前是普通节点或后续分支节点不在本分支节点的data中，调用方法branchHandle
     * 不是分支就一个个正常排序，主干永远只有一条线，排完即止
     */
    function graphRearrangement(graph: Graph) {
      const nodes = graph.getNodes();
      const startNode = nodes.find((cell) => cell.shape === 'start-react-node');
      if (!startNode) {
        return notification.error({
          message: '节点构建异常'
        });
      }
      graphRedraw(graph, startNode);
    }
    
    /**
     * 新增节点后续逻辑，删线、加线、后续节点下移
     * 此操作不含分支节点逻辑
     */
    function processingHandle(
      graph: Graph,
      node: Node,
      other: {
        newShape: string;
        newNodeId: string;
        moveHeight: number;
      }
    ) {
      const { newShape, newNodeId, moveHeight } = other;
      const topData = node.getData();
      const nextNodes = graph?.getSuccessors(node);
      // 有后续节点，得维护后续节点线条
      if (nextNodes.length) {
        const nextNode = nextNodes.find((itemNode) => graph.isNeighbor(node, itemNode));
        if (nextNode && graph.isNode(nextNode)) {
          const outEdges = graph?.getOutgoingEdges(node);
          // 找到节点的输出边（普通节点只会有一条边，分支节点才会有多条边）
          const defectEdge = outEdges?.filter((edge) => edge.shape === newShape);
          if (defectEdge?.length && defectEdge.length === 1) {
            graph?.removeEdge(defectEdge[0]);
          }
          // 添加之后一条线
          graph.addEdge({
            id: getUuid(),
            shape: newShape,
            zIndex: 0,
            source: newNodeId,
            target: nextNode.id
          });
        }
        let newNextNodes = nextNodes;
        // 在分支节点后新增，排除分支节点内部的其他子节点
        if (node.prop('shape') === 'branch-react-node') {
          newNextNodes = nextNodes.filter((currentNode) => {
            const nextId = currentNode.prop('id');
            return !topData.branches.find((item: BranchesType) => item?.ids?.includes(nextId || ''));
          });
        }
        // 所有节点整体下移
        moveDownNextNode(graph, newNextNodes, moveHeight);
      }
      // 添加之前的一条线
      graph.addEdge({
        id: getUuid(),
        zIndex: 0,
        shape: newShape,
        source: node.id,
        target: newNodeId
      });
    }
    
    /** 新增普通节点 */
    export function defineAddNode(
      graph: Graph,
      node: Node,
      nodeMeta: {
        shape: string;
        width: number;
        height: number;
      } & { [x in string]: any }
    ) {
      graph.batchUpdate(() => {
        // 获取当前数据
        const topData = node.getData();
        const newNodeId = getUuid();
        const position = node.prop('position');
        // 获取当前点击节点的 zIndex
        const topZIndex = node.getZIndex() ?? 2;
        // 获取当前节点尺寸
        const topSize = node.prop('size');
        if (position && graph && topSize) {
          const x = position?.x + (topSize.width - 200) / 2;
          const y = position?.y + topSize?.height + 80;
          const isCondition = !!topData?.isCondition;
          graph?.addNode({
            x,
            y,
            id: newNodeId,
            zIndex: topZIndex,
            data: {
              isCondition: isCondition
            },
            ...nodeMeta
          });
          processingHandle(graph, node, {
            newShape: isCondition ? 'bpmn-edge2' : 'bpmn-edge',
            newNodeId: newNodeId,
            moveHeight: nodeMeta.height
          });
          // 处在条件下的节点
          if (isCondition) {
            const preBranchNode = getBranchNode(graph, node);
            if (preBranchNode && graph.isNode(preBranchNode)) {
              branchDataHandle(graph, node, {
                status: 'add',
                newNodeId: newNodeId
              });
              graphRearrangement(graph);
            }
          }
        }
      });
    }
    
    // 删除普通节点
    export function defineDeletedNode(graph: Graph, node: Node) {
      graph.batchUpdate(() => {
        // 获取当前节点尺寸
        const topSize = node.prop('size');
        // 获取当前节点id
        const topId = node.prop('id');
    
        // 获取邻居节点
        const neighborNodes = graph?.getNeighbors(node);
        if (neighborNodes.length) {
          // 前序节点中的邻居节点是前一个节点
          const preNode = neighborNodes.find((cell) => graph.isPredecessor(node, cell));
          const nextNode = neighborNodes.find((cell) => graph.isSuccessor(node, cell));
          // 前后节点不能是开始和结束
          if (
            preNode?.prop('shape') === 'start-react-node' &&
            nextNode?.prop('shape') === 'end-react-node'
          ) {
            return notification.error({
              message: '审批节点至少保留一个，请添加合适节点后删除'
            });
          }
          const isCondition = node?.data?.isCondition;
          // 有后续节点 还需要连线操作
          if (nextNode && preNode) {
            const topZIndex = node.getZIndex() ?? 2;
            graph.addEdge({
              id: getUuid(),
              shape: isCondition ? 'bpmn-edge2' : 'bpmn-edge',
              source: preNode.id,
              zIndex: topZIndex - 1,
              target: nextNode.id
            });
          }
          graph?.removeCells([node]);
          if (preNode && graph.isNode(preNode)) {
            // 如果是条件节点，还需更新分支信息
            if (isCondition) {
              // 获取条件中任意一个节点，这儿取前一个节点
              branchDataHandle(graph, preNode, { status: 'deleted', newNodeId: topId });
              graphRearrangement(graph);
            } else {
              const nextNodes = graph.getSuccessors(preNode);
              moveDownNextNode(graph, nextNodes, -160 - topSize!.height);
            }
          }
        }
      });
    }
    
    /** 复制条件 */
    export function copyCondition(graph: Graph, node: Node) {
      graph.batchUpdate(() => {
        const branchNode = getBranchNode(graph, node);
        const copyEdges: any[] = [];
        const copyNodes: any[] = [];
    
        if (branchNode && graph.isNode(branchNode)) {
          const idsFn = (
            BranchId: string,
            copyBranchData: BranchesType,
            dataIds: string[],
            // 循环层级，保证后生成的节点层级大于之前生成的节点
            loopIndex = 1
          ) => {
            dataIds.forEach((id, index) => {
              // 被复制节点
              const copyNode = graph.getCellById(copyBranchData.ids[index]);
              // 被链接节点id，第一个得连到分支上
              const prevNodeId = index === 0 ? BranchId : dataIds[index - 1];
              if (copyNode && graph.isNode(copyNode)) {
                const copyData = copyNode.getData();
                const copySize = copyNode.getSize();
    
                // 如果当前被复制节点是分支，还需要复制分支的子节点
                if (copyNode.shape === 'branch-react-node') {
                    const newCopyBranchData = copyData.branches.map((copyDataItem: BranchesType) => {
                        const newBanachCopeIds = Array.from({ length: copyDataItem.ids.length }, getUuid);
                        idsFn(id, copyDataItem, newBanachCopeIds, loopIndex + 1);
                        return {
                          ...copyDataItem,
                          ids: newBanachCopeIds
                        };
                      });
                      copyNodes.push({
                        id: id,
                        shape: copyNode.shape,
                        zIndex: (copyNode.zIndex || 1) + loopIndex,
                        width: copySize.width,
                        height: copySize.height,
                        data: {
                          ...copyData,
                          branches: newCopyBranchData
                        }
                      });
                    } else {
                      copyNodes.push({
                        id: id,
                        shape: copyNode.shape,
                        zIndex: (copyNode.zIndex || 1) + loopIndex,
                        width: copySize.width,
                        height: copySize.height,
                        data: {
                          ...copyData,
                          name: '复制条件'
                        }
                      });
                    }
                    copyEdges.push({
                      id: getUuid(),
                      shape: 'bpmn-edge2',
                      zIndex: 0,
                      source: prevNodeId,
                      target: id
                    });
                  }
                });
              };
        
              const branchData: { branches: BranchesType[] } = branchNode?.getData();
        
              const newBranchData = branchData.branches
                .reduce((arr: BranchesType[], val, currentIndex) => {
                  arr.push(val);
                  // 获取需要复制的条件列ids，额外添加新的节点
                  if (val.ids.includes(node.id)) {
                    const newIds = Array.from({ length: val.ids.length }, getUuid);
                    arr.push({
                        ...val,
                        ids: newIds,
                        priority: currentIndex + 1
                      });
                      idsFn(branchNode.id, val, newIds);
                    }
                    return arr;
                  }, [])
                  .sort((item) => item.priority)
                  .map((item, index) => ({
                    ...item,
                    priority: index
                  }));
          
                branchNode.setData(
                  {
                    ...branchData,
                    branches: newBranchData
                  },
                  {
                    overwrite: true
                  }
                );
                graph.addNodes(copyNodes);
                graph.addEdges(copyEdges);
                branchDataHandle(graph, node, { status: 'update' });
                graphRearrangement(graph);
              }
            });
          }
          
          // 新增条件节点，高度计算、节点计算、分支节点高度计算
          export function addCondition(graph: Graph, node: Node) {
            graph.batchUpdate(() => {
              const data: { branches: BranchesType[] } = node.getData();
              // 获取当前点击节点的 位置
              const position = node.prop('position');
              // 获取当前点击节点的 id
              const topId = node.prop('id');
              // 获取当前节点尺寸
              const topSize = node.prop('size');
              // 当前分支信息
              const branches = data.branches;
              // 新增节点
              if (branches.length && graph && position && topSize) {
                const newId = getUuid();
                const newBranches = [...branches];
                const lastBranch = newBranches.pop() as BranchesType;
                const lastPriority = lastBranch!.priority;
                const branchesData = [
                  ...newBranches,
                  {
                    ids: [newId],
                    name: '新增条件',
                    nextNodesHeight: 160,
                    nextNodesWidth: 200,
                    priority: lastPriority,
                    lastCondition: false
                  },
                  {
                    ...lastBranch,
                    priority: lastPriority + 1
                  }
                ];
                node.setData(
                  {
                    branches: branchesData
                  },
                  {
                    overwrite: true
                  }
                );

                graph.addNode({
                  id: newId,
                  shape: 'condition-react-node',
                  zIndex: 2,
                  width: 200,
                  height: 80,
                  data: {
                    name: '新增条件',
                    isCondition: true,
                    lastCondition: false,
                    priority: lastPriority
                  }
                });
                graph.addEdge({
                  id: getUuid(),
                  shape: 'bpmn-edge2',
                  zIndex: 0,
                  source: topId,
                  target: newId
                });
          
                // 取一个 prevNeighbor 下的任意节点，
                const arbitrarilyNodeId = newBranches[0].ids[0];
                const arbitrarilyNode = graph.getCellById(arbitrarilyNodeId);
                if (arbitrarilyNode && graph.isNode(arbitrarilyNode)) {
                  branchDataHandle(graph, arbitrarilyNode, {
                    status: 'update'
                  });
                }
                graphRearrangement(graph);
              }
            });
          }
          
          // 删除条件节点，计算高度、合并删除、布局重新计算
          export function removeCondition(graph: Graph, node: Node) {
            graph.batchUpdate(() => {
              // 1、获取条件节点上一个节点，是分支节点
              const neighborNodes = graph.getNeighbors(node);
              const prevNeighbor = neighborNodes.find((itemNode) => graph.isPredecessor(node, itemNode));
              // 2、删除节点（是否删除 prevNeighbor？）
              if (!prevNeighbor || !graph.isNode(prevNeighbor)) {
                return notification.error({
                  message: '上级节点非分支节点，无法删除'
                });
              }
              // 维护在分支上的条件信息，
              const prevNeighborData: { branches: BranchesType[] } = prevNeighbor.getData();
              const branches = prevNeighborData.branches;
              if (branches.length) {
                // 获取当前点击节点的 id
                const topId = node.prop('id');
                // 获取分支节点尺寸
                const topPrevSize = prevNeighbor.prop('size');
                // 获取分支节点 id
                const topPrevId = prevNeighbor.prop('id');
                // 获取分支节点位置
                const position = prevNeighbor.prop('position');
      if (topPrevSize && position) {
        // 3、 当分支数量小于等于 2 需要删掉整个分支
        if (branches.length <= 2) {
          const prePrevNeighborNodes = graph?.getNeighbors(prevNeighbor);
          // 分支后续需要移动的节点
          const nextBranchNodes = nextNeedMoveNodes(graph, prevNeighbor, branches);

          // 获取分支节点的前一个节点，重新连线
          const preNode = prePrevNeighborNodes.find((cell) =>
            graph.isPredecessor(prevNeighbor, cell)
          );
          if (preNode && graph.isNode(preNode)) {
            // 找到分支之前的后一个节点，把它连上
            const nextNode = nextBranchNodes.find((itemNode) =>
              graph.isNeighbor(prevNeighbor, itemNode)
            );
            // 需要删除的所有条件节点
            const nodeReducer = getRemoveNodes(graph, branches);
            graph.removeCells([...nodeReducer, prevNeighbor]);

            if (nextBranchNodes.length && nextNode) {
              graph.addEdge({
                id: getUuid(),
                shape: 'bpmn-edge',
                zIndex: 0,
                source: preNode.id,
                target: nextNode.id
              });
            }
            // 维护前一个节点 preNode 所在分支的信息（可能是不存在的分支）
            branchDataHandle(graph, preNode, {
              status: 'deleted',
              newNodeId: topPrevId
            });
          }
        } else {
          // 4、当分支数量大于 2，需要删掉一整条的条件节点
          const needDeleteConditionNodes = branches.find((branchItem) =>
            branchItem.ids.includes(topId || '')
          );
          if (!needDeleteConditionNodes) {
            return;
          }
          // 获取删除的节点（待递归）
          const needDeleteNodes = getRemoveNodes(graph, [needDeleteConditionNodes]);

          // 删除节点
          graph.removeCells([...needDeleteNodes]);

          const newBranches = branches
            .filter((branchItem) => !branchItem.ids.includes(topId || ''))
            .sort((item) => item.priority)
            .map((item, index) => ({        
                ...item,
                priority: index
              }));
  
            prevNeighbor.setData(
              {
                branches: newBranches
              },
              {
                overwrite: true
              }
            );
            // 取一个 prevNeighbor 下的任意节点，
            const arbitrarilyNodeId = newBranches[0].ids[0];
            const arbitrarilyNode = graph.getCellById(arbitrarilyNodeId);
            if (arbitrarilyNode && graph.isNode(arbitrarilyNode)) {
              branchDataHandle(graph, arbitrarilyNode, {
                status: 'update'
              });
            }
          }
        }
        graphRearrangement(graph);
      }
    });
  }
  
  // 新增分支
  export function addBranch(graph: Graph, node: Node) {
    graph.batchUpdate(() => {
      const currentData = node.getData();
      const currentSize = node.size();
      const currentPosition = node.position();
      const branchPosition = {
        x: currentPosition.x + (currentSize.width - 560) / 2,
        y: currentPosition.y + currentSize.height + 80
      };
      const branchId = getUuid();
      const conditionId1 = getUuid();
      const conditionId2 = getUuid();
  
      const addNodes = [
        {
          id: branchId,
          shape: 'branch-react-node',
          zIndex: 2,
          width: 560,
          height: 220,
          position: branchPosition,
          data: {
            isCondition: !!currentData?.isCondition,
            branches: [
              {
                ids: [conditionId1],
                name: '条件1',
                nextNodesHeight: 160,
                nextNodesWidth: 200,
                priority: 0,
                lastCondition: false
              },
              {
                ids: [conditionId2],
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
          id: conditionId1,
          shape: 'condition-react-node',
          zIndex: 5,
          width: 200,
          height: 80,
          position: {
            x: branchPosition.x + (280 - 200) / 2,
            y: branchPosition.y + 70
          },
          data: {
            name: '条件1',
            isCondition: true,
            lastCondition: false,
            priority: 0
          }
        },
        {
          id: conditionId2,
          shape: 'condition-react-node',
          zIndex: 5,
          width: 200,
          height: 80,
          position: {
            x: branchPosition.x + (280 - 200) / 2 + 280,
            y: branchPosition.y + 70
          },
          data: {
            isCondition: true,
            name: '其他情况进入此流程',
            lastCondition: true,
            priority: 1
          }
        }
      ];
      const addEdges = [
        {
          id: getUuid(),
          shape: 'bpmn-edge2',
          zIndex: 0,
          source: branchId,
          target: conditionId1
        },
        {
          id: getUuid(),
          shape: 'bpmn-edge2',
          zIndex: 0,
          source: branchId,
          target: conditionId2
        }
      ];
      graph.addNodes(addNodes).addEdges(addEdges);
  
      processingHandle(graph, node, {
        newShape: node?.data?.isCondition ? 'bpmn-edge2' : 'bpmn-edge',
        newNodeId: branchId,
        moveHeight: 220
      });
  
      branchDataHandle(graph, node, {
        status: 'add',
        newNodeId: branchId
      });
      graphRearrangement(graph);
    });
  }