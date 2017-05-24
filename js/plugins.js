;(function(factory){
  if (typeof define === "function" && define.amd) {
    define(["jquery"],factory);
  }else{
    factory(jQuery);
  }
}(function($){

"use strict";

var out = {}; // 输出的对象

/**
 * 消息提示
 */
function _msg() {
	this.version = "1.0.0";
	this.shade = false;
	this.index = 0;
}

/**
 * 关闭指定弹窗
 */
_msg.prototype.close = function (index) {
	return layer.close(index || this.index);
};

/**
 * 提示弹窗
 */
_msg.prototype.alert = function (msg, callback) {
	return this.index = layer.alert(msg, callback);
};

/**
 * 错误弹窗
 */
_msg.prototype.error = function (msg, callback, time) {
	return this.index = layer.msg(msg || '操作错误', {time: time || 2000, icon: 2, shade: this.shade}, callback);
};

/**
 * 成功弹窗
 */
_msg.prototype.success = function (msg, callback, time) {
	return this.index = layer.msg(msg || '操作成功', {time: time || 1000, icon: 1, shade: this.shade}, callback);
};

/**
 * 警告弹窗
 */
_msg.prototype.warning = function (msg, callback, time) {
	return this.index = layer.msg(msg || '警告', {time: time || 1000, icon: 0, shade: this.shade}, callback);
};

/**
 * 询问弹窗
 */
_msg.prototype.confirm = function (msg, yes, no) {
	return this.index = layer.confirm(msg, {
		btn: ['确定', '取消']
	}, yes, no);
};

/**
 * 吐司提示
 */
_msg.prototype.toast = function (msg, during) {
	return this.index = layer.msg(msg, {time: during || 3000, shade: this.shade});
};

/**
 * 加载中提示
 */
_msg.prototype.loading = function (msg, callback) {
	return this.loadingIndex = msg ? layer.msg(msg, {icon: 16, shade: this.shade, time: 0, end: callback})
			: layer.load(2, {time: 0, shade: this.shade, end: callback});
};

_msg.prototype.closeLoading = function () {
	return layer.close(this.loadingIndex);
};

/**
 * IFRAME层
 */
_msg.prototype.iframe = function (title, url, width, height) {
	var self = this;
//	$.http.get(url, {}, function(res){
		return self.layer.open({
			type: 2,
			title: title,
			shadeClose: true,
			shade: false,
			maxmin: true, //开启最大化最小化按钮
			area: [width || '893px', height || '600px'],
			content: url
		});
//	});
};

_msg.prototype.closeIframeByName = function(name) {
	var index = layer.getFrameIndex(name);
	return layer.close(index);
};

out.msg = new _msg();

/**
 * HTTP异步请求
 */
function _http() {
	this.version = "1.0.0";
	var self = this;
	this.callbackList = {
		before: function() {
			self.loadingTipIndex = $.msg.loading();
		},
		success: function(data) {
			self.handle(data);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			if (self.csrf !== null && XMLHttpRequest.status === 400) {
				$.msg.warning('请勿重复提交数据');
			} else {
				$.msg.toast(self.getError(XMLHttpRequest.status, errorThrown));
			}
		},
		after: function() {
			$.msg.close(self.loadingTipIndex);
		}
	};
	this.init();
}

_http.prototype.init = function(){
	this.statusCodes = {'404':'请求的页面不存在'};
};

_http.prototype.getError = function(statusCode, errorThrown) {
	return typeof this.statusCodes[statusCode] !== 'undefined' ? this.statusCodes[statusCode] : '网络错误，请稍后重试 [ ' + (statusCode ? 'E - ' + statusCode : errorThrown) + ' ]';
};

_http.prototype.get = function(url, data, callbacks) {
	return this.load(url, data, 'get', callbacks);
};

_http.prototype.post = function(url, data, callbacks) {
	return this.load(url, data, 'post', callbacks);
};

_http.prototype.load = function (url, data, type, callbacks) {
	var self = this, callbackType = typeof callbacks;
	// 回调函数处理
	if (callbackType === 'function') {
		callbacks = $.extend({}, self.callbackList, {success: callbacks});
	} else if (callbackType === 'object') {
		callbacks = $.extend({}, self.callbackList, callbacks);
	} else {
		callbacks = self.callbackList;
	}
	type = type || 'GET';
	if (['GET', 'HEAD', 'OPTIONS'].indexOf(type.toUpperCase()) < 0) { // 部分请求拼接TOKEN
		self.csrf = getCsrf();
		var dType = typeof(data);
		if (dType === 'string') {
			if (data !== '') data += '&';
			data += self.csrf.name + '=' + self.csrf.value;
		} else if (data.length) {
			data.push({name:self.csrf.name,value:self.csrf.value});
		} else if (dType === 'object') {
			data[self.csrf.name] = self.csrf.value;
		}
	}
	return $.ajax({
		url: url,
		type: type,
		data: data || {},
		beforeSend: function () {
			typeof callbacks.before === "function" && callbacks.before.apply(this, arguments);
		},
		success: function () {
			typeof callbacks.success === "function" && callbacks.success.apply(this, arguments);
		},
		error: function () {
			typeof callbacks.error === "function" && callbacks.error.apply(this, arguments);
		},
		complete: function () {
			typeof callbacks.after === "function" && callbacks.after.apply(this, arguments);
		}
	});
};

/**
 * 请求返回JSON自动处理
 */
_http.prototype.handle = function (res) {
	if (typeof res === 'object') {
		if (typeof window.onhashchange !== 'function') {
			if (res.status === 1) {
				out.msg.success(res.info, 1000, function(){
					if (res.url) location.href = res.url;
					else location.reload();
				});
			} else {
				out.msg.error(res.info, 2000, function () {
					if (res.url) location.href = res.url;
				});
			}
			return;
		}

		if (res.status === 1) {
			out.msg.success(res.info, 1000, function(){
				res.url ? $.page.redirect(res.url) : $.page.reload();
			});
		} else if (res.status === -1) {
			out.msg.warning(res.info, 1000, function(){
				if (res.url) location.href = res.url + '?redirectURL=' + location.hash.replace('#', '');
				else location.reload();
			});
		} else {
			out.msg.error(res.info, 2000, function () {
				res.url && $.page.redirect(res.url);
			});
		}
		return;
	}
	$.modal.render(res);
};

out.http = new _http();



/**
 * 模态框
 */
function _modal() {
	this.version = "1.0.0";
	this.index = 0;
	this.queue = [];
}

_modal.prototype.render = function(html) {
	var self = this, index = ++this.index;
	this.queue[index] = $(html).appendTo(document.body).on('shown.bs.modal',function(){
		$(this).find('form[data-validate]').myValidate(function(data){
			if (typeof data === 'object') {
				data.status === 1 && self.close(index);
				$.http.handle(data);
				return;
			}
			$.msg.toast('页面请求错误，请稍候重试');
		});
	}).modal('show').on('hidden.bs.modal', function () {
		delete(self.queue[index]);
		$(this).remove();
	});
	return index;
};

_modal.prototype.load = function(url) {
	$.http.get(url, {}, function(res){
		$.http.handle(res);
	});
};

_modal.prototype.close = function(index) {
	index = index || this.index;
	this.queue[index].modal('hide');
	delete this.queue[index];
};

_modal.prototype.closeAll = function() {
	for(var i in this.queue) {
		this.close(i);
	}
};

out.modal = new _modal();



/**
 * 表单相关操作
 */
function _form() {
	this.version = "1.0.0";
}

_form.prototype.submit = function(form, callback){
	var $this = $(form), events = $._data(form, 'events'), callback = callback || {};
	if (typeof (events['requestComplete']) !== 'undefined') {
		callback.success = function(data){
			$this.trigger('requestComplete', data);
		};
	}
	$.http.load($this.attr('action'), $this.serializeArray(), $this.attr('method'), callback);
};

out.form = new _form();

// 扩展方法到JQ
$.extend(out);

}));