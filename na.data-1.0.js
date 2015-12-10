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
	this._Param = {};


	/**
	*  功能数据
	*  @private
	*/
	this._Datas = {
		_default: 'default',	// 默认管理数据类
		default: {}				// 默认存储位置
	};


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
*  获取指定的数据类，并刷新数据长度
*
*  @param {string} classify = 选填，需要保存到的指定类，默认为 default
*
*  @return {object}
*  @private
*/
nData.prototype._Data_classify = function ( classify ) {

	if ( !classify )
		classify = this._Datas._default;		// 如果没有指定数据类，则调用默认的

	var result = this._Datas[classify];

	if ( !result )
		result = this._Datas[classify] = {};	// 如果没有此数据类，则创建

	this._Data_length(result);					// 获取数据长度

	return result;
}


/**
*  刷新指定数据类长度
*
*  @param {string} classify = 选填，需要保存到的指定类，默认为 default
*
*  @return {object}
*  @private
*/
nData.prototype._Data_length = function ( data ) {
	var length = 0;

	if ( data ) {
		for ( var key in data ) {					// 计算当前数据长度
			if ( key.indexOf('_') != 0 )
				length += 1;
		}
		data._len = length;
	}

	return data;
}


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
		_el: null,					// 关联的页面元素
		_get: function () {			// 获取数据
			return data;
		},
		_set: function ( value ) {	// 设置数据
			that._Data_setItem(this, value);
			that._Method_emit('set', this);
		},
		_del: function () {			// 删除数据
			that._Data_delete(this);
			that._Method_emit('del', this);
		},
		// _el: function ( el ) {	// 设置关联元素
		// 	this.el = el;
		// 	that._Method_emit('el', this);
		// 	return el;
		// },
		_show: function () {		// 显示元素
			if ( this.el )
				this.el.show();
			that._Method_emit('show', this);
		},
		_hide: function () {		// 隐藏元素
			if ( this.el )
				this.el.hide();
			that._Method_emit('hide', this);
		},
		_invert: function () {		// 反选其他对象数据
		}
	});

	that._Method_emit('add', value);

	return value;
}


/**
*  保存数据，并对数据进行初始化
*
*  @param {object} value
*  @param {string} classify = 选填，需要保存到的指定类，默认为 default
*
*  @return {object}
*  @private
*/
nData.prototype._Data_add = function ( value, classify ) {
	var data = this._Data_classify(classify),
		key = data._key,
		len = data._len;

	if ( value ) {

		if ( $.isPlainObject(value) )						// 如果是对象数据则初始化此数据
			value = this._Data_init(value);

		if ( !key )											// 如果数据类没有主键，则直接保存的数据
			data[len] = value;

		if ( key && $.isPlainObject(value) && value[key] )	// 如果数据类有主键，且对象数据账包含此主键值
			data[value[key]] = value;
	}

	this._Data_length(data);	// 刷新数据长度

	return value;
}


/**
*  保存数据组
*
*  @param {array<object>} value
*  @return {array<object>}
*  @private
*/
nData.prototype._Data_adds = function ( values, classify ) {
	var that = this;

	values.map(function(value){
		that._Data_add(value, classify);
	});

	return values
}


/**
*  获取数据类
*
*  @param {object} param
*
*  @return {object|array} 如果是对象，则是单数据类查询，如果是数组，则是多数据类查询
*  @private
*/
nData.prototype._Data_get = function ( param ) {
	param = param || {};

	var datas = this._Datas,
		result = [];

	if ( param.datas )
		result = param.datas;

	else if ( param.from ) {
		datas = datas[param.from];
		for ( var k in datas ) {
			if ( k.indexOf('_') < 0 )
				result[k] = datas[k];
		}
	}
	else if ( param.mode == 'key' ) {
		for ( var k in datas ) {
			if ( datas[k]._key )
				result.push(datas[k]);
		}
	}
	else {
		for ( var key in datas )
			result.push(datas[key]);
	}

	console.log(param);

	return result;
}


