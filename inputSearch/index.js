import React from "react";
//import DateTimeField from 'react-bootstrap-datetimepicker';
import DatePicker from 'antd/lib/date-picker';
import Select from 'antd/lib/select';
import TreeSelect from 'antd/lib/tree-select';
import Radio from 'antd/lib/radio';
import moment from "moment";
import Icon from "hws2-ui/icon";
import Button from "../button";
import { ButtonToolbar } from "react-bootstrap";
import Store from "store2";
import "antd/lib/date-picker/style";
import "antd/lib/switch/style";
import "antd/lib/tree-select/style";
import "./index.less";
const Option = Select.Option;
const { RangePicker } = DatePicker;

const arrMap = {
  selectMany: true,
  selectTree: true
};
//多功能组合搜索框
export default class InputSearch extends React.Component {
  constructor(props) {
    super(props);
    let { selectMap, activeKey = 0 } = props;
    this.state = {
      selectMap,
      refresh: true,
      activeKey,
      to_enabled: false, //已启用
      to_disabled: false, //已停用
      todo: false, //待处理
      trash: false //回收站
    };
    if (!this.props.enableCache) {
      Store.session.remove('filterDataHex_0');
      Store.session.remove('filterQueryHex_0');
      Store.session.remove('searchMap_0');
    }
    this.queryHex = Store.session.get(`filterQueryHex_${activeKey}`) || {};
  }
  componentDidMount() {}
  componentWillReceiveProps() {
    this.setState({ refresh: false });
  }
  shouldComponentUpdate(props, state) {
    return state.refresh;
  }
  //根据输入的搜索条件进行搜索列表
  searchList = (obj, searchMap, inputDefaultObj) => {
    if (HexApi.tool.getAttr(obj) != "object") return;
    let searchStr = "",
      localHex = Store.get("hexSearchLocal") || [],
      index = -1, // 初始化选中的在缓存列表中的索引，判断是否删除
      localShowNumber = 5, // 配置缓存显示的数量--默认值
      { selectMap, activeKey } = this.state,
      { showLocal, defaultMap } = selectMap,
      { searchQuery } = this.props,
      postData = {};

    localShowNumber =
      showLocal && showLocal.showNumber ? showLocal.showNumber : 5;
    for (let key in obj) {
      const val = obj[key],
        type = HexApi.tool.getAttr(val);
      if (type == "array") {
        val.length > 0 ? (searchStr += `${key}:`) : null;
        val.map((_, i) => {
          searchStr += `${_.title}${val.length - 1 == i ? ";" : "|"}`;
        });
      } else if (type == "object") {
        val.title ? (searchStr += `${key}:${val.title};`) : null;
      } else {
        val ? (searchStr += `${key}:${val};`) : null;
      }
      postData[searchMap[key]] = val == "是" ? true : val == "否" ? false : val;
    }
    HexApi.tool.getAttr(defaultMap) === "object"
      ? (postData = { ...postData, ...defaultMap })
      : null;
    this.queryHex = { ...this.queryHex, ...postData, ...inputDefaultObj };
    delete this.queryHex.undefined;
    searchQuery && searchQuery(this.queryHex);
    Store.session.set(`filterDataHex_${activeKey}`, obj);
    Store.session.set(`filterQueryHex_${activeKey}`, this.queryHex);
    if (!showLocal) return false; //如果配置不缓存直接返回
    localHex.length != 0 &&
      localHex.map((_, i) => {
        if (_.show == searchStr) index = i;
      });
    if (!searchStr) return false;
    index != -1 ? localHex.splice(index, 1) : null;
    localHex.length < localShowNumber
      ? localHex.unshift({ show: searchStr, origin: obj })
      : (localHex.splice(localHex.length - 1, 1),
        localHex.unshift({ show: searchStr, origin: obj }));
    Store.set(`hexSearchLocal${activeKey}}`, localHex);
  };
  getFilter() {
    let query = {};
    if (this.state.todo) {
      query = {
        state: "draft,enabled",
        filters: undefined,
        is_request: true,
        include_state: undefined
      };
    } else if (this.state.trash) {
      query = {
        state: "disabled,del",
        filters: undefined,
        is_request: undefined,
        include_state: undefined
      };
    } else if (this.state.to_enabled) {
      return {
        state: "enabled",
        filters: { status: "ENABLED" },
        is_request: undefined,
        include_state: true
      };
    } else if (this.state.to_disabled) {
      return {
        state: "enabled",
        filters: { status: "DISABLED" },
        is_request: undefined,
        include_state: true
      };
    } else {
      query = {
        state: "draft,enabled",
        filters: undefined,
        is_request: undefined,
        include_state: undefined
      };
    }
    return {
      ...query,
      include_pending_record: true,
      include_state: true
    };
  }
  toggleTrash = () => {
    this.setState(
      {
        to_enabled: false,
        to_disabled: false,
        todo: false,
        trash: !this.state.trash,
        refresh: true
      },
      this.triggerStateChange
    );
  };
  toggleToDo = () => {
    this.setState(
      {
        to_enabled: false,
        to_disabled: false,
        todo: !this.state.todo,
        trash: false,
        refresh: true
      },
      this.triggerStateChange
    );
  };
  toggleToEnabled = () => {
    this.setState(
      {
        to_enabled: !this.state.to_enabled,
        to_disabled: false,
        todo: false,
        trash: false,
        refresh: true
      },
      this.triggerStateChange
    );
  };
  toggleToDisabled = () => {
    this.setState(
      {
        to_enabled: false,
        to_disabled: !this.state.to_disabled,
        todo: false,
        trash: false,
        refresh: true
      },
      this.triggerStateChange
    );
  };
  triggerStateChange = () => {
    this.queryHex = { ...this.queryHex, ...this.getFilter() };
    delete this.queryHex.undefined;
    this.props.searchQuery && this.props.searchQuery(this.queryHex);
    Store.session.set(`filterQueryHex_${this.state.activeKey}`, this.queryHex);
  };
  render() {
    const { selectMap, activeKey, isClickButton } = this.state,
      {
        to_enabled=false,
        to_disabled=false,
        todo=false,
        trash=false,
        refresh=false
      } = this.props.buttonStatus||{};
    if (!selectMap) return null;
    const filterData = Store.session.get(`filterDataHex_${activeKey}`);
    return (
      <div className="filtered-search-wrapper">
        <ButtonToolbar style={{ position: "relative", marginRight: "5px" }}>
          {todo && (
            <Button
              bsStyle={this.state.todo ? "primary" : "default"}
              icon="fa-th-list"
              onClick={this.toggleToDo}
              outline
              active={this.state.todo}
            >
              {intl.get("form-pending")}
            </Button>
          )}
          {to_enabled && (
            <Button
              bsStyle={this.state.to_enabled ? "primary" : "default"}
              icon="fa-unlock-alt"
              onClick={this.toggleToEnabled}
              outline
              active={this.state.to_enabled}
            >
              {intl.get("form-enabled")}
            </Button>
          )}
          {to_disabled && (
            <Button
              bsStyle={this.state.to_disabled ? "primary" : "default"}
              icon="fa-lock"
              onClick={this.toggleToDisabled}
              outline
              active={this.state.to_disabled}
            >
              {intl.get("form-disabled")}
            </Button>
          )}
          {trash && (
            <Button
              bsStyle={this.state.trash ? "primary" : "default"}
              icon="wb-trash"
              onClick={this.toggleTrash}
              outline
              active={this.state.trash}
            >
              {intl.get("form-bin")}
            </Button>
          )}
        </ButtonToolbar>
        <SearchSelect
          selectMap={selectMap}
          filterData={filterData}
          searchListFn={this.searchList}
          activeKey={activeKey}
          isClickButton={isClickButton}
        />
        {refresh && (
          <Button
            style={{ marginLeft: "5px" }}
            onClick={this.triggerStateChange}
          >
            <i className="glyphicon glyphicon-refresh" />
          </Button>
        )}
      </div>
    );
  }
}

