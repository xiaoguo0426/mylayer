;(function(factory){
  if (typeof define === "function" && define.amd) {
    define(["jquery"],factory);
  }else{
    factory(jQuery);
  }
}(function($){

"use strict";

$(document.body).on('click', '[data-logout]', function (e) {
	e.preventDefault();
	$.msg.loading('退出登录中');
	$.get($(this).data('logout'),function(res){
		location.href = res.url + '?redirectURL=' + getHashUrl();
	}, 'json');
}).on('click', '[data-href]', function (e) {
	e.preventDefault();
	$.page.redirect($(this).data('href'));
}).on('click', '[data-load]', function (e) {
	e.preventDefault();
	$.http.get($(this).data('load'));
}).on('click', '[data-modal]', function (e) {
	e.preventDefault();
	$.modal.load($(this).data('modal'));
}).on('click', '[data-change-status]', function (e) {
	e.preventDefault();
	var $_self = $(this);
	$.http.post($_self.data('change-status'), {id: $_self.data('id') || '', status: $_self.data('status') || '0'});
}).on('click', '[data-del]', function (e) {
	e.preventDefault();
	var $_self = $(this), id = $_self.data('id');
	if (!id) {
		id = $.table.getChecked();
		if (!id.length) return;
	}
	$.msg.confirm('确定删除该数据？', function () {
		$.msg.close();
		$.http.post($_self.data('del'), {id: id});
	});
}).on('click', '[data-multiple]', function (e) {
	e.preventDefault();
	var id = $.table.getChecked();
	if (!id.length) return;
	var $_self = $(this), other = $_self.data('other'), data = {};
	if (other) {
		other = other.split(',');
		for (var i = 0; i < other.length; i++) {
			var tmp = other[i].split(':');
			data[tmp[0]] = tmp[1];
		}
	}
	data.id = id;
	$.http.post($_self.data('multiple'), data);
}).on('click', '[data-open]', function (e) { // 打开一个新的标签页
	e.preventDefault();
	window.open($(this).data('open'));
}).on('click', '[data-iframe]', function(e){
	e.preventDefault();
	var $this = $(this);
	$.msg.iframe($this.data('iframe-title'), $this.data('iframe'), $this.data('iframe-width'), $this.data('iframe-height'));
});

}));