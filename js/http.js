;(function($){

	function Http(){
		var self = this;
		this.callbacks = {
			//请求前置操作
			before:function(argument) {
						
			},
			//请求成功操作
			success:function(data){
				self.handle(data);
			},
			//请求错误操作
			error:function(XMLHttpRequest, textStatus, errorThrown){

			},
			//请求后置操作
			after:function(){

			}
		};

		this.statusCodes = {
			'404':'请求的页面不存在'
		};
	}

	//GET请求处理
	Http.prototype.get = function(url,args,callbacks){
		return this.load(url,args,'GET',callbacks);
	}

	//POST请求处理
	Http.prototype.post = function(url,args,callbacks){
		return this.load(url,args,'POST',callbacks);
	}

	//请求处理
	Http.prototype.load = function(url,args,type,callbacks){

		var self = this,callbackType = typeof callbacks;

		if (callbackType === 'function') {
			//默认只有成功回调函数
			callbacks = $.extend({},self.callbackList, {success: callbacks});
		}else if(callbackType === 'object'){
			//覆盖默认回调函数
			callbacks = $.extend({}, self.callbackList, callbacks);
		}else{
			//使用默认回调函数
			callbacks = self.callbackList;
		}

		type = type || 'GET';

		$.ajax({
			url: url,
			type: type,
			data: data || {},
			beforeSend: function(){
				typeof callbacks.before === 'function' && callbacks.before.apply(this, arguments);
			},
			success: function(){
				typeof callbacks.success === "function" && callbacks.success.apply(this, arguments);
			},
			error: function () {
				typeof callbacks.error === "function" && callbacks.error.apply(this, arguments);
			},
			after: function(){
				typeof callbacks.after === "function" && callbacks.after.apply(this, arguments);
			}
		});
	}

	//请求回调函数自动处理
	Http.prototype.handle = function(data){

	}

})(jQuery);