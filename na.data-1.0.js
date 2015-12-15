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
		page: 0,				// 当前页数
		number: 100,			// 每页显示数量
		main: 'default',		// 默认数据表
	};


	/**
	*  数据
	*  @private
	*/
	this._Datas = {
		// default: {}				// 默认存储位置
	};


	/**
	*  自定义方法
	*  @private
	*/
	this._Define = {
		// default: {}				// 默认存储位置
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


	/**
	*  初始化数据方法
	*  @public
	*/
	this._Method_default();
}





///////////////////////////////////////////////////////////
//
//  Data_ 管理数据表
//
/////////////////////////////


/**
*  获取指定的数据表，并刷新数据长度
*
*  @param {string} table = 选填，需要保存到的指定类，默认为 default
*
*  @return {object}
*  @private
*/
nData.prototype._Data_table = function ( table ) {
	table = table || this._Param.main;			// 如果没有指定数据表，则调用默认的

	var result = this._Datas[table];

	if ( !result ) {
		result = {
			_table: table
		};
		this._Datas[table] = result;			// 如果没有此数据表，则创建
	}

	this._Data_length(result);					// 获取数据长度

	return result;
}


/**
*  刷新指定数据表长度
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

	// value = $.extend(value, {
	// 	_table: null,						// 数据的所属
	// 	_el: null,							// 关联的页面元素
	// });

	value = that._Method_bind(value);

	that._Method_emit('add', value);

	return value;
}


/**
*  保存数据，并对数据进行初始化
*
*  @param {object} value
*  @param {string} table = 选填，需要保存到的指定类，默认为 default
*
*  @return {object}
*  @private
*/
nData.prototype._Data_add = function ( value, table ) {
	var data = this._Data_table(table),
		key = data._key,
		len = data._len;

	if ( value ) {

		if ( $.isPlainObject(value) )						// 如果是对象数据则初始化此数据
			value = this._Data_init(value);

		if ( !key )											// 如果数据表没有主键，则直接保存的数据
			data[len] = value;

		else if ( $.isPlainObject(value) && value[key] )	// 如果数据表有主键，且对象数据账包含此主键值
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
*  获取数据表
*
*  @param {object} param
*
*  @return {object|array} 如果是对象，则是单数据表查询，如果是数组，则是多数据表查询
*  @private
*/
nData.prototype._Data_get = function ( param ) {
	param = param || {};

	var datas = this._Datas,
		table = param.table ? this._Comm_repeat(param.table) : this._Param.main,
		length = 0,
		result = {};

	if ( param.datas ) {					// 指定数据集
		result = param.datas;
	}
	else if ( typeof table == 'string' ) {	// 获取单个表数据
		datas = datas[table];
		for ( var key in datas ) {
			if ( key.indexOf('_') < 0 )
				result[key] = datas[key];
		}
	}
	else if ( $.isArray(table) ) {			// 获取多个表的数据
		for ( var i = 0; i < table.length; i ++ ) {
			for ( var key in datas[table[i]] ) {
				if ( !datas[table[i]]._key ) {
					if ( key.indexOf('_') < 0 )
						result[length ++] = datas[table[i]][key];
				}
				else if ( $.isPlainObject(datas[table[i]][key]) ) {
					if ( key.indexOf('_') < 0 )
						result[key] = datas[table[i]][key];
				}
			}
		}
	}

	return result;
}


/**
*  获取数据元素，根据主键
*
*  @param {*} param
*
*  @return {object|array}
*  @private
*/
nData.prototype._Data_getByKey = function ( param ) {
	param = param || {};

	var result = [],
		datas = this._Data_get(param);

	if ( typeof param.value == 'string' )
		result.push(datas[param.value]);

	if ( $.isArray(param.value) ) {
		for ( var i = 0; i < param.value.length; i++ ) {
			if ( datas[param.value[i]] )
				result.push(datas[param.value[i]]);
		}
	}

	return result;
}


/**
*  搜索单个数据元素
*
*  @param {string|object|array|...} content = 目标数据
*  @param {string} value = 匹配内容
*  @param {string} term = 必须满足的条件
*
*  @return {boolean} 
*  @private
*/
nData.prototype._Data_getBySearchItem = function ( content, value, term ) {
	var result = false;

	if ( $.isPlainObject(content) ) {
		for ( var key in content ) {
			if ( $.isArray(term) ) {
				if ( term.indexOf(key) >= 0 && this._Comm_isContains(content[key], value) ) {
					result = true;
					break;
				}
			} else {
				if ( result = this._Comm_isContains(content[key], value) )
					break;
			}
		}
	}
	else if ( !term && this._Comm_isContains(content, value) ) {
		result = true;
	}


	return result;
}


/**
*  获取数据元素，全局搜索数据
*
*  @param {string|function} value
*
*  @return {array<object>} 
*  @private
*/
nData.prototype._Data_getBySearch = function ( value, param ) {
	param = param || {};

	var result = [],
		datas = this._Data_getAll(param),
		search = param.search;

	if ( typeof param.search == 'string' )
		search = [param.search]; 

	for ( var key in datas ) {
		if ( this._Data_getBySearchItem(datas[key], value, search) )
			result.push(datas[key]);
	}

	return result;
}


/**
*  获取数据元素，根据指定的分段
*
*  @return {array<object>} 
*  @private
*/
nData.prototype._Data_getByPage = function ( datas ) {
	var result = [],
		page = this._Param.page,
		number = this._Param.number;

	datas = datas || this._Data_getAll();

	if ( datas.length )
		result = datas.slice(page * number, (page + 1) * number);

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

	for ( var k in datas ) {
		result.push(datas[k]);
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
nData.prototype._Data_setItem = function ( obj, key, value ) {

	if ( typeof obj == 'string' )
		obj = this._Data_getByKey(obj);

	if ( $.isPlainObject(obj) ) {
		if ( typeof key == 'string' && value )
			obj[key] = value;

		else if ( $.isPlainObject(value) ) {
			for ( var key in value )
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


/**
*  矫正获取参数
*
*  @param {string|object} value = 搜索关键之
*  @param {string|object} detail = 搜索详细
*
*  @return {string|object}
*  @private
*/
nData.prototype._Data_correct = function ( value, detail ) {
	var result = {};

	if ( $.type(value) == 'string' )
		result.value = value;

	else if ( $.isPlainObject(value) )
		result = value;

	if ( $.type(detail) == 'string' )
		result.mode = detail;

	else if ( $.isPlainObject(detail) )
		result = detail;

	if ( !result.mode )
		result.mode = 'key';

	return result;
}




///////////////////////////////////////////////////////////
// 
//  Style_ 元素及样式管理类
//
/////////////////////////////





///////////////////////////////////////////////////////////
// 
//  Comm_ 原生js扩展
//
/////////////////////////////


/**
*  数据去重复
*
*  @private
*/
nData.prototype._Comm_repeat = function ( value ) {
	var result = [];
	
	if ( $.isArray(value) ) {
		for ( var i = 0; i < value.length; i++ ) {
			if ( $.inArray(value[i], result) < 0 ) {
				result.push(value[i]);
			}
		}
	} else {
		result = value;
	}

	return result;
}


/**
*  判断对象是否包括键值
*
*  @private
*/
nData.prototype._Comm_isHave = function ( object, keys ) {
	var result = false;
	
	if ( typeof keys == 'string' )
		result = !!object[keys];

	else if ( $.inArray(keys) ) {
		$(keys).each(function(i, key){
			if ( result = !!object[keys] )
				return true;
		});
	}

	return result;
}


/**
*  判断一个值是否包含另外一个值
*
*  @private
*/
nData.prototype._Comm_isContains = function ( content, value ) {
	var result = false;
	
	if ( $.isFunction(value) )
		result = value(content);

	else if ( typeof content == 'string' || typeof content == 'number' )
		result = String(content).toLocaleLowerCase().indexOf(String(value).toLocaleLowerCase()) >= 0;

	else if ( $.isPlainObject(content) )
		result = !!content[value];

	else if ( $.isArray(content) ) {
		result = content.indexOf(value) >= 0;
	}

	return result;
}


/**
*  扩展数据对象数组
*
*  @private
*/
nData.prototype._Comm_array = function ( value ) {
	if ( value.length )
		value.__proto__ = $.extend(value.__proto__, value[0]);

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
*  @param {string} type = 监听类型
*  @param {*} data = 监听的数据
*  @param {object} detail = 监听详细细节
*
*  @private
*/
nData.prototype._Method_emit = function ( type, data, detail ) {
	var param = this._Param;

	detail = detail || {};

	if ( this._Ons[type] ) {
		$(this._Ons[type]).each(function(i, callback){
			callback(data, {
				type: type,
				value: detail.value,
				old: detail.old
			});
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
*  设置配置参数
*
*  @private
*/
nData.prototype._Method_ajax = function ( value ) {
	$.ajax(value);
}


/**
*  扩展数据方法
*
*  @param {string|object} value = 绑定名称或者多个绑定事件对象
*  @param {function} callback = 绑定事件
*
*  @return {object} data
*  @private
*/
nData.prototype._Method_define = function ( value, callback ) {

	if ( $.isPlainObject(value) ) {
		for ( var key in value ) {
			if ( $.isFunction(value[key]) )
				this._Define[key] = value[key];
		}
	}
	else if ( typeof value == 'string' ) {
		this._Define[value] = callback;
	}
}


/**
*  绑定数据方法
*
*  @param {object} data = 目标对象数据
*
*  @return {object} data
*  @private
*/
nData.prototype._Method_bind = function ( data ) {
	var value = {},
		key;

	// 绑定数据监听事件
	for ( key in this._Define ) {
		value['_' + key] = this._Define[key];
		this._Method_emit(key, this);
	}

	return $.extend(data, value);
}


/**
*  功能默认数据方法
*
*  @private
*/
nData.prototype._Method_default = function () {
	var that = this;

	// 设置数据
	this._Method_define({

		// 更新数据
		update: function ( key, value ) {
			console.log(this);
			that._Data_setItem(this, key, value);
		},

		// 删除数据
		delete: function () {
			that._Data_delete(this);
		},
	});


/*


		_table: null,						// 数据的所属
		_el: null,							// 关联的页面元素
		_get: function ( key ) {			// 获取数据
			if ( key )
				return data[key];
			else
				return data;
		},
		_del: function () {					// 删除数据
			that._Data_delete(this);
			that._Method_emit('del', this);
		},
		// _el: function ( el ) {			// 设置关联元素
		// 	this.el = el;
		// 	that._Method_emit('el', this);
		// 	return el;
		// },
		_show: function () {				// 显示元素
			if ( this.el )
				this.el.show();
			that._Method_emit('show', this);
		},
		_hide: function () {				// 隐藏元素
			if ( this.el )
				this.el.hide();
			that._Method_emit('hide', this);
		},
		_invert: function () {				// 反选其他对象数据
		}
*/

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
*  获取
*
*  @param {string|function|array} value = 获取条件
*  @param {string} detail = 设置获取的方式 'key'（默认）, 'search', 'param', 'lib'
*  		  {object} detail = 详细设置：
*				mode = {string} 设置获取的方式 'key'（默认）, 'search', 'param', 'lib'；
*				search = {string|array<string>} 搜索明细，注：获取方式为 search 时，此参数才有效；
*				invert = {boolean} 是否反选（默认false）；
*				datas = {array<object>} 在指定的数据集中获取，默认为全部数据；
*				table = {string|array} 在指定数据表中获取，默认为 'default' 表。注：如设置过dats数据集，则此参数无效；
*
*  @return {object} 返回元素对象
*  @private
*/
nData.prototype.get = function ( value, detail ) {
	var result = [],
		param = this._Data_correct(value, detail);

	if ( !param.value )
		result = this._Data_getAll(param);

	else if ( param.mode == 'key' )
		result = this._Data_getByKey(param);

	else if ( param.mode == 'search' )
		result = this._Data_getBySearch(value, param); 
	
	else if ( param.mode == 'param' )
		result = this._Param[param.value];

	else if ( param.mode == 'lib' )
		result = [];

	if ( $.isArray(result) && result.length ) {
		result = this._Data_getByPage(result);	// 数据分页
		result = this._Comm_array(result);		// 数据扩展方法
	}

	return result;
}


/**
*  设置
*
*  @param {object} value = 设置配置参数
*
*  		table = 指定数据表
*  		key = 设置主键
*  		main = 设置默认数据表
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
		this._Data_table(param.table)._key = param.key;	// 设置指定数据表的主键

	this._Method_setParam(param);

	return this;
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
nData.prototype.define = function ( event, callback, type ) {

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

