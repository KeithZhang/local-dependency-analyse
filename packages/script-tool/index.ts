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
// const rootDir = '/Users/keith/project/qianmi/invite-card/src/qmkits'

// const fileName = rootDir + '/app.wpy'
// const fileContent = readFileSync(fileName)
// const node = ts.createSourceFile('x.ts', fileContent.toString(), ts.ScriptTarget.ES2015)

const commonLib = ['wepy', 'wepy-async-function', 'dayjs', 'immutable', 'js-base64', 'events'];

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

const transform = (rootDir: string) => {
  console.log('rootDir...', rootDir);
  const dir = readdirSync(rootDir, { withFileTypes: true });
  for (const item of dir) {
    console.log('dir...', item);
    if (item.isFile()) {
      console.log('file...', item.name);
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

        console.log('suffixIndex...', suffixIndex);
        const name = item.name.substring(0, suffixIndex);
        console.log('name...', name);
        const prefix = rootDir.substr(rootDir.indexOf('/src') + 5);
        const nodeId = prefix ? prefix + '/' + name : name;
        console.log('prefix...', prefix);
        console.log('nodeId...', nodeId);
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

transform(rootDir);

const customePath =
  '/Users/keith/project/mine/local-dependency-analyse/packages/client/src/components/Analyse/data.json';

// path.resolve(__dirname, "data.json")
fs.writeFileSync(customePath, JSON.stringify(graphinData));

// console.log('graphin data...', graphinData)
// console.log('graphin data node length...', graphinData.nodes.length)
