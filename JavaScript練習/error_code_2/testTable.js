/*
狀態：未解決

預期結果：把 原始列 上下拖移後，會在 table同一行 目標列 上方或下方 出現 原始列。

實際情況：把 原始列 上下拖移後，會在 table 加開 第二行 第三行 並在目標列右邊出現原始列。

推測程式錯誤區塊：25行 ~ 71行 的 function dropHandler(e)。
*/

"use strict";

var showDataObj = document.getElementById("showData");
var addRowObj = document.getElementById("addRow");
var countRow = 0;// 計算有幾列
var editList = [];// 儲存分類清單的陣列

function dragoverHandler(e) {
	// 滑鼠左鍵按住不放狀態
	// console.log('dragoverHandler');
	// 取消預設動作
	e.preventDefault();
}

function dropHandler(e) {
	// 放開滑鼠左鍵，把拖移物件放下狀態
	console.log('dropHandler');
	// 取消預設動作
	e.preventDefault();

	// 取出拖放資料
	var text1Data = e.dataTransfer.getData("text1");// 欄位資料
	var id2Data = e.dataTransfer.getData("id2");// 欄位編號

	var newTrObj = document.createElement("tr");
	newTrObj.setAttribute("draggable", "true");

	// 第1個 td
	var td1Obj = document.createElement("td");
	td1Obj.setAttribute("align", "center");
	td1Obj.setAttribute("class", "no");
	console.log('e');
	console.log(e);
	td1Obj.appendChild(document.createTextNode(id2Data));
	newTrObj.appendChild(td1Obj);

	// 第2個 td
	var td2Obj = document.createElement("td");
	td2Obj.setAttribute("width", "160px");
	var inputObj = document.createElement("input");
	inputObj.setAttribute("type", "text");
	inputObj.setAttribute("name", "typeList");
	inputObj.setAttribute("value", text1Data);
	td2Obj.appendChild(inputObj);
	newTrObj.appendChild(td2Obj);

	// 第3個 td
	var td3Obj = document.createElement("td");
	var buttonObj = document.createElement("button");
	buttonObj.setAttribute("type", "button");
	buttonObj.setAttribute("onclick", "deleteRow(this)");
	buttonObj.innerText = "刪除";
	td3Obj.appendChild(buttonObj);
	newTrObj.appendChild(td3Obj);

	newTrObj.addEventListener("dragstart", dragStartHandler);
	newTrObj.addEventListener("dragover", dragoverHandler);
	newTrObj.addEventListener("drop", dropHandler);

	e.currentTarget.appendChild(newTrObj);
}

function dragStartHandler(e) {
	// 當目標物被滑鼠左鍵點住拖移時
	// 儲存要拖放的資料
	console.log('dragStartHandler');

	// 文字內容
	e.dataTransfer.setData("text1", e.target.childNodes[1].childNodes[0].value);

	// id編號
	e.dataTransfer.setData("id2", e.target.childNodes[0].childNodes[0].nodeValue);
}