/**
*  获取数据元素，根据唯一值
*
*  @param {string} key
*
*  @return {object|array}
*  @private
*/
nData.prototype._Data_getByKey = function ( key, param ) {
	param = param || {};

	var result = [],
		datas = this._Data_get(param);

	if ( typeof key == 'string' ) {

		if ( $.isPlainObject(datas) ) {
			result.push(datas[key]);
		}
		else if ( $.isArray(datas) ) {
			console.log(key, datas);
			$(datas).each(function(i, data){
				if ( data[key] )
					result.push(data[key]);
			});
		}
	}

	return result;
}


/**
*  获取数据元素集合，根据多个唯一值
*
*  @param {array<string>} keys
*  @return {array<object>}
*  @private
*/
nData.prototype._Data_getByKeys = function ( keys, param ) {
	keys = keys || [];
	param = param || {};

	var result = [],
		datas = this._Data_get(param),
		that = this;

	if ( $.isArray(keys) ) {
		for ( var key in that._Datas ) {
				if ( keys.indexOf(key) >= 0 )
					result.push(that._Datas[key]);
		}
	}

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
		datas = this._Data_get(param);

	console.log(datas);

	if ( $.isPlainObject(datas) ) {
		for ( var k in datas ) {
			result.push(datas[k]);
		}
	} 
	else {
		result = datas;
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
nData.prototype._Data_setItem = function ( obj, value ) {

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


/**
*  设置配置参数
*
*  @private
*/
nData.prototype._Method_ajax = function ( value ) {
	$.ajax(value);
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
*  添加数据
*
*  @param {object|array<object>} value = 数据内容必须包含 id
*  @param {string} classify = 选填，保存到指定的数据分类中
*
*  @return {object} 返回元素对象
*  @private
*/
nData.prototype.add = function ( value, classify ) {
	if ( $.isArray(value) )
		this._Data_adds(value, classify);
	else 
		this._Data_add(value, classify);

	return value;
}


/**
*  设置指定数据类主键
*
*  @param {string} key
*
*  @private
*/
nData.prototype.key = function ( key, classify ) {
	this._Data_classify(classify)._key = key;
}


/**
*  获取
*
*  @param {string|function|array} value = 获取条件
*  @param {string|object} param = 设置获取的方式 'key', 'param', 'search', 'lib'
*  		{object} param = 详细设置：
*			{string}		mode = 获取方式；
*			{array<string>} search = 搜索明细，注：获取方式为 search 时，此参数才有效；
*			{boolean} 		invert = 是否反选（默认false）；
*			{array|object} 	datas = 在指定的数据集中获取，默认为全部数据；
*			{string} 		from = 在指定数据类中获取，默认为全部数据类。注：如设置过数据集，设置数据类则无效；
*
*  @return {object} 返回元素对象
*  @private
*/
nData.prototype.get = function ( value, param ) {
	var result,
		conf = {};

	if ( $.isPlainObject(value) ) {
		param = value;
		value = '';
	}


	if ( typeof param == 'string' )
		conf.mode = param;

	else if ( $.isPlainObject(param) )
		conf = param;


	if ( !conf.mode )
		conf.mode = 'key';


	if ( !value )
		result = this._Data_getAll(param);

	else if ( typeof value == 'string' && conf.mode == 'key' )
		result = this._Data_getByKey(value, param);

	else if ( $.isArray(value) && conf.mode == 'key' )
		result = this._Data_getByKeys(value, param);

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
*
*  		classify = 指定数据类
*  		key = 指定主键
*  		default = 默认管理数据类
*
*  @return {object} 返回 nData 功能
*  @private
*/
nData.prototype.set = function ( key, value ) {
	var param = {};

	if ( typeof key == 'string' && value ) 
		param[key] = value;

	else if ( $.isPlainObject(key) )
		param = key;

	if ( param.key )
		this._Data_classify(param.classify)._key = param.key;	// 设置指定数据类的主键

	if ( param.default )
		this._Datas._default = param.default;	// 设置默认操作的数据类

	this._Method_setParam(param);
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


/**
*  获取后台数据
*
*  @param {object} value
*  @private
*/
nData.prototype.ajax = function ( value ) {
	this._Method_ajax(value);
}

