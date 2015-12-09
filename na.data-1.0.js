/**
 * @name 自定义对象功能 na.object
 * @version version 1.0
 * @author Na Chao
 * @fileoverview
 * 	
 *	一个轻量级的前端数据管理工具，主要支持前端的数据增删改查等的快捷操作。
 *	
 */
function nData ( param ) {

	/**
	*  初始化配置参数
	*  @private
	*/
	this._Param = {
		key: 'id',		// 唯一键值
	};


	/**
	*  功能数据
	*  @private
	*/
	this._Datas = {};


	/**
	*  数据修改监听
	*  @private
	*/
	this._Ons = {};


	/**
	*  保存引用的其他功能
	*  @private
	*/
	this._Libs = {};


	/**
	*  初始化功能参数
	*  @public
	*/
	this._Method_setParam(param);
}





///////////////////////////////////////////////////////////
// 
//  Data_ 管理数据类
//
/////////////////////////////


/**
*  对数据进行初始化，包括管理元素，扩展方法
*
*  @param {object} value
*  @return {object}
*  @private
*/
nData.prototype._Data_init = function ( value ) {
	var that = this,
		data = $.extend({}, value);

	value = $.extend(value, {
		el: null,
		_get: function () {
			return data;
		},
		_set: function ( value ) {
			that._Data_set(this, value);
			that._Method_emit('set', this);
		},
		_del: function () {
			that._Data_delete(this);
			that._Method_emit('del', this);
		},
		_el: function ( el ) {	// 设置关联元素
			this.el = el;
			that._Method_emit('el', this);
		},
		_show: function ( ishow ) {
			if ( ishow )
				this.el.show();
			else
				this.el.hide();
		}
	});

	that._Method_emit('add', value);

	return value;
}


/**
*  保存数据，并对数据进行初始化
*
*  @param {object} value
*  @return {object}
*  @private
*/
nData.prototype._Data_add = function ( value ) {
	var key;

	if ( typeof value == 'object' ) {
		key = value[this._Param.key];
	}
	if ( key && !this._Datas[key] ) {
		this._Datas[key] = this._Data_init(value);
	}

	return value;
}


/**
*  保存数据组
*
*  @param {array<object>} value
*  @return {array<object>}
*  @private
*/
nData.prototype._Data_adds = function ( values ) {
	var that = this;

	values.map(function(value){
		that._Data_add(value);
	});

	return values
}


/**
*  获取数据元素，根据唯一值
*
*  @param {string} key
*  @return {object}
*  @private
*/
nData.prototype._Data_getByKey = function ( key ) {
	return this._Datas[key];
}


/**
*  获取数据元素集合，根据多个唯一值
*
*  @param {array<string>} keys
*  @return {array<object>}
*  @private
*/
nData.prototype._Data_getByKeys = function ( keys ) {
	var result = [],
		that = this;

	$(keys).each(function(i, key){
		if ( that._Datas[key] )
			result.push(that._Datas[key])
	});

	return result;
}


/**
*  获取数据元素，全局搜索数据
*
*  @param {string|function} value
*  @return {array<object>} 
*  @private
*/
nData.prototype._Data_getBySearch = function ( value, param ) {
	param = param || {};

	var result = [],
		objs = this._Data_getAll(param),
		search = param.search;

	if ( objs.length ) {

		if ( !search ) {
			search = [];
			for ( var key in objs[0]._get() ) {
				search.push(key);
			}
		}

		$(objs).each(function(i, obj){

			if ( typeof value == 'string' ) {
				for ( var i = 0; i < search.length; i++ ) {
					if ( String(obj[search[i]]).toLocaleLowerCase().indexOf(String(value).toLocaleLowerCase()) >= 0 ) {
						result.push(obj);
						break;
					}
				}
			}

			else if ( $.isFunction(value) && value(obj) ) {
				result.push(obj);
			}
		});
	}

	return result;
}


/**
*  获取数据元素，根据指定的分段
*
*  @return {array<object>} 
*  @private
*/
nData.prototype._Data_getByPage = function ( param ) {
	param = param || {};

	var result = [],
		objs = this._Data_getAll(param),
		page = param.page || 0,
		number = param.number || 10;

	if ( objs.length )
		result = objs.slice(page * number, (page + 1) * number);

	return result;
}


/**
*  获取全部数据元素
*
*  @return {array<object>} 
*  @private
*/
nData.prototype._Data_getAll = function ( param ) {
	param = param || {};

	var result = [],
		objs = param.objs || this._Datas;

	if ( $.isPlainObject(objs) ) {
		for ( var key in objs ) {
			result.push(objs[key]);
		}
	}
	else if ( $.isArray(objs) ) {
		for ( var i = 0; i < objs.length; i++ ) {
			result.push(objs[i]);
		}
	}

	return result;
}


/**
*  设置数据
*
*  @param {string|object} value = 指定的数据元素唯一值，或者数据元素
*  @return {string|object}
*  @private
*/
nData.prototype._Data_set = function ( obj, value ) {

	if ( typeof obj == 'string' )
		obj = this._Data_getByKey(obj);

	if ( $.isPlainObject(obj) && $.isPlainObject(value) ) {
		for ( var key in value ) {
			obj[key] = value[key];
		}
	}

	return obj;
}


