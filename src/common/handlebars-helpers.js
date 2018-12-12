Handlebars.registerHelper('addOne', function (index) {
    return index + 1;
});

Handlebars.registerHelper('gender', function (sex) {
    if (sex == 1) {
        return '<td >男</td>';
    } else {
        return '<td >女</td>';
    }
});

Handlebars.registerHelper('duty', function (shift) {
    if (shift == 1) {
        return '<td >白班</td>';
    } else {
        return '<td >晚班</td>';
    }
});

Handlebars.registerHelper('sex', function (shift) {
    if (shift == 1) {
        return '男';
    } else {
        return '女';
    }
});

Handlebars.registerHelper('selSex', function (sex) {
    if (sex == 0) {
        return '<option value="1">男</option>' + '<option value="0" selected = "selected">女</option>';
    } else if (sex == 1) {
        return '<option value="1" selected = "selected">男</option>' + '<option value="0">女</option>';
    } else {
        return '<option value="1">男</option>' + '<option value="0">女</option>';
    }
});

Handlebars.registerHelper('selShift', function (shift) {
    if (shift == 1) {
        return '<option value="1" selected = "selected">白班</option>' + '<option value="2">晚班</option>';
    } else if (shift == 2) {
        return '<option value="1" >白班</option>' + '<option value="2" selected = "selected">晚班</option>';
    } else {
        return '<option value="1">白班</option>' + '<option value="2">晚班</option>';
    }
});

Handlebars.registerHelper('selInvoiceType', function (invoiceType) {
    if (invoiceType == 1) {
        return '<option value="1" selected = "selected">普通发票</option>' + '<option value="2">增值发票</option>';
    } else if (invoiceType == 2) {
        return '<option value="1">普通发票</option>' + '<option value="2" selected = "selected">增值发票</option>';
    } else {
        return '<option value="1">普通发票</option>' + '<option value="0">增值发票</option>';
    }
});

Handlebars.registerHelper('selCredit', function (credit) {
    if (credit == 1) {
        return `<option value="1" selected="selected">A</option>
				<option value="2">B</option>
				<option value="3">C</option>
				<option value="4">D</option>`;
    } else if (credit == 2) {
        return `<option value="1">A</option>
				<option value="2" selected = "selected">B</option>
				<option value="3">C</option><option value="4">D</option>`;
    } else if (credit == 3) {
        return `<option value="1">A</option>
				<option value="2">B</option>
				<option value="3" selected = "selected">C</option>
				<option value="4">D</option>`;
    } else if (credit == 4) {
        return `<option value="1">A</option>
				<option value="2">B</option>
				<option value="3">C</option>
				<option value="4" selected = "selected">D</option>`;
    } else {
        return `<option value="1">A</option>
				<option value="2">B</option>
				<option value="3">C</option>
				<option value="4">D</option>`;
    }
});

Handlebars.registerHelper('selUsable', function (usable) {
    if (usable == 0) {
        return '<option value="0" selected = "selected">不可用</option>' + '<option value="1">可用</option>';
    } else if (usable == 1) {
        return '<option value="0">不可用</option>' + '<option value="1" selected = "selected">可用</option>';
    } else {
        return '<option value="1">可用</option>' + '<option value="0">不可用</option>';
    }
});

Handlebars.registerHelper('checkbox', function (visible) {
    if (visible == 1) {
        return `<input class = "checkbox emes-app-visible emes-helpers-checkbox"
				checked = "checked" type="checkbox" value = "${visible}"/>`;
    } else {
        return `<input class = "checkbox emes-app-visible emes-helpers-checkbox"
				type="checkbox" value = "${visible}"/>`;
    }
});

Handlebars.registerHelper('queryType', function (showType) {
    if (showType == 1) {
        return '文本';
    } else if (showType == 2) {
        return '数字';
    } else if (showType == 3) {
        return '下拉框(单)';
    } else if (showType == 4) {
        return '下拉框(双)';
    } else if (showType == 5) {
        return '单时间';
    } else if (showType == 6) {
        return '双时间';
    }
});

Handlebars.registerHelper('manageControl', function (status) {
    if (status == 0) {
        return '开启';
    } else if (status == 1) {
        return '暂停';
    } else if (status == 2) {
        return '废弃';
    }
});
Handlebars.registerHelper('isusable', function (status) {
    if (status == 0) {
        return '<option value="0" selected = "selected">不可用</option>' + '<option value="1">可用</option>';
    } else {
        return '<option value="0">不可用</option>' + '<option value="1" selected = "selected">可用</option>';
    }
});

Handlebars.registerHelper('addNum', function (index) {
    this.index = index + 1;
    return this.index;
});

Handlebars.registerHelper('dataHandling', function (status, id, genericName, index, userName) {
    if (status == id && typeof (id) != 'undefined' && typeof (index) != 'undefined') {
        let str;
        if (typeof (userName) === 'object') {
            str = `<td class="center isquit">
				<label><input class="checkbox" type="checkbox" name="chk" data-pid="${status}" />'
				<label></label></label>
				</td>
				<td>${index}</td>`;
        } else {
            str = `<td class="center isquit">
					<label>
					<input class="checkbox" type="checkbox" name="chk" data-pid="${status}" data-name="${userName}"/>
					<label></label>
					</label></td>
					<td>${index}</td>`;
        }
        return str;

    } else if (status == genericName && typeof (genericName) != 'undefined') {
        return '<td>' + '<a href="#" class="emes-table-tbody-modify" data-id=' + id + '>' + status + '</a>' + '</td>';
    } else if (typeof (status) === 'object') {
        let content = '';
        for (let k = 0; k < status.length; k++) {
            content = content + status[k].code + ',';
        }
        return '<td>' + content + '</td>';
    } else {
        return '<td>' + status + '</td>';
    }
});
