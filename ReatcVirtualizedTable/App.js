import React from 'react';
import {
  MultiGrid,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache
} from 'react-virtualized';
import { Resizable } from 'react-resizable';
import _ from 'lodash';

import 'antd/dist/antd.css';
import './App.css';
import './style.css';

if (!String.prototype.replaceAll) {
  /* for-support IE */
  /* https://vanillajstoolkit.com/polyfills/stringreplaceall/ */
  String.prototype.replaceAll = function (str, newStr) {
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
      return this.replace(str, newStr);
    }
    return this.replace(new RegExp(str, 'g'), newStr);
  };
}

const topStyle = {
  backgroundColor: '#3B9BFA',
  color: 'white'
};

const DEFAULT_WIDTH = 160;
const ROW_HEIGHT = 64;
let countIndex = 0;
function genKey() {
  countIndex += 1;
  return countIndex;
}

class VirtualGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      data: [],
      sortBy: null,
      sortOrder: 'asc',
      inputSelectValue: '',
      openSearchOutlined: false,
    };

    this.grid = React.createRef();
    this.cellRenderer = this.cellRenderer.bind(this);
    this.dataRenderer = this.dataRenderer.bind(this);
    this.headerRenderer = this.headerRenderer.bind(this);
    this.getWidth = this.getWidth.bind(this);

    this._cache = new CellMeasurerCache({
      fixedHeight: true
    });
  }

  componentDidMount() {
    const columns = this.props.columns.map(c => {
      if (c.width) {
        return c;
      }
      return { ...c, width: DEFAULT_WIDTH };
    });
    let data = _.cloneDeep(this.props.data);

    /* �갵 filter �\�� */
    let searchInputText = this.props.searchInputText;
    searchInputText = searchInputText.toLowerCase();
    if (this.props.searchInputText !== '') {
      const resultData = data.filter((element) => {
        /* ������X�����Ҧ�key�զ��� key�}�C */
        const elementKeyArray = Object.keys(element);

        let isTarget = false;
        for (let i = 0, len = elementKeyArray.length; i < len; i++) {
          const key = elementKeyArray[i];
          let elementValue = element[key];
          elementValue = String(elementValue).toString();
          elementValue = elementValue.toLowerCase();
          if (elementValue.indexOf(searchInputText) !== -1) {
            isTarget = true;
            element[key] = elementValue.replaceAll(searchInputText, '<search-input-text>' + searchInputText + '</search-input-text>');
          }
        }

        if (isTarget === false) {
          return null;
        }
        return element;
      });
      data = resultData;
    }

    this.setState({
      columns,
      data
    });
  }

  dataRenderer = (attr) => {
    if (attr.rowIndex === 0) {
      /* table > thead > tr > th */
      return this.headerRenderer(attr);
    }
    /* table > tbody > tr > td */
    return this.cellRenderer(attr);
  };

  /* table > tbody > tr > td �C�ӳ椸�� ��ø�s */
  cellRenderer = (cellRenderInput) => {
    let { columnIndex, key, parent, rowIndex, style } = cellRenderInput;

    const { columns } = this.props;
    const { data } = this.state;
    const row = data[rowIndex - 1];
    const col = columns[columnIndex];

    let content = row[col.dataIndex];
    if (col.render) {
      content = col.render(content, row);
    }

    content = String(content).toString();
    /* �o�� resultArray�}�C �|�x�s���n��T�A */
    /* �p�G�O�����е�������I�����y�j�M�r�zisTarget��true */
    /* �p�G�D�y�j�M�r�z�hisTarget��false */
    let str = JSON.parse(JSON.stringify(content));
    let resultArray = [];
    let startIndex = 0;
    let endIndex = 0;
    let needTailStr = false;
    while (true) {
      if (str.indexOf("<search-input-text>") === -1) {
        break;
      }
      needTailStr = true;
      startIndex = str.indexOf("<search-input-text>");
      endIndex = str.indexOf("</search-input-text>");

      resultArray.push({
        isTarget: false,
        value: str.substring(0, startIndex),
      });

      resultArray.push({
        isTarget: true,
        value: str.substring(startIndex, endIndex),
      });

      if (str.indexOf("</search-input-text>") === -1) {
        break;
      }
      /* ���ۧ�e���B�z�L���r��cut�������C�U�@���j��N�]�h�B�z �U�@�� search-input-text �]�_�Ӫ��y�j�M����r�z�C */
      let cutIndex = str.indexOf("</search-input-text>") + 20;
      str = str.substring(cutIndex, str.length);
    }

    if (str !== '' && needTailStr === true) {
      /* ��J�r��̫᪺���� */
      resultArray.push({
        isTarget: true,
        value: str,
      });
    } else {
      resultArray.push({
        isTarget: false,
        value: str,
      });
    }

    /* �i��ץ��A�� <search-input-text>�Ъ`�����A��y�D�j�M�r�z�� isTarget ���]�^ false */
    resultArray = resultArray.map((element) => {
      if (element.value.indexOf('<search-input-text>') !== -1) {
        element.isTarget = true;
        element.value = element.value.replace('<search-input-text>', '');
      } else {
        element.isTarget = false;
      }
      return element;
    });

    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={columnIndex}
        key={key}
        parent={parent}
        rowIndex={rowIndex}
      >
        <div
          style={{
            ...style,
            border: '1px solid gray',
            whiteSpace: 'pre',
            backgroundColor: rowIndex % 2 === 0 ? '#E8F4FF' : 'white',
            width: '100%',
            resize: 'none',
            overflow: 'auto',
            fontSize: '16px',
          }}>
          {
            resultArray.map((element) => {
              if (element.isTarget === true) {
                /* ����I�����ܡy�j�M�r�z */
                return (<span key={genKey()} style={{ backgroundColor: '#F9F900' }}>{element.value}</span>);
              }
              return (<span key={genKey()}>{element.value}</span>);
            })
          }
        </div>
      </CellMeasurer>
    );
  };

  /* table > thead > tr > th �C�Ӽ��Y ��ø�s */
  headerRenderer = ({ columnIndex, key, style }) => {
    const { columns, sortBy, sortOrder } = this.state;
    const col = columns[columnIndex];
    const handle = (
      <span className='resize-handle' onClick={e => e.stopPropagation()} />
    );

    const handleResize = (event, { size }) => {
      this.setState({
        columns: columns.map((c, index) => {
          if (index === columnIndex) {
            const { width } = size;
            return { ...c, width };
          }
          return c;
        })
      });
      if (this.grid.current) {
        this.grid.current.recomputeGridSize({});
      }
    };

    const handleSort = () => {
      const sortFunc = (e1, e2) =>
        col.sort(e1[col.dataIndex], e2[col.dataIndex]);
      if (col.sort) {
        const { data } = this.state;
        if (!sortBy) {
          const newData = _.cloneDeep(data).sort(sortFunc);
          this.setState({
            data: newData,
            sortBy: col.dataIndex,
            sortOrder: 'asc'
          });
        } else if (sortBy === col.dataIndex && sortOrder === 'asc') {
          const newData = _.cloneDeep(data)
            .sort(sortFunc)
            .reverse();
          this.setState({
            data: newData,
            sortBy: col.dataIndex,
            sortOrder: 'desc'
          });
        } else {
          const newData = _.cloneDeep(this.props.data);
          this.setState({ data: newData, sortBy: null, sortOrder: 'asc' });
          this.props.handleClearOnClick();
        }
      }
    };

    return (
      <Resizable
        width={col.width}
        height={0}
        handle={handle}
        onResize={handleResize}
        key={key}
        style={style}
      >
        <div
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: col.sort ? 'pointer' : 'auto',
          }}
          key={key}
          onClick={handleSort}
        >
          <span style={{ fontSize: '20px' }}>
            {col.title}
          </span>
          {
            (sortBy === col.dataIndex) ? (
              (sortOrder === 'asc') ? (
                /* <span style={{ position: 'absolute', right: 42 }}>&#9650;</span> */
                <span style={{ position: 'absolute', right: 5, fontSize: '32px' }}>��</span>
              ) : (
                /* <span style={{ position: 'absolute', right: 42 }}>&#9660;</span> */
                <span style={{ position: 'absolute', right: 5, fontSize: '32px' }}>��</span>
              )
            ) : (null)
          }
        </div>
      </Resizable>
    );
  };

  getWidth = (totalWidth, height, index) => {
    const { columns, data, rowHeight } = this.props;
    const col = columns[index];
    if (col.width) {
      return col.width;
    }
    const noWidthColumns = columns.filter(c => !c.width);
    const fixedWidth = columns.reduce((a, c) => a + (c?.width || 0), 0);
    let w = Math.floor((totalWidth - fixedWidth) / noWidthColumns.length);
    if (data.length * rowHeight > height && index === columns.length - 1) {
      w -= 20;
    }
    return w;
  };

  render() {
    const { rowHeight, fixedColumnCount } = this.props;
    const { columns, data } = this.state;
    return (
      <div style={{ height: '100%' }}>
        <AutoSizer>
          {({ width, height }) => (
            <MultiGrid
              ref={this.grid}
              columnWidth={({ index }) => columns[index]?.width || 0}
              columnCount={columns.length}
              height={height}
              width={width}
              rowHeight={rowHeight}
              rowCount={data.length + 1}
              estimatedRowSize={rowHeight}
              cellRenderer={this.dataRenderer}
              fixedRowCount={1}
              fixedColumnCount={fixedColumnCount}
              hideTopRightGridScrollbar
              hideBottomLeftGridScrollbar
              enableFixedColumnScroll
              enableFixedRowScroll
              style={{ border: '1px solid lightgray' }}
              styleTopLeftGrid={{
                ...topStyle
              }}
              styleTopRightGrid={{
                ...topStyle
              }}
              styleBottomLeftGrid={{}}
              styleBottomRightGrid={{}}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

function getStableSort(a, b) {
  if (a === null || a === undefined) {
    a = '';
  }
  if (b === null || b === undefined) {
    b = '';
  }
  if ((typeof a) === 'number' && (typeof b) === 'number') {
    /* �Ʀr�Ƨ� */
    return (a - b);
  }
  /* �r��Ƨ� */
  a = String(a).toString();
  b = String(b).toString();
  return a.localeCompare(b);
}

let columns = [
  { key: '�m�W', title: '�m�W', dataIndex: 'name', width: 200, sort: getStableSort },
  { key: '����', title: '����', dataIndex: 'description', width: 200, sort: getStableSort },
  { key: 'Id', title: 'Id', dataIndex: 'id', width: 200, sort: getStableSort }
];

let data = [
  {
    name: '�C��\nQ��\n?????\nKyuubee\n',
    description: '�i��ƾ��j\n�iIncubator�j\n�ۺ١u�]�k���Ϫ̡v�A\n' +
      '�{�p�N�������|���B��ʪ��C\n�S���ʧO�C\n�u���جO��ƾ��A\n�~�P�ͩR���׺ݡC\n' +
      '���F�ۤv��w���H�A\n�L�k�Q��L�H�ݨ��A\n�i�z�L���F�P���P�S�w��H���q�C\n' +
      '�򥻤W�S�����A\n���i���~�Ҥ��i�f�C\n��H��{���@�@�檺�N���A\n' +
      '�N�֤k���F��s�� �F���_�ۡisoul gem�j�C\n�ϩR�O�洫�]�k�֤k���u�����v�A\n' +
      '�]�t�d�^�� �d�Ĥ��ءigrief seed�j�C\n' +
      '�z�L�q�ǻ����B�c�v�h�H���F�P�����覡�A\n���]�k�֤k���ѥ��n��U�C\n',
    id: -1
  },
  { name: '���m��', description: '�ݩʡG���B�����G�v¡�B��l�G1�P', id: 1 },
  { name: '�C���K�d�N', description: '�ݩʡG���B�����G���šB��l�G2�P', id: 2 },
  { name: '�Ѥ��b�D', description: '�ݩʡG���B�����G�]�k�B��l�G2�P', id: 3 },
  { name: '�`�������', description: '�ݩʡG��B�����G�����B��l�G2�P', id: 4 },
  { name: '�G�����`', description: '�ݩʡG��B�����G���m�B��l�G2�P', id: 5 },
  { name: '���Ц�', description: '�ݩʡG��B�����G���šB��l�G4�P', id: 6 },
  { name: '�Q�S��l', description: '�ݩʡG���B�����G���šB��l�G4�P', id: 7 },
  { name: '���', description: '�ݩʡG��B�����G�]�k�B��l�G3�P', id: 8 },
  { name: '���i�©`', description: '�ݩʡG���B�����G�����B��l�G4�P', id: 9 },
  { name: '�����R�P��p', description: '�ݩʡG��B�����G�����B��l�G4�P', id: 10 },
  { name: '�����O��', description: '�ݩʡG���B�����G�]�k�B��l�G4�P', id: 11 },
  { name: '�`����', description: '�ݩʡG��B�����G�䴩�B��l�G4�P', id: 12 },
  { name: '����V', description: '�ݩʡG��B�����G�䴩�B��l�G4�P', id: 13 },
  { name: '�ѭ���]�B�����]', description: '�ݩʡG��B�����G���šB��l�G4�P', id: 14 },
  { name: '�ѭ���?', description: '�ݩʡG���B�����G�]�k�B��l�G4�P', id: 15 },
  { name: '�[���O', description: '�ݩʡG���B�����G�����B��l�G3�P', id: 16 },
  { name: '��������', description: '�ݩʡG��B�����G�v���B��l�G4�P', id: 17 },
  { name: '�¦�', description: '�ݩʡG�H�B�����G�H�B��l�G�H�P', id: 18 },
  {
    name: '�K������',
    description: '�ݩʡG�L�B�����G�䴩�B��l�G4�P\n�b���إ��g��u�վ�Ρv���]�k�֤k\n' +
      '�q�L�]�O���վ�A�ȩM�P��ӫ~�Ȩ� �d�Ĥ��ءigrief seed�j�A\n�ܤְѻP�԰��C\n' +
      '���`���P�r�֦a�ݤH�����A\n�ӤF�Ѧo���g�����]�k�֤k�Ƥ֡C\n',
    id: 19
  },
  { name: '�Ůa�V�`', description: '�ݩʡG�H�B�����G�H�B��l�G�H�P', id: 20 },
  { name: '�c���ɫB', description: '�ݩʡG��B�����G�䴩�B��l�G4�P', id: 21 },
  { name: '�w�n�|��', description: '�ݩʡG���B�����G�����B��l�G4�P', id: 22 },
  { name: '������', description: '�ݩʡG�H�B�����G�H�B��l�G�H�P', id: 23 },
  { name: '�����[�`�f', description: '�ݩʡG��B�����G���šB��l�G4�P', id: 24 },
  { name: '�w�W���S', description: '�ݩʡG��B�����G�䴩�B��l�G3�P', id: 25 },
  { name: '�M�u�Q�C�]', description: '�ݩʡG���B�����G�����B��l�G4�P', id: 26 },
  { name: '�U�~�媺����\n�`��l', description: '�ݩʡG���B�����G���šB��l�G4�P', id: 27 },
  { name: '�����D', description: '�ݩʡG��B�����G�䴩�B��l�G2�P', id: 28 },
  { name: '�s����', description: '�ݩʡG���B�����G�䴩�B��l�G4�P', id: 29 },
  { name: '�K�����v', description: '�ݩʡG�H�B�����G�H�B��l�G�H�P', id: 30 },
  { name: '���ض�', description: '�ݩʡG���B�����G�v¡�B��l�G4�P', id: 31 },
  { name: '����K', description: '�ݩʡG��B�����G�䴩�B��l�G4�P', id: 32 },
  { name: '����F�C��', description: '�ݩʡG���B�����G���m�B��l�G4�P', id: 33 },
  { name: '�ڳ¬�', description: '�ݩʡG��B�����G�]�k�B��l�G4�P', id: 34 },
  { name: '���ܧ��l', description: '�ݩʡG���B�����G�����B��l�G4�P', id: 35 },
  { name: '�ɤk�R��', description: '�ݩʡG�H�B�����G�H�B��l�G�H�P', id: 36 },
  { name: '�s���d�K', description: '�ݩʡG��B�����G���m�B��l�G4�P', id: 37 },
  { name: '�g���F��', description: '�ݩʡG���B�����G�v¡�B��l�G4�P', id: 38 },
  { name: '�n�z�D�l', description: '�ݩʡG���B�����G���šB��l�G4�P', id: 39 }
];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.searchInput = React.createRef();
    this.handleSearchOnClick = this.handleSearchOnClick.bind(this);
    this.handleClearOnClick = this.handleClearOnClick.bind(this);
    this.state = {
      inputSearchValue: '',
    }
  }

  handleSearchOnClick() {
    let inputSearchValue = this.searchInput.current.value;
    inputSearchValue = inputSearchValue.trim();
    this.setState({
      inputSearchValue
    });
  }

  handleClearOnClick() {
    this.searchInput.current.value = '';
    this.setState({
      inputSearchValue: '',
    });
  }

  render() {
    let dashboardId = 12;
    let displayboxId = 34;
    return (
      <div
        style={{
          height: '360px',
          width: '800px',
          display: 'inline-flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row-reverse',
          }}
        >
          {/* flexDirection: 'row-reverse' �����f�V�ƦC */}
          <input
            type="button"
            value="Clear"
            className="button clear-button"
            onClick={this.handleClearOnClick}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <input
            type="button"
            value="Search"
            className="button search-button"
            onClick={this.handleSearchOnClick}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <input
            ref={this.searchInput}
            type="text"
            style={{
              border: '1px',
              borderBottomStyle: 'solid',
              borderTopStyle: 'none',
              borderLeftStyle: 'none',
              borderRightStyle: 'none',
              backgroundColor: '#F0F0F0',
            }}
          />
        </div>
        <VirtualGrid
          key={`${dashboardId}-${displayboxId}-${this.state.inputSearchValue}`}
          columns={columns}
          rowHeight={ROW_HEIGHT}
          data={data}
          searchInputText={this.state.inputSearchValue}
          fixedColumnCount={0}
          handleClearOnClick={this.handleClearOnClick}
        />
      </div>
    );
  }
}