/**
*  删除数据
*
*  @param {string|object} value = 指定的数据元素唯一值，或者数据元素
*  @return {string|object}
*  @private
*/
nData.prototype._Data_delete = function ( obj ) {

	if ( typeof obj == 'string' )
		obj = this._Data_getByKey(obj);

	if ( $.isPlainObject(obj) ) {
		delete obj;
	}

	return obj;
}





///////////////////////////////////////////////////////////
// 
//  Style_ 元素及样式管理类
//
/////////////////////////////


/**
*  创建元素
*
*  @private
*/
nData.prototype._Styel_add = function () {

}





///////////////////////////////////////////////////////////
// 
//  Comm_ 原生js扩展
//
/////////////////////////////


/**
*  扩展数据
*
*  @private
*/
nData.prototype._Comm_array = function ( value ) {
	$.extend(value, {
		_get: function () {
			var result = [];
			$(this).each(function(i, val){
				result.push(val._get());
			});
			return result;
		},
		_set: function ( value ) {
			$(this).each(function(i, val){
				val._set(value);
			});
			return this;
		},
		_del: function () {
			$(this).each(function(i, val){
				val._del();
			});
			return this;
		},
		_el: function ( el ) {	// 设置关联元素
			var result = [];
			$(this).each(function(i, val){
				result.push(val._el());
			});
			return result;
		},
		_show: function () {
			$(this).each(function(i, val){
				val.el.show();
			});
			return this;
		},
		_hide: function ( ishow ) {
			$(this).each(function(i, val){
				val.el.hide();
			});
			return this;
		}
	});

	return value;
}





///////////////////////////////////////////////////////////
// 
//  Method_ 数据方法扩展
//
/////////////////////////////


/**
*  回复监听
*
*  @private
*/
nData.prototype._Method_emit = function ( key, obj ) {
	var param = this._Param;
	if ( this._Ons[key] ) {
		$(this._Ons[key]).each(function(i, callback){
			callback(obj, param);
		});
	}
}


/**
*  设置配置参数
*
*  @private
*/
nData.prototype._Method_setParam = function ( value ) {
	if ( $.isPlainObject(value) ) {
		for ( var key in value ) {
			this._Param[key] = value[key];
		}
	}
}


/**
*  自定义数据扩展方法
*
*  @private
*/
nData.prototype._Method_extend = function ( event, callback, type ) {
	if ( $.isPlainObject(value) ) {
		for ( var key in value ) {
			this._Param[key] = value[key];
		}
	}
}










///////////////////////////////////////////////////////////
// 
//  Lib_ 引用其他的功能
//
/////////////////////////////


/**
*  初始化
*
*  @private
*/
nData.prototype._Lib_init = function () {

}





///////////////////////////////////////////////////////////
// 
//  公共方法
//
/////////////////////////////


/**
*  添加
*
*  @param {object|array<object>} value = 数据内容必须包含 id
*  @return {object} 返回元素对象
*  @private
*/
nData.prototype.add = function ( value ) {
	if ( $.isPlainObject(value) )
		this._Data_add(value);
	else if ( $.isArray(value) )
		this._Data_adds(value);

	return value;
}


/**
*  获取
*
*  @param {string|function|array} value = 需要获取的key值
*  @param {string|object} param = 设置获取的方式 'param', 'key', 'search', 'lib'
*  						param = 详细设置：mode：方式；search：[]搜索明细；
*  @return {object} 返回元素对象
*  @private
*/
nData.prototype.get = function ( value, param ) {
	var result,
		conf = {};

	if ( typeof param == 'string' )
		conf.mode = param;
	else if ( $.isPlainObject(param) )
		conf = param;


	if ( !conf.mode )
		conf.mode = 'key';


	if ( !value )
		result = this._Data_getAll();

	else if ( typeof value == 'string' && conf.mode == 'key' )
		result = this._Data_getByKey(value);

	else if ( $.isArray(value) && conf.mode == 'key' )
		result = this._Data_getByKeys(value);

	else if ( typeof value == 'string' && conf.mode == 'lib' )
		result = [];
	
	else if ( typeof value == 'string' && conf.mode == 'param' )
		result = this._Param[value];

	else if ( $.isPlainObject(value) )
		result = this._Data_getByPage(value); 

	else if ( !!value && conf.mode == 'search' )
		result = this._Data_getBySearch(value); 


	if ( $.isArray(result) )
		result = this._Comm_array(result);

	return result;
}


/**
*  设置
*
*  @param {object} value = 设置配置参数
*  @return {object} 返回 nData 功能
*  @private
*/
nData.prototype.set = function ( value ) {
	this._Method_setParam(value);
}


/**
*  监听数据修改
*
*  @param {string} key = 监听数据操作：set、del、add
*  @param {function} callback = 监听操作发生时，执行的函数
*  @return {object} 返回 nData 功能
*  @private
*/
nData.prototype.on = function ( key, callback ) {
	if ( typeof key == 'string' && $.isFunction(callback) ) {
		if ( this._Ons[key] )
			this._Ons[key].push(callback);
		else
			this._Ons[key] = [callback];
	}
}


/**
*  扩展数据方法
*
*  @param {string} key = 监听数据操作：set、del、add
*  @param {function} callback = 监听操作发生时，执行的函数
*  @return {object} 返回 nData 功能
*  @private
*/
nData.prototype.extend = function ( event, callback, type ) {
	
}

