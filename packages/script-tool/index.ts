import fs from 'fs';
import path from 'path';
import ts from 'typescript';

interface GraphinNode {
  id: string;
  label: string;
  data: {
    id: string;
    label: string;
    type: string;
    properties?: Array<any>;
  };
  shape: string;
  style: object;
}

interface GraphinEdge {
  source: string;
  target: string;
  label: string;
  data: {
    label: string;
    source: string;
    target: string;
    properties?: Array<any>;
  };
}

interface GraphinData {
  nodes: Array<GraphinNode>;
  edges: Array<GraphinEdge>;
}

const { readFileSync, readdirSync } = fs;

const rootDir = '/Users/keith/project/qianmi/invite-card/src';
const componentsRootDir =
  '/Users/keith/project/qianmi/invite-card/src/components';
// const rootDir = '/Users/keith/project/qianmi/invite-card/src/qmkits'

// const fileName = rootDir + '/app.wpy'
// const fileContent = readFileSync(fileName)
// const node = ts.createSourceFile('x.ts', fileContent.toString(), ts.ScriptTarget.ES2015)

const commonLib = [
  'wepy',
  'wepy-async-function',
  'dayjs',
  'immutable',
  'js-base64',
  'events',
];

let graphinData: GraphinData = {
  nodes: commonLib.map((v) => ({
    id: v,
    shape: 'CircleNode',
    label: v,
    data: {
      id: v,
      label: v,
      type: 'company',
    },
    style: {},
  })),
  edges: [],
};

let componentsGraphinData: { nodes: Array<GraphinNode> } = {
  nodes: [],
};

const transformComponentsNode = (rootDir: string) => {
  console.log('transformComponentsNode rootDir...', rootDir);
  const dir = readdirSync(rootDir, { withFileTypes: true });
  for (const item of dir) {
    // console.log('dir...', item);
    if (item.isFile()) {
      // console.log('file...', item.name);
      const wpyFileIndex = item.name.indexOf('.wpy');
      const tsFileIndex = item.name.indexOf('.ts');
      const jsFileIndex = item.name.indexOf('.js');
      const wxsFileIndex = item.name.indexOf('.wxs');

      if (
        wpyFileIndex != -1 ||
        tsFileIndex != -1 ||
        wxsFileIndex != -1 ||
        jsFileIndex != -1
      ) {
        let suffixIndex = 0;
        if (wpyFileIndex != -1) {
          suffixIndex = wpyFileIndex;
        }
        if (tsFileIndex != -1) {
          suffixIndex = tsFileIndex;
        }
        if (jsFileIndex != -1) {
          suffixIndex = jsFileIndex;
        }
        if (wxsFileIndex != -1) {
          suffixIndex = item.name.length;
        }

        // console.log('suffixIndex...', suffixIndex);
        const name = item.name.substring(0, suffixIndex);
        // console.log('name...', name);
        const prefix = rootDir.substr(rootDir.indexOf('/src') + 5);
        const nodeId = prefix ? prefix + '/' + name : name;
        // console.log('prefix...', prefix);
        // console.log('nodeId...', nodeId);
        componentsGraphinData.nodes.push({
          id: nodeId,
          shape: 'CircleNode',
          label: nodeId,
          data: {
            id: nodeId,
            label: nodeId,
            type: 'company',
          },
          style: {},
        });
      }
    }

    if (item.isDirectory()) {
      // console.log('dir name...', item.name)
      transformComponentsNode(rootDir + '/' + item.name);
    }
  }
};

