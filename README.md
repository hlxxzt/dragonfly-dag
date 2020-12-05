# dragonfly-dag

小蜻蜓 💗 小蝴蝶（ https://github.com/alibaba/butterfly ）

Dragonfly-dag 是以 Butterfly-dag 为原型，基于 Vue3 的全新实现。

![image](https://user-images.githubusercontent.com/1522365/101227185-f74cc380-36d1-11eb-886a-0e565a2ee442.png)

## Dragonfly-dag 的目标：

- 更好的可维护性和代码逻辑清晰度
- 更好的 Vue 整合开发体验
- 对原生JS、Vue2、React等提供支持

感谢小蝴蝶团队对这个项目的支持！

## 快速运行 demo：

如果使用 npm：

```shell script
npm i
npm run dev
```

如果使用 yarn：

```shell script
yarn install
yarn dev
```

## 核心组件

### 画布 `DragonflyCanvas`

#### 画布属性

| 属性              | 类型                               | 默认值         | 必填 | 支持双向绑定 | 说明                                                                                                  |
| ----------------- | ---------------------------------- | -------------- | ---- | ------------ | ----------------------------------------------------------------------------------------------------- |
| nodes             | `Array`                            | `[]`           | N    | Y            | 显示的节点，节点数据结构参见[节点信息](#节点信息-node)                                                |
| edges             | `Array`                            | `[]`           | N    | Y            | 显示的边，边数据结构参见[边信息](#边信息-edge)                                                        |
| zones             | `Array`                            | `[]`           | N    | Y            | 显示的区域，边数据结构参见[区域信息](#区域信息-edge)                                                        |
| layout             | `Object`                            | `{}`           | N    | Y            | 节点和区域的位置，以`id`为键，以定位信息为值，参见[定位信息](#定位信息-position)                                                        |
| zoomSensitivity   | `Number`                           | `0.001`        | N    | N            | 缩放敏感度                                                                                            |
| zoomScale         | `Number`                           | `1`            | N    | Y            | 缩放比例                                                                                              |
| maxZoomScale      | `Number`                           | `5`            | N    | N            | 最大缩放比例                                                                                          |
| minZoomScale      | `Number`                           | `0.1`          | N    | N            | 最小缩放比例                                                                                          |
| layoutConfig      | `Object`                           | `{}`           | N    | N            | 布局配置，边数据结构参见[Dagre 布局](#dagre布局)                                                      |
| showArrow         | `Boolean`                          | `true`         | N    | N            | 连线显示箭头                                                                                          |
| arrowZoomRatio    | `Number`                           | `1`            | N    | N            | 箭头缩放比例                                                                                          |
| arrowPosition     | `Number`                           | `100`          | N    | N            | 箭头显示百分比位置，范围`0-100`，`0`为起点，`100`为终点                                               |
| beforeAddEdgeHook | `Function`                         | `undefined`    | N    | N            | 添加边预处理钩子                                                                                      |
| nodeGroup         | `String`<br>`Object`<br>`Function` | `undefined`    | N    | N            | 节点组控配置，组控配置方式参见[组控策略](#组控策略-group)                                             |
| endpointGroup     | `String`<br>`Object`<br>`Function` | `undefined`    | N    | N            | 锚点组控配置                                                                                          |
| canvasDragging    | `String`                           | `'off'`        | N    | Y            | 画布拖拽行为，可选值：<br>`off`：禁用<br>`select`：节点圈选<br>`zoom`：选区放大<br>`scroll`：画布滚屏 |
| nodeDragging      | `String`                           | `'off'`        | N    | Y            | 节点拖拽行为，可选值：`off`：禁用<br>`move`：移动节点<br>`link`：连接节点                             |
| canvasWheeling    | `String`                           | `'off'`        | N    | Y            | 画布滚轮行为，可选值：`off`：禁用<br>`zoom`：滚轮缩放<br>`scroll`：滚屏                               |
| lineShape         | `Object`                           | `StraightLine` | N    | N            | 连线形状                                                                                              |
| linkingLineShape  | `Object`                           | `StraightLine` | N    | N            | 连线时的连线形状                                                                                      |

#### 画布插槽

| 插槽            | scope  | 默认内容     | 说明           |
| --------------- | ------ | ------------ | -------------- |
| nodeRenderer    | `node` | 节点 ID 文本 | 自定义节点渲染 |
| topEndpoints    | `node` | 无           | 顶部锚点       |
| leftEndpoints   | `node` | 无           | 左侧锚点       |
| rightEndpoints  | `node` | 无           | 右侧锚点       |
| bottomEndpoints | `node` | 无           | 底部锚点       |
| edgeLabelRenderer    | `edge` | 连线标签文本 | 自定义连线标签渲染 |
| zoneRenderer    | `zone` | 无 | 自定义区域渲染 |

### 锚点 `DragonflyEndpoint`

| 属性       | 类型                 | 默认值      | 必填 | 支持双向绑定 | 说明                                         |
| ---------- | -------------------- | ----------- | ---- | ------------ | -------------------------------------------- |
| endpoint   | `Object`             | -           | Y    | N            | 锚点信息，参考[锚点信息](#锚点信息-endpoint) |
| group      | `String`<br>`Object` | `undefined` | N    | N            | 节点组控规则                                 |
| labelClass | `String`             | `undefined` | N    | N            | 锚点标签样式                                 |
| label      | `String`             | `undefined` | N    | N            | 锚点标签                                     |

### 直线 `StraightLine`

| 属性   | 类型     | 默认值 | 必填 | 支持双向绑定 | 说明                                                                    |
| ------ | -------- | ------ | ---- | ------------ | ----------------------------------------------------------------------- |
| source | `Object` | -      | Y    | N            | 连线起点，连线端点信息数据结构参见[连线端点信息](#连线端点信息-lineend) |
| target | `Object` | -      | Y    | N            | 连线终点，连线端点信息数据结构参见[连线端点信息](#连线端点信息-lineend) |

### 之字线 `ZigZagLine`

| 属性   | 类型     | 默认值 | 必填 | 支持双向绑定 | 说明                                                                    |
| ------ | -------- | ------ | ---- | ------------ | ----------------------------------------------------------------------- |
| source | `Object` | -      | Y    | N            | 连线起点，连线端点信息数据结构参见[连线端点信息](#连线端点信息-lineend) |
| target | `Object` | -      | Y    | N            | 连线终点，连线端点信息数据结构参见[连线端点信息](#连线端点信息-lineend) |

### S曲线 `SCurveLine`

| 属性   | 类型     | 默认值 | 必填 | 支持双向绑定 | 说明                                                                    |
| ------ | -------- | ------ | ---- | ------------ | ----------------------------------------------------------------------- |
| source | `Object` | -      | Y    | N            | 连线起点，连线端点信息数据结构参见[连线端点信息](#连线端点信息-lineend) |
| target | `Object` | -      | Y    | N            | 连线终点，连线端点信息数据结构参见[连线端点信息](#连线端点信息-lineend) |


## 数据类型

### 节点信息 `Node`

| 字段      | 类型                 | 必填 | 默认值     | 说明                                                       |
| --------- | -------------------- | ---- | ---------- | ---------------------------------------------------------- |
| id        | `String`             | Y    | -          | 节点唯一标识 ID                                            |
| label     | `String`             | N    | undefined  | 节点显示标签                                               |
| movable   | `Boolean`            | N    | true       | 节点是否可以拖拽移动                                       |
| linkable  | `Boolean`            | N    | true       | 节点是否可连线（无论连入还是连出）                         |
| endpoints | `Array`              | N    | undefined  | 节点的锚点列表，数据结构参见[锚点信息](#锚点信息-endpoint) |
| group     | `String`<br>`Object` | N    | undefined  | 节点组控规则，参见 [组控策略](#组控策略-group)             |

### 锚点信息 `Endpoint`

| 字段           | 类型                 | 必填 | 默认值    | 说明                                                   |
| -------------- | -------------------- | ---- | --------- | ------------------------------------------------------ |
| id             | `String`             | Y    | -         | 锚点唯一标识 ID                                        |
| label          | `String`             | N    | -         | 锚点显示标签                                           |
| orientation    | `String`             | Y    | -         | 锚点显示位置，可选值为`top`、`bottom`、`left`、`right` |
| linkable       | `Boolean`            | N    | true      | 锚点是否可连线（无论连入还是连出）                     |
| group          | `String`<br>`Object` | N    | undefined | 锚点组控规则，参见 [组控策略](#组控策略-group)         |
| className      | `String`             | N    | undefined | 锚点样式名                                             |
| labelClassName | `String`             | N    | undefined | 锚点标签样式名                                         |
| label          | `String`             | N    | undefined | 锚点标签                                               |

### 边信息 `Edge`

| 字段           | 类型     | 必填 | 默认值 | 说明          |
| -------------- | -------- | ---- | ------ | ------------- |
| id             | `String` | Y    | -      | 边唯一标识 ID |
| label          | `String` | N    | -      | 边显示标签    |
| source         | `String` | N    | -      | 边起点节点 ID |
| sourceEndpoint | `String` | N    | -      | 边起点锚点 ID |
| target         | `String` | N    | -      | 边终点锚点 ID |
| targetEndpoint | `String` | N    | -      | 边终点锚点 ID |

### 连线端点信息 `LineEnd`

| 字段   | 类型     | 必填 | 默认值 | 说明                   |
| ------ | -------- | ---- | ------ | ---------------------- |
| x      | `Number` | N    | -      | 节点/锚点的中心 x 坐标 |
| y      | `Number` | N    | -      | 节点/锚点的中心 y 坐标 |
| width  | `Number` | N    | -      | 节点/锚点的宽度        |
| height | `Number` | N    | -      | 节点/锚点的高度        |

### 区域信息 `Zone`
| 字段   | 类型     | 必填 | 默认值 | 说明                   |
| ------ | -------- | ---- | ------ | ---------------------- |
| id      | `String` | true    | -      | 区域唯一标识 |

### 定位信息 `Position`
| 字段      | 类型                 | 必填 | 默认值     | 说明                                                       |
| --------- | -------------------- | ---- | ---------- | ---------------------------------------------------------- |
| x         | `Number`             | N    | 布局计算值 | 左上角 x 坐标                          |
| y         | `Number`             | N    | 布局计算值 | 左上角 y 坐标                          |
| width         | `Number`             | N    | 默认显示值 | 宽度                          |
| height         | `Number`             | N    | 默认显示值 | 高度                          |


### 组控策略 `Group`

组控策略用于控制节点/锚点进行连线操作时的连入/连出的判定规则。

#### 字符串组控策略

直接用字符串做组控策略时，字符串为组名，组名完全相同的节点/锚点可以连入。（连出能否成功取决于目标节点/锚点的组策略）

#### 对象组控策略

| 字段    | 类型                                           | 必填 | 默认值      | 说明                                         |
| ------- | ---------------------------------------------- | ---- | ----------- | -------------------------------------------- |
| name    | `String`                                       | N    | `undefined` | 当前节点/锚点所属组名                        |
| linkIn  | `String`<br>`Array`<br>`Function`<br>`Boolean` | N    | `undefined` | 连入规则，参见 [连入规则](#连入规则-linkin)  |
| linkOut | `Boolean`                                      | N    | `undefined` | 连出规则，参见 [连出规则](#连出规则-linkout) |

##### 连入规则 `linkIn`

| 情形           | 逻辑                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| `undefined`    | 当前节点/锚点组名也是`undefined`时允许任何节点/锚点连入，否则只允许和当前节点/锚点组名一致的节点/锚点连入 |
| `String`类型   | 源节点/锚点具有相同组名时可接入                                                                           |
| `Array`类型    | 数组包含源节点/锚点的组名时可连入                                                                         |
| `Function`类型 | 函数返回`true`允许连入，`false`不允许连入，输入参数参见 [函数形式的输入参数](#函数形式的输入参数)         |

###### 函数形式的输入参数

```javascript
// 输入参数为一个对象，解构如下：
{
  source, // 源节点ID
  sourceEndpoint, // 源锚点ID，如果值为undefined则表示源为ID为source值的节点，否则源为对应该ID的锚点
  sourceGroup; // 源节点/锚点的组名
}
```

##### 连出规则 `linkOut`

| 情形           | 逻辑                                                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `undefined`    | 当前节点可以连出                                                                                                                                            |
| `Boolean`类型  | 为`true`时可以连出，`false`不允许连出                                                                                                                       |
| `Function`类型 | 函数入参为当前节点信息（或锚点所在节点）和锚点信息（如果源为节点，锚点信息则为`undefined`），函数返回`Boolean`类型的值为`true`时允许连出，`false`不允许连出 |

## Dagre 布局

参见[Dagre 布局配置](https://github.com/dagrejs/dagre/wiki#configuring-the-layout)

## 自定义

### 自定义节点渲染

### 自定义样式

### 自定义连线形状
extends: `LineShapeBase`
implement: `getDefinition(): String`


### 自定义锚点