//搜索框和最近搜索组建
class SearchSelect extends React.Component {
  constructor(props) {
    super(props);
    let { selectMap, activeKey } = props,
      searchContent = {},
      searchMap = {},
      propsCompList = {},
      { dataMap, defaultInput } = selectMap,
      pf = navigator.platform,
      os = "";
    dataMap &&
      dataMap.map(_ => {
        searchContent[_.title] = "";
        searchMap[_.title] = _.value;
        propsCompList[_.title] = _.props;
      });
    if (/Mac\S+/.test(pf)) os = "mac";
    else if (/Win\S+/.test(pf)) os = "win";
    this.state = {
      os, //  系统类型
      showHistory: false, //是否显示最近搜索的记录按钮
      isFocus: false, //input获取焦点
      currentChoosedKey: "type", //选择记录  key or value
      currentType: "", // 选择的记录的类型
      currentValue: "", //当前选择的类型的值
      searchContent, //搜索的内容
      chooseDataMap: [], //搜索框中显示的内容 当前类型的列表
      searchMap,
      defaultInput, // 默认的输入框筛选项  key
      inputDefaultObj: {}, // 默认的输入框筛选项 key value
      propsCompList //   组件配置属性列表
    };
    //键盘事件--按下
    this[`_handleKeyDown${activeKey}`] = e => {
      let key = e.key.toLocaleLowerCase(),
        { currentType } = this.state;
      if (key === "enter" && currentType != "input") {
        this.searchListFn(undefined, this.state.searchContent);
      }
    };
  }
  componentDidMount() {
    Store.session.set(
      `searchMap_${this.props.activeKey}`,
      this.state.searchMap
    );
    if (!this.state.os) return false;
    document.addEventListener(
      "keydown",
      this[`_handleKeyDown${this.props.activeKey}`]
    );
    const { defaultInput, inputDefaultObj, searchContent } = this.state,
      { filterData } = this.props;
    if (!defaultInput)
      return this.setState({
        searchContent: { ...searchContent, ...filterData }
      });
    const inputDom = document.getElementById("input-hex");
    inputDom.value = Store.get("inputSearchValue");
    inputDefaultObj[defaultInput] = inputDom.value;
    this.setState({
      inputDefaultObj,
      searchContent: { ...searchContent, ...filterData }
    });
  }
  componentWillReceiveProps(props) {
    const { filterData } = props;
    this.setState({
      searchContent: { ...this.state.searchContent, ...filterData }
    });
  }
  componentWillUnmount() {
    if (!this.state.os) return false;
    document.removeEventListener(
      "keydown",
      this[`_handleKeyDown${this.props.activeKey}`]
    );
  }
  //获取input焦点
  inputFocus = () => {
    let { currentValue, currentChoosedKey, currentType } = this.state;
    currentChoosedKey = currentValue === "" ? currentChoosedKey : "type";
    // currentType === "date" ? (currentType = "") : null;
    currentType = "";
    this.setState({ isFocus: true, currentChoosedKey, currentType });
  };
  //input焦点失去方法
  inputBlur = () => {
    // this.setState({ isFocus:false })
  };
  //input键盘方法
  inputKeyUp = e => {
    const { currentType, defaultInput, searchContent } = this.state;
    const inputDom = document.getElementById("input-hex");
    if (currentType != "input") {
      if (!defaultInput) return false;
      let inputDefaultObj = {};
      inputDefaultObj[defaultInput] = inputDom.value;
      Store.set("inputSearchValue", inputDom.value);
      return this.setState({ inputDefaultObj }, () => {
        this.searchListFn(e, searchContent);
      });
    }
    this.chooseType(e, "value", inputDom.value);
    inputDom.value = "";
  };
  //选择type
  chooseType = (e, type, val, str) => {
    // str  如果str为true时则为多选
    this.setState(
      (state, props) => {
        let {
            searchContent,
            currentChoosedKey,
            currentValue,
            chooseDataMap,
            currentType
          } = state,
          { selectMap } = props,
          { dataMap } = selectMap;
        if (type === "value") {
          //选择值
          currentValue = val;
          searchContent = objSort(
            searchContent,
            currentChoosedKey,
            currentValue
          );
          searchContent[currentChoosedKey] = currentValue;
          !str
            ? ((currentChoosedKey = "type"),
              (chooseDataMap = []),
              (currentType = ""))
            : null;
        } else {
          //选择类型
          currentChoosedKey = val;
          searchContent = objSort(searchContent, currentChoosedKey);
          chooseDataMap = dataMap && dataMap.filter(_ => _.title === val);
          chooseDataMap.length > 0
            ? ((currentType = chooseDataMap[0].type),
              (chooseDataMap = chooseDataMap[0].list))
            : null;
          currentValue = arrMap[currentType] ? [] : "";
          if (currentType == "input") {
            const inputDom = document.getElementById("input-hex");
            inputDom && inputDom.focus();
          }
        }
        return {
          currentChoosedKey,
          currentValue,
          searchContent,
          chooseDataMap,
          currentType,
          isFocus: true
        };
      },
      () => {
        if (type === "value") {
          this.searchListFn(undefined, this.state.searchContent, str);
        }
        str ? this.chooseTypeValue() : null;
      }
    );
    e && e.stopPropagation();
  };
  //以选中的类型点击❎删除
  deleteThisType = (val, k) => {
    let { searchContent, currentChoosedKey, currentValue } = this.state;
    for (let key in searchContent) {
      let value = searchContent[key],
        type = HexApi.tool.getAttr(value);
      if (type === "array") {
        if (!k) {
          if (JSON.stringify(value) == JSON.stringify(val)) {
            searchContent[key] = [];
            currentChoosedKey = "type";
            currentValue = [];
          }
        } else {
          value = value.filter(_ => _.title != val);
          if (k == key) {
            searchContent[key] = value;
            currentValue = value;
          }
        }
      } else {
        type === "object" ? (value = value.title) : null;
        if (value === val) {
          searchContent[key] = "";
          currentChoosedKey = "type";
          currentValue = "";
        }
      }
    }
    this.setState({ currentChoosedKey, searchContent, currentValue }, () => {
      this.searchListFn(undefined, this.state.searchContent);
    });
  };
  //清空筛选内容
  deleteAllSearch = () => {
    let {
      searchContent,
      currentChoosedKey,
      currentValue,
      inputDefaultObj
    } = this.state;
    for (let key in searchContent) {
      searchContent[key] = "";
    }
    currentChoosedKey = "type";
    inputDefaultObj = {};
    currentValue = "";
    Store.session.remove(`searchMap_${this.props.activeKey}`);
    Store.session.remove(`filterDataHex_${this.props.activeKey}`);
    this.setState(
      { currentChoosedKey, searchContent, currentValue, inputDefaultObj },
      () => {
        this.searchListFn(undefined, this.state.searchContent);
      }
    );
  };
  //点击类型重新选择值
  chooseTypeValue = key => {
    this.setState((state, props) => {
      let {
          currentChoosedKey,
          chooseDataMap,
          currentType,
          searchContent,
          currentValue,
          isFocus
        } = state,
        { selectMap } = props,
        { dataMap } = selectMap;
      if (key) {
        currentChoosedKey = key;
        chooseDataMap =
          dataMap && dataMap.filter(_ => _.title === currentChoosedKey);
        chooseDataMap.length > 0
          ? ((currentType = chooseDataMap[0].type),
            (chooseDataMap = chooseDataMap[0].list))
          : null;
      }
      currentValue = searchContent[currentChoosedKey];
      if (currentType == "input") {
        const inputDom = document.getElementById("input-hex");
        inputDom && inputDom.focus();
        isFocus = true;
      } else {
        isFocus = false;
      }
      return {
        currentChoosedKey,
        currentType,
        chooseDataMap,
        isFocus,
        currentValue
      };
    });
  };
  //保存筛选项内容
  searchListFn = (e, val, str) => {
    let { searchMap, inputDefaultObj } = this.state;
    JSON.stringify(searchMap) == "{}"
      ? (searchMap = Store.session.get(`searchMap_${this.props.activeKey}`))
      : null;
    !str ? this.setState({ isFocus: false, currentChoosedKey: "type" }) : null;
    this.props.searchListFn(val, searchMap, inputDefaultObj);
    e && e.stopPropagation();
  };
  //选择此条记录查询
  chooseThisLocal = val => {
    let {
      searchContent,
      currentChoosedKey,
      chooseDataMap,
      searchMap
    } = this.state;
    searchContent = val;
    currentChoosedKey = "type";
    chooseDataMap = [];
    this.setState({
      currentChoosedKey,
      chooseDataMap,
      searchContent,
      isFocus: false
    });
    this.props.searchListFn(searchContent, searchMap);
  };
  render() {
    let {
        isFocus,
        currentChoosedKey,
        searchContent,
        currentValue
      } = this.state,
      { selectMap, activeKey } = this.props;
    if (!selectMap) return false;
    let { dataMap } = selectMap;
    dataMap = dataMap
      ? dataMap.filter(_ => {
          const filterData = searchContent[_.title];
          return HexApi.tool.getAttr(filterData) === "array"
            ? filterData.length == 0
            : !filterData;
        })
      : [];
    selectMap = { ...selectMap, dataMap };
    return (
      <div
        className={`filtered-search-box ${
          isFocus ? "filtered-search-box-focus" : ""
        }`}
      >
        {selectMap.showLocal ? (
          <SearchHistory
            chooseThisLocal={this.chooseThisLocal}
            showLocal={selectMap.showLocal}
            activeKey={activeKey}
          />
        ) : null}
        <div className="input-container">
          <ChoosedContentShow
            {...this.state}
            {...selectMap}
            deleteThisType={this.deleteThisType}
            chooseTypeValue={this.chooseTypeValue}
            searchListFn={this.searchListFn}
            chooseType={this.chooseType}
            inputFocus={this.inputFocus}
            inputBlur={this.inputBlur}
            inputKeyUp={this.inputKeyUp}
            dataMap={dataMap}
          />
          <div
            className={`search-delete ${
              currentChoosedKey != "type" ||
              (HexApi.tool.getAttr(currentValue) == "array" &&
                currentValue.length > 0) ||
              (HexApi.tool.getAttr(currentValue) != "array" && currentValue)
                ? ""
                : "hex-hide"
            }`}
            onClick={this.deleteAllSearch}
          >
            <Delete />
          </div>
        </div>
      </div>
    );
  }
}
//已选择内容的显示
const ChoosedContentShow = ({
  isFocus,
  searchContent,
  currentChoosedKey,
  defaultMapShow,
  defaultMap,
  chooseTypeValue,
  deleteThisType,
  ...prop
}) => {
  const props = {
    isFocus,
    searchContent,
    currentChoosedKey,
    defaultMapShow,
    defaultMap,
    chooseTypeValue,
    deleteThisType,
    ...prop
  };
  let dom = Object.keys(searchContent).map((_, i) => {
    let keyValue = searchContent[_];
    if (HexApi.tool.getAttr(keyValue) == "array") {
      if (currentChoosedKey === _ && keyValue.length == 0) {
        return (
          <div key={i} className="choosedContent">
            <span>{_}</span>
          </div>
        );
      } else if (keyValue.length > 0) {
        return (
          <div key={i} className="doubleContent Select--multi">
            <div
              className="choosedContent"
              onClick={() => {
                chooseTypeValue(_);
              }}
              style={{ borderLeft: "none" }}
            >
              <span>{_}</span>
              {!isFocus && currentChoosedKey === _ ? (
                <ComponentType {...props} isFocus={undefined} />
              ) : null}
            </div>
            {keyValue.map(v => (
              <div className="Select-value" key={v.value}>
                <span
                  className="Select-value-icon"
                  onClick={() => deleteThisType(v.title, _)}
                >
                  ×
                </span>
                <span className="Select-value-label" role="option">
                  {v.title}
                </span>
              </div>
            ))}
            <div className="choosedContent many-delete">
              <div
                className="type-delete"
                onClick={() => deleteThisType(keyValue)}
              >
                <Delete />
              </div>
            </div>
          </div>
        );
      } else {
        return null;
      }
    } else {
      if (currentChoosedKey === _ && !keyValue) {
        return (
          <div key={i} className="choosedContent">
            <span>{_}</span>
          </div>
        );
      } else if (keyValue) {
        const title =
          HexApi.tool.getAttr(keyValue) == "object" ? keyValue.title : keyValue;
        return (
          <div key={i} className="doubleContent">
            <div
              className="choosedContent"
              onClick={() => {
                chooseTypeValue(_);
              }}
              style={{ borderLeft: "none" }}
            >
              <span>{_}</span>
              {!isFocus && currentChoosedKey === _ ? (
                <ComponentType {...props} isFocus={undefined} />
              ) : null}
            </div>
            <div className="choosedContent" title={title}>
              <span>{title}</span>
              <div
                className="type-delete self"
                onClick={() => deleteThisType(keyValue.title)}
              >
                <Delete />
              </div>
            </div>
          </div>
        );
      } else {
        return null;
      }
    }
  });
  let defaultDom =
    (defaultMapShow === true || defaultMapShow === undefined) &&
    HexApi.tool.getAttr(defaultMap) === "object"
      ? Object.keys(defaultMap).map((_, i) => (
          <div key={_} className="doubleContent">
            <div className="choosedContent">
              <span>{_}</span>
            </div>
            <div className="choosedContent">
              <span>{defaultMap[_]}</span>
            </div>
          </div>
        ))
      : [];
  defaultDom = defaultDom.concat(dom);
  return (
    <div style={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
      {defaultDom}
      <InputHex {...props} isFocus={isFocus} />
    </div>
  );
};
//input输入框部分
function InputHex({
  inputFocus,
  inputBlur,
  inputKeyUp,
  isFocus,
  dataMap,
  searchContent,
  chooseType,
  currentChoosedKey,
  searchListFn,
  ...prop
}) {
  const props = {
    inputFocus,
    inputBlur,
    inputKeyUp,
    isFocus,
    dataMap,
    searchContent,
    chooseType,
    currentChoosedKey,
    searchListFn,
    ...prop
  };
  return (
    <div className="search-input">
      <input
        className="inputSearch"
        id="input-hex"
        autocomplete="off"
        onFocus={inputFocus}
        onBlur={inputBlur}
        onKeyUp={HexApi.tool.debounce(inputKeyUp, 800)}
      />
      <div
        className={`type ${
          isFocus && currentChoosedKey === "type" ? "hex-show" : "hex-hide"
        }`}
        style={{
          overflowY: "auto",
          opacity: `${dataMap.length === 0 ? 0 : 1}`
        }}
      >
        {dataMap.map((_, i) => (
          <div
            key={i}
            className="list-type"
            onClick={e => chooseType(e, "type", _.title)}
          >
            {_.title}
          </div>
        ))}
      </div>
      {isFocus ? <ComponentType {...props} /> : null}
    </div>
  );
}
//组件类型选择
function ComponentType({
  currentType,
  currentValue,
  isFocus,
  currentChoosedKey,
  searchContent,
  propsCompList,
  ...prop
}) {
  let showClass =
    isFocus === undefined
      ? searchContent[currentChoosedKey]
      : isFocus && currentChoosedKey != "type";
  const propsComp =
      HexApi.tool.getAttr(propsCompList[currentChoosedKey]) === "object"
        ? propsCompList[currentChoosedKey]
        : {},
    props = { showClass, propsComp, defaultValue: currentValue, ...prop };
  var render = {
    selectOne: <SelectListOne {...props} />,
    selectMany: <SelectListMany {...props} />,
    radio: <RadioHex {...props} />,
    date: <DateTimeFieldHex {...props} />,
    dateRange: <DateTimeRangeHex {...props} />,
    selectTree: <SelectHexTree {...props} />
  };
  return render[currentType] ? render[currentType] : null;
}
//select 下拉框组件(单选)
const SelectListOne = ({
  showClass,
  chooseDataMap,
  chooseType,
  defaultValue,
  selectProps,
  propsComp
}) => {
  let propsSelect =
    HexApi.tool.getAttr(selectProps) === "object" ? selectProps : {};
  propsSelect = { ...propsSelect, ...propsComp };
  defaultValue = valueSet(defaultValue);
  return (
    <div
      className={`type ${showClass ? "hex-show" : "hex-hide"}`}
      style={{ overflowY: "auto" }}
    >
      <Select
        style={{ width: "100%" }}
        onChange={value => {
          value = chooseDataMap.filter(_ => _.value === value);
          defaultValue === value.value
            ? ""
            : chooseType(undefined, "value", value[0]);
        }}
        defaultOpen
        open
        defaultValue={defaultValue}
        value={defaultValue}
        {...propsSelect}
      >
        {chooseDataMap.map((_, i) => (
          <Option key={_.value} value={_.value}>
            {_.title}
          </Option>
        ))}
      </Select>
    </div>
  );
};
//select 下拉框组件(多选)
const SelectListMany = ({
  showClass,
  chooseDataMap,
  chooseType,
  defaultValue,
  selectProps,
  propsComp
}) => {
  defaultValue = valueSet(defaultValue);
  let propsSelect =
    HexApi.tool.getAttr(selectProps) === "object" ? selectProps : {};
  propsSelect = { ...propsSelect, ...propsComp, mode: "multiple" };
  return (
    <div
      className={`type ${showClass ? "hex-show" : "hex-hide"}`}
      style={{ overflowY: "auto" }}
    >
      <Select
        style={{ width: "100%" }}
        onChange={value => {
          value = value.map(_ => {
            return chooseDataMap.filter(v => v.value == _)[0];
          });
          chooseType(undefined, "value", value, true);
        }}
        defaultOpen
        open
        defaultValue={defaultValue}
        value={defaultValue}
        {...propsSelect}
      >
        {chooseDataMap.map((_, i) => (
          <Option key={_.value} value={_.value}>
            {_.title}
          </Option>
        ))}
      </Select>
    </div>
  );
};
// selectTree 下拉框树
const SelectHexTree = ({
  showClass,
  chooseDataMap,
  chooseType,
  defaultValue,
  selectProps,
  propsComp
}) => {
  defaultValue = valueSet(defaultValue);
  let propsSelect =
    HexApi.tool.getAttr(selectProps) === "object" ? selectProps : {};
  propsSelect = { ...propsSelect, ...propsComp };
  const change = (value, label) => {
    if (propsSelect.multiple) {
      value = value.map((_, i) => {
        return { value: _, title: label[i] };
      });
      chooseType(undefined, "value", value, true);
    } else {
      value = { value, title: label[0] };
      defaultValue != value.value
        ? chooseType(undefined, "value", value)
        : null;
    }
  };
  return (
    <div
      className={`type ${showClass ? "hex-show" : "hex-hide"}`}
      style={{ overflowY: "auto" }}
    >
      <TreeSelect
        style={{ width: "100%" }}
        onChange={change}
        defaultValue={defaultValue}
        value={defaultValue}
        defaultOpen
        open
        treeData={chooseDataMap}
        {...propsSelect}
      />
    </div>
  );
};
//select radio组件(单选)
const RadioHex = ({
  showClass,
  chooseDataMap,
  chooseType,
  defaultValue,
  propsComp
}) => {
  defaultValue = valueSet(defaultValue);
  return (
    <div className={`type ${showClass ? "hex-show" : "hex-hide"}`}>
      <div className="list-type">
        <Radio.Group
          defaultValue={defaultValue}
          value={defaultValue}
          buttonStyle="solid"
          onChange={e => {
            const value = chooseDataMap.filter(_ => _.value === e.target.value);
            chooseType(e, "value", value[0]);
          }}
          {...propsComp}
        >
          {chooseDataMap &&
            chooseDataMap.map(_ => (
              <Radio.Button key={_.title} value={_.value}>
                {_.title}
              </Radio.Button>
            ))}
        </Radio.Group>
      </div>
    </div>
  );
};
// 日期组件
const DateTimeFieldHex = ({
  showClass,
  chooseType,
  defaultValue,
  propsComp
}) => {
  return (
    <div className={`type ${showClass ? "hex-show" : "hex-hide"}`}>
      <DatePicker
        open
        mode="date"
        format="YYYY-MM-DD"
        showToday={false}
        value={defaultValue ? moment(defaultValue) : moment()}
        onChange={val =>
          chooseType("", "value", moment(val).format("YYYY-MM-DD"))
        }
        {...propsComp}
      />
    </div>
  );
};
// 日期范围组件
const DateTimeRangeHex = ({
  showClass,
  chooseType,
  defaultValue,
  propsComp
}) => {
  let value = defaultValue ? defaultValue.split(",") : [moment(), moment()];
  value = value.map(_ => moment(_));
  return (
    <div className={`type ${showClass ? "hex-show" : "hex-hide"}`}>
      <RangePicker
        open
        format="YYYY-MM-DD"
        value={value}
        onChange={val => {
          val = val.map(_ => moment(_).format("YYYY-MM-DD"));
          val = val.join(",");
          chooseType("", "value", val);
        }}
        {...propsComp}
      />
    </div>
  );
};
//最近搜索历史的记录-组件
class SearchHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showHistory: false
    };
  }
  showHistory = () => {
    this.setState({ showHistory: !this.state.showHistory });
  };
  shouldComponentUpdate(props, state) {
    return true;
  }
  //获取本地的搜索历史的缓存
  getLocalStorage() {
    let hexSearchLocal = Store.get(`hexSearchLocal${this.props.activeKey}}`);
    if (!hexSearchLocal) return [];
    if (HexApi.tool.getAttr(hexSearchLocal) != "array") return [];
    return hexSearchLocal;
  }
  //清除本地localstorge
  clearHistory = () => {
    const hexSearchLocal = Store.get(`hexSearchLocal${this.props.activeKey}}`);
    if (!hexSearchLocal) return;
    Store.remove("hexSearchLocal");
    const timer = setTimeout(() => {
      this.forceUpdate();
      clearTimeout(timer);
    }, 100);
  };
  //选择此条记录查询
  chooseThisLocal = val => {
    this.setState({ showHistory: false });
    this.props.chooseThisLocal(val);
  };
  //删除此条查询记录
  deleteThisLocal = (e, str) => {
    let hexSearchLocal = Store.get(`hexSearchLocal${this.props.activeKey}}`),
      indexLocal = undefined;
    hexSearchLocal.map((_, i) => {
      if (_.show === str) indexLocal = i;
    });
    indexLocal != undefined ? hexSearchLocal.splice(indexLocal, 1) : null;
    Store.set(`hexSearchLocal${this.props.activeKey}}`, hexSearchLocal);
    const timer = setTimeout(() => {
      this.forceUpdate();
      clearTimeout(timer);
    }, 100);
    e.stopPropagation();
  };
  render() {
    const local = this.getLocalStorage(),
      { showHistory } = this.state,
      { showLocal } = this.props;
    return (
      <div className="search-history">
        <div className="search-button" onClick={this.showHistory}>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1792"
              height="1792"
              viewBox="0 0 1792 1792"
            >
              <path d="M1664 896q0 156-61 298t-164 245-245 164-298 61q-172 0-327-72.5T305 1387q-7-10-6.5-22.5t8.5-20.5l137-138q10-9 25-9 16 2 23 12 73 95 179 147t225 52q104 0 198.5-40.5T1258 1258t109.5-163.5T1408 896t-40.5-198.5T1258 534t-163.5-109.5T896 384q-98 0-188 35.5T548 521l137 138q31 30 14 69-17 40-59 40H192q-26 0-45-19t-19-45V256q0-42 40-59 39-17 69 14l130 129q107-101 244.5-156.5T896 128q156 0 298 61t245 164 164 245 61 298zm-640-288v448q0 14-9 23t-23 9H672q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h224V608q0-14 9-23t23-9h64q14 0 23 9t9 23z" />
            </svg>
          </span>
          <div className="arrow-bottom arrow-box">
            <Icon icon="fa-sort-desc" />
          </div>
        </div>
        <ul
          className="history"
          style={{ display: `${showHistory ? "block" : "none"}` }}
        >
          <li className="first" onClick={this.showHistory} key="first">
            <span>Recent searches</span>
            <div className="delete">
              <Delete />
            </div>
          </li>
          {local.length > 0 ? (
            local.map(_ => (
              <li
                key={_.show}
                onClick={() => this.chooseThisLocal(_.origin)}
                title={_.show}
              >
                <span>{_.show}</span>
                {showLocal.deleteOnly === false ? null : (
                  <div
                    className="localDelete"
                    onClick={e => this.deleteThisLocal(e, _.show)}
                  >
                    <Delete />
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="noLocal">You don't have any recent searches</li>
          )}
          {local.length > 0 ? (
            <li onClick={this.clearHistory} key="last">
              Clear recent searches
            </li>
          ) : null}
        </ul>
      </div>
    );
  }
}
//删除按钮
const Delete = () => (
  <div
    className="Select-value-icon"
    style={{
      fontSize: "20px",
      lineHeight: "20px",
      display: "flex",
      alignItems: "center"
    }}
  >
    ×
  </div>
);

//value 类型的判断取之
const valueSet = defaultValue => {
  const type = HexApi.tool.getAttr(defaultValue);
  if (type === "array") {
    defaultValue.length == 0
      ? (defaultValue = [{ value: "", title: "" }])
      : null;
    defaultValue = defaultValue.filter(_ => _.value).map(_ => _.value);
  } else if (type === "object") {
    defaultValue = defaultValue.value ? defaultValue.value : "";
  }
  return defaultValue;
};
// 搜索顺序的排布
function objSort(obj, key, val) {
  let newObj = {},
    newArr = JSON.parse(JSON.stringify(Object.keys(obj)));
  Object.keys(obj).map((_, i) => {
    if (_ === key) {
      val === undefined ? (newArr.splice(i, 1), newArr.push(_)) : null;
    }
  });
  newArr.map(_ => {
    newObj[_] = obj[_];
  });
  return newObj;
}