const transform = (rootDir: string) => {
  // console.log('rootDir...', rootDir);
  const dir = readdirSync(rootDir, { withFileTypes: true });
  for (const item of dir) {
    // console.log('dir...', item);
    if (item.isFile()) {
      // console.log('file...', item.name);
      const wpyFileIndex = item.name.indexOf('.wpy');
      const tsFileIndex = item.name.indexOf('.ts');
      const jsFileIndex = item.name.indexOf('.js');
      const wxsFileIndex = item.name.indexOf('.wxs');

      if (
        wpyFileIndex != -1 ||
        tsFileIndex != -1 ||
        wxsFileIndex != -1 ||
        jsFileIndex != -1
      ) {
        let suffixIndex = 0;
        if (wpyFileIndex != -1) {
          suffixIndex = wpyFileIndex;
        }
        if (tsFileIndex != -1) {
          suffixIndex = tsFileIndex;
        }
        if (jsFileIndex != -1) {
          suffixIndex = jsFileIndex;
        }
        if (wxsFileIndex != -1) {
          suffixIndex = item.name.length;
        }

        // console.log('suffixIndex...', suffixIndex);
        const name = item.name.substring(0, suffixIndex);
        // console.log('name...', name);
        const prefix = rootDir.substr(rootDir.indexOf('/src') + 5);
        const nodeId = prefix ? prefix + '/' + name : name;
        // console.log('prefix...', prefix);
        // console.log('nodeId...', nodeId);
        graphinData.nodes.push({
          id: nodeId,
          shape: 'CircleNode',
          label: nodeId,
          data: {
            id: nodeId,
            label: nodeId,
            type: 'company',
          },
          style: {},
        });
        const fileContent = readFileSync(rootDir + '/' + item.name);
        // console.log('fileContent.toString()...', fileContent.toString())
        const node = ts.createSourceFile(
          'x.ts',
          fileContent.toString(),
          ts.ScriptTarget.ES2015
        );
        node.forEachChild((child: any) => {
          if (ts.SyntaxKind[child.kind] === 'ImportDeclaration') {
            // console.log('child...', child.moduleSpecifier.text)
            let targetId = child.moduleSpecifier.text;
            if (child.moduleSpecifier.text.indexOf('/') != -1) {
              targetId = path
                .resolve(rootDir, child.moduleSpecifier.text)
                .substr(rootDir.indexOf('/src') + 5);
            }

            graphinData.edges.push({
              source: nodeId,
              target: targetId,
              label: '',
              data: {
                label: '',
                source: nodeId,
                target: targetId,
              },
            });
          }
        });
      }
    }

    if (item.isDirectory()) {
      // console.log('dir name...', item.name)
      transform(rootDir + '/' + item.name);
    }
  }
};

let nodeTraceTree: any = {};

const nodeTrace = (
  nodeTraceTree: any,
  rootNodeId: string,
  subNodeId?: string
) => {
  const currentNodeId = subNodeId ? subNodeId : rootNodeId;
  const nodeList = graphinData.edges
    .filter((v) => v.target == currentNodeId)
    .map((v) => ({ id: v.source }));

  if (nodeList.length > 0) {
    nodeTraceTree[rootNodeId] = nodeTraceTree[rootNodeId]
      ? nodeTraceTree[rootNodeId].concat(nodeList)
      : nodeList;

    console.log('nodeList...', nodeList);
    nodeList.forEach((v) => {
      return nodeTrace(nodeTraceTree, rootNodeId, v.id);
    });
  }
};

transformComponentsNode(componentsRootDir);
transform(rootDir);
for (let node of componentsGraphinData.nodes) {
  console.log('node...', node);
  nodeTrace(nodeTraceTree, node.id);
}

console.log('nodeTraceTree...', JSON.stringify(nodeTraceTree));

// const customePath =
//   '/Users/keith/project/mine/local-dependency-analyse/packages/client/src/components/Analyse/data.json';
// fs.writeFileSync(customePath, JSON.stringify(nodeTraceTree));

const dataPath = path.resolve(__dirname, 'data.json');
fs.writeFileSync(dataPath, JSON.stringify(nodeTraceTree));

const analysisArray = Object.keys(nodeTraceTree)
  .map((k) => {
    const pageReferenceLength = nodeTraceTree[k].filter((v: any) =>
      v.id.startsWith('pages')
    ).length;
    return {
      id: k,
      pageReferenceLength,
    };
  })
  .sort((a, b) => a.pageReferenceLength - b.pageReferenceLength);
const analysisPath = path.resolve(__dirname, 'analysis.json');
fs.writeFileSync(analysisPath, JSON.stringify(analysisArray));

// console.log('graphin data...', graphinData.nodes.length)
// console.log('graphin data node length...', graphinData.nodes.length)
