import React from "react";

const CARD_WIDTH = 160;
const CARD_HEIGHT = 100;
const HORIZONTAL_GAP = 220;
const VERTICAL_GAP = 40;

let nodePositions = {};

const calculateSubtreeHeight = (node) => {
  if (!node.children || node.children.length === 0) {
    return CARD_HEIGHT;
  }

  const childrenHeights = node.children.map(calculateSubtreeHeight);
  return (
    childrenHeights.reduce((sum, h) => sum + h, 0) +
    (node.children.length - 1) * VERTICAL_GAP
  );
};

const renderTree = (tree, x = 0, y = 0, onSelect, totalHeight = 0) => {
  const currentId = tree.id;
  nodePositions[currentId] = {
    x,
    y,
    id: currentId,
    children: tree.children,
  };

  const children = tree.children || [];
  let offsetY = y - totalHeight / 2;

  return (
    <>
      <div
        key={currentId}
        className="absolute rounded-lg shadow-md bg-white p-3 border border-gray-300 cursor-pointer hover:bg-blue-50 transition"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          top: y,
          left: x,
          transform: "translate(0, -50%)",
        }}
        onClick={() => onSelect(currentId)}
      >
        <div
          className="text-sm font-semibold text-gray-800 text-center break-words overflow-hidden max-w-full truncate"
          title={tree.title}
        >
          {tree.title}
        </div>
        {tree.description && (
          <div
            className="text-xs text-gray-600 text-center break-words overflow-hidden max-w-full truncate"
            title={tree.description}
          >
          {tree.description}
          </div>
        )}

        {tree.createdAt && (
          <div className="text-[10px] text-gray-400 text-center">
            {new Date(tree.createdAt).toLocaleDateString()}
          </div>
        )}

        {tree.tags && tree.tags.length > 0 && (
          <div className="overflow-x-auto whitespace-nowrap no-scrollbar">
            <div className="inline-flex items-center rounded">
              {tree.tags.map((tag, index) => (
                <span
                key={index}
                className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"
                >
                {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {children.map((child) => {
        const subtreeHeight = calculateSubtreeHeight(child);
        const childX = x + HORIZONTAL_GAP;
        const childY = offsetY + subtreeHeight / 2;

        const rendered = renderTree(
          child,
          childX,
          childY,
          onSelect,
          subtreeHeight
        );

        offsetY += subtreeHeight + VERTICAL_GAP;

        return (
            <React.Fragment key={child.id}>
              {rendered}
            </React.Fragment>
          );      
      })}
    </>
  );
};

export const NoteTree = ({ tree, onSelect }) => {

  nodePositions = {};
  const totalTreeHeight = calculateSubtreeHeight(tree);
  const startX = 100;
  const startY = totalTreeHeight / 2 + 100;
  const renderedNodes = renderTree(tree, startX, startY, onSelect, totalTreeHeight);

  const allPositions = Object.values(nodePositions);
  const maxX = Math.max(...allPositions.map((pos) => pos.x)) + CARD_WIDTH + 100;
  const maxY = Math.max(...allPositions.map((pos) => pos.y)) + CARD_HEIGHT + 100;

  const lines = allPositions.flatMap((parent) => {
    if (!parent.children || parent.children.length === 0) return [];

    return parent.children.map((child) => {
      const childPos = nodePositions[child.id];
      if (!childPos) return null;

      const startX = parent.x + CARD_WIDTH;
      const startY = parent.y;
      const endX = childPos.x;
      const endY = childPos.y;
      const midX = (startX + endX) / 2;

      return (
        <path
          key={`${parent.id}-${child.id}`}
          d={`M${startX},${startY} C${midX},${startY} ${midX},${endY} ${endX},${endY}`}
          stroke="#c0c0c0"
          strokeWidth={1.5}
          fill="none"
        />
      );
    }).filter(Boolean);
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 overflow-auto no-scrollbar"
      style={{
        overflow: "auto",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        className="relative"
        style={{
          width: maxX,
          height: maxY,
        }}
      >
        <svg
          className="absolute top-0 left-0 z-0 pointer-events-none"
          style={{
            width: maxX,
            height: maxY,
          }}
        >
          {lines}
        </svg>
        {renderedNodes}
      </div>
    </div>
  );
};

export default NoteTree;