function initialTable() {
	// 初始化整個分類清單
	var length = editList.length;
	for (countRow = 0; countRow < length; countRow++) {
		var newTrObj = document.createElement("tr");
		newTrObj.setAttribute("draggable", "true");

		// 第1個 td
		var td1Obj = document.createElement("td");
		td1Obj.setAttribute("align", "center");
		td1Obj.setAttribute("class", "no");
		td1Obj.appendChild(document.createTextNode(String(countRow + 1)));
		newTrObj.appendChild(td1Obj);

		// 第2個 td
		var td2Obj = document.createElement("td");
		td2Obj.setAttribute("width", "160px");
		var inputObj = document.createElement("input");
		inputObj.setAttribute("type", "text");
		inputObj.setAttribute("name", "typeList");
		inputObj.setAttribute("value", editList[countRow]);
		if (countRow === 0) {
			// 第一列禁止修改編輯
			inputObj.setAttribute("readonly", "readonly");
			// 第一列禁止拖移
			newTrObj.setAttribute("draggable", "false");
		} else if (countRow === 1) {
			// 第二列自動聚焦
			inputObj.setAttribute("autofocus", "autofocus");
		} else {
			// do nothing
		}
		td2Obj.appendChild(inputObj);
		newTrObj.appendChild(td2Obj);

		// 第3個 td
		var td3Obj = document.createElement("td");
		var buttonObj = document.createElement("button");
		buttonObj.setAttribute("type", "button");
		buttonObj.setAttribute("onclick", "deleteRow(this)");
		buttonObj.innerText = "刪除";
		td3Obj.appendChild(buttonObj);
		newTrObj.appendChild(td3Obj);

		showDataObj.appendChild(newTrObj);
		// 從for迴圈出來後 countRow === length ，所以外面不需要再做 countRow++; 的動作。

		newTrObj.addEventListener("dragstart", dragStartHandler);
		newTrObj.addEventListener("dragover", dragoverHandler);
		newTrObj.addEventListener("drop", dropHandler);
	}
}

var result = ['未分類', 'C', 'Java', 'C++', 'JavaScript'];

for (var i = 0, len = result.length; i < len; i++) {
	editList.push(result[i]);
}

for (var i = 1; i <= 3; i++) {
	// 再加入3個預設的空白。
	editList.push("");
}

// 開始執行繪製表格的動作
initialTable();

function renameTdNo() {
	var tdNoArray = document.getElementsByClassName("no");
	var length = tdNoArray.length;
	var n = 1;
	for (var i = 0; i < length; i++) {
		tdNoArray[i].innerText = String(n);
		n = n + 1;
	}
}

// 刪除一列
function deleteRow(buttonObj) {
	var isDelete = confirm("確定要刪除嗎？");
	if (true === isDelete) {
		if (countRow === 1) {
			// 只剩一列就不要再刪了。
			window.alert("分類名單不可為空！");
			return;
		}
		var trObj = buttonObj.parentElement.parentElement;
		var td1NoObj = trObj.childNodes[0];
		if (td1NoObj.childNodes[0].nodeValue === "1") {
			// 檢查是否為第一列的程式
			// 第一列 [未分類] 禁止使用者刪除
			window.alert("[未分類] 為不可刪除項目！");
			return;
		}

		var tbodyObj = buttonObj.parentElement.parentElement.parentElement;
		tbodyObj.removeChild(trObj);

		renameTdNo();
		countRow = countRow - 1;
	} else {
		// do nothing
	}
}

// 新增一列
addRowObj.addEventListener("click", function () {
	var lastTrObj = document.querySelector("#showData tr:last-child");

	var newTrObj = document.createElement("tr");

	// 第1個 td
	var td1Obj = document.createElement("td");
	td1Obj.setAttribute("align", "center");
	td1Obj.setAttribute("class", "no");
	td1Obj.appendChild(document.createTextNode(String(countRow)));
	newTrObj.appendChild(td1Obj);

	// 第2個 td
	var td2Obj = document.createElement("td");
	td2Obj.setAttribute("width", "160px");
	var inputObj = document.createElement("input");
	inputObj.setAttribute("type", "text");
	inputObj.setAttribute("name", "typeList");
	inputObj.setAttribute("value", "");
	td2Obj.appendChild(inputObj);
	newTrObj.appendChild(td2Obj);

	// 第3個 td
	var td3Obj = document.createElement("td");
	var buttonObj = document.createElement("button");
	buttonObj.setAttribute("type", "button");
	buttonObj.setAttribute("onclick", "deleteRow(this)");
	buttonObj.innerText = "刪除";
	td3Obj.appendChild(buttonObj);
	newTrObj.appendChild(td3Obj);

	lastTrObj.insertAdjacentElement("afterend", newTrObj);

	renameTdNo();
	countRow = countRow + 1;
});