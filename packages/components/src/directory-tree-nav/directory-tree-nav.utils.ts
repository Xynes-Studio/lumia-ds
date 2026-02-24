export type DirectoryTreeNode = {
  id: string;
  label: string;
  href?: string;
  children?: DirectoryTreeNode[];
};

const normalizeForCompare = (value: string) => value.trim().toLocaleLowerCase();

export const normalizeDirectoryName = (value: string) => value.trim();

const findNodeById = (
  nodes: DirectoryTreeNode[],
  nodeId: string,
): DirectoryTreeNode | null => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const nested = node.children ? findNodeById(node.children, nodeId) : null;
    if (nested) {
      return nested;
    }
  }

  return null;
};

export const getSiblingNodes = (
  nodes: DirectoryTreeNode[],
  parentId: string | null,
) => {
  if (parentId === null) {
    return nodes;
  }

  const parentNode = findNodeById(nodes, parentId);
  if (!parentNode) {
    return [];
  }

  return parentNode.children ?? [];
};

export const isDirectoryNameUniqueInSiblings = ({
  nodes,
  parentId,
  name,
}: {
  nodes: DirectoryTreeNode[];
  parentId: string | null;
  name: string;
}) => {
  const normalizedTarget = normalizeForCompare(name);
  if (!normalizedTarget) {
    return false;
  }

  const siblings = getSiblingNodes(nodes, parentId);
  return !siblings.some(
    (item) => normalizeForCompare(item.label) === normalizedTarget,
  );
};

const insertNodeRecursively = (
  nodes: DirectoryTreeNode[],
  parentId: string,
  newNode: DirectoryTreeNode,
): { nodes: DirectoryTreeNode[]; inserted: boolean } => {
  let inserted = false;

  const nextNodes = nodes.map((node) => {
    if (node.id === parentId) {
      inserted = true;
      return {
        ...node,
        children: [...(node.children ?? []), newNode],
      };
    }

    if (!node.children?.length) {
      return node;
    }

    const result = insertNodeRecursively(node.children, parentId, newNode);
    if (!result.inserted) {
      return node;
    }

    inserted = true;
    return {
      ...node,
      children: result.nodes,
    };
  });

  return { nodes: nextNodes, inserted };
};

export const insertDirectoryNode = ({
  nodes,
  parentId,
  newNode,
}: {
  nodes: DirectoryTreeNode[];
  parentId: string | null;
  newNode: DirectoryTreeNode;
}) => {
  if (parentId === null) {
    return [...nodes, newNode];
  }

  const result = insertNodeRecursively(nodes, parentId, newNode);
  return result.inserted ? result.nodes : nodes;
};

export const validateDirectoryName = ({
  nodes,
  parentId,
  rawName,
  maxNameLength,
}: {
  nodes: DirectoryTreeNode[];
  parentId: string | null;
  rawName: string;
  maxNameLength: number;
}) => {
  const normalizedName = normalizeDirectoryName(rawName);

  if (!normalizedName) {
    return {
      normalizedName,
      error: 'Directory name is required.',
    };
  }

  if (normalizedName.length > maxNameLength) {
    return {
      normalizedName,
      error: `Directory name must be ${maxNameLength} characters or fewer.`,
    };
  }

  if (
    !isDirectoryNameUniqueInSiblings({
      nodes,
      parentId,
      name: normalizedName,
    })
  ) {
    return {
      normalizedName,
      error: 'A directory with this name already exists in this location.',
    };
  }

  return {
    normalizedName,
    error: null,
  };
};
