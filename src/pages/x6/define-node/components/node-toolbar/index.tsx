import { useCallback } from 'react';
import type { DefineNodePropsType } from '../..';
import { copyCondition, defineAddNode, defineDeletedNode, removeCondition } from '../../util';

const NodeToolbar = (props: DefineNodePropsType) => {
  const { node } = props;
  const graph = node?.model?.graph;

  // 获取当前节点数据
  const topNodeData = node.getData();
  // 获取当前节点类型
  const topShape: string = node.prop('shape') || 'examine-react-node';
  // 获取当前节点尺寸
  const topSize = node.prop('size');

  const copy = useCallback(() => {
    if (graph && topSize) {
      if (topShape === 'condition-react-node') {
        // 条件节点删除有别于普通节点
        copyCondition(graph, node);
        return;
      }
      defineAddNode(graph, node, {
        height: topSize?.height,
        width: topSize?.width,
        shape: topShape,
        data: {
          ...topNodeData
        }
      });
    }
  }, [graph, node, topNodeData, topShape, topSize]);

  const deleted = useCallback(() => {
    if (graph) {
      if (topShape === 'condition-react-node') {
        // 条件节点删除有别于普通节点
        removeCondition(graph, node);
        return;
      }
      defineDeletedNode(graph, node);
    }
  }, [graph, topShape, node]);

  return (
    <>
      <img
        src="https://img.alicdn.com/imgextra/i1/O1CN012TTXxw1DrheYgdA5E_!!6000000000270-55-tps-14-14.svg"
        onClick={(e) => {
          e.stopPropagation();
          copy();
        }}
      />
      <img
        src="https://img.alicdn.com/imgextra/i4/O1CN01ElGIdh1mkqEtMw6s4_!!6000000004993-55-tps-14-14.svg"
        onClick={(e) => {
          e.stopPropagation();
          deleted();
        }}
      />
    </>
  );
};

export default NodeToolbar;