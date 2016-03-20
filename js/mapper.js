/////////////////////////////////////////////////////////////////////////////////////////
// Basic object includes methods for initialization and configuration   [19.03.2016]  ///
/////////////////////////////////////////////////////////////////////////////////////////

var mapperIni = (function(){

	var plc = i18n.getLocale(),
		uSettings = null,
		dSettigns = {},
		canvas;


	dSettigns = {
		width: $('#canvas-ini').width(),
		height: $('#canvas-ini').height(),
		id: 'canvas-ini',
		showMessage: true
	}


	function init() {

		var msg = "";

		$('.service_title').html(plc.mn.descr);

		uSettings = uSettings || dSettigns;

		uSettings.id = uSettings.id || dSettigns.id;
		uSettings.width = uSettings.width || dSettigns.id;
		uSettings.height = uSettings.height || dSettigns.id;

		if($("#" + uSettings.id).size() == 1) {

			var canvasBlock = $('<canvas/>', {
				id: 'canvas-block',
			});

			$("#" + uSettings.id).append(canvasBlock);

			canvas = new fabric.Canvas('canvas-block');

			canvas.setHeight(uSettings.height);
			canvas.setWidth(uSettings.width);


		} else {

			msg = plc.err.bad_sel;
			_log(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'redTheme', life: 3000})
			return false;
		
		}


		_createButtonPanel();
		_bindAction();


		msg = plc.st.in_finish;		

		_log(msg); 
		if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
		return true;

	}

	function set(parametres) {

		if(_checkParametres(parametres)) {

			uSettings = uSettings || dSettigns;

			uSettings.className = uSettings.className || dSettigns.className;
			uSettings.width = parseInt(uSettings.width || dSettigns.width);
			uSettings.height = parseInt(uSettings.height || dSettigns.width);

			return true;
		} 

		return false;
	}

	function _createButtonPanel() {

		var button_block = $('<div/>', {
				class: 'btn-group-vertical tool-palette',
			}).appendTo($("#" + uSettings.id)),

			load_form = $('<form/>', {
				method: 'post',
				enctype: 'multipart/form-data',
				submit: function(e){

					var $that = load_form;

					e.preventDefault();
					_log(plc.st.form_send);

					_ajaxWrap({
						url: '/php/handler.php',
						data: new FormData($that.get(0)),
						type: 'post',
						contentType: false, // важно - убираем форматирование данных по умолчанию
      					processData: false, // важно - убираем преобразование строк по умолчанию
      					dataType: 'json',
      					success: function(json) {
      						if(json && !json.error_flag){
      							lib_addImageOnCanvas(canvas, json.img_src);
					        }
						}
					})
				}
			}).appendTo(button_block),

			btn_load_file = $('<input/>', {
				type: 'file',
				name: 'images',
				id: 'you-image',
				change: function(){
					load_form.submit();
				},
			}).appendTo(load_form),
		
			btn_load = $('<button/>', {
				class: 'btn btn-success',
				title: plc.btn.load_img,
				click: function(e){
					btn_load_file.click();
				}
			}).html('<i class="glyphicon glyphicon-floppy-open"></i>')
			  .appendTo(button_block);
		
		// button_block.append('<button class="btn btn-default" title="Включить режим редактирования"><i class="glyphicon glyphicon-pencil"></i></button>');
		// button_block.append('<button class="btn btn-default" title="Закрепить карту"><i class="glyphicon glyphicon-pushpin"></i></button>');
		// button_block.append('<button class="btn btn-default" title="Отменить действие"><i class="glyphicon glyphicon-arrow-left"></i></button>');
		// button_block.append('<button class="btn btn-success" title="Загрузить изображение"><i class="glyphicon glyphicon-floppy-open"></i></button>');
		// button_block.append('<button class="btn btn-danger" title="Сохранить результат редактирования"><i class="glyphicon glyphicon-floppy-save"></i></button>');

		$("#" + uSettings.id).append(button_block);
		
		msg = plc.st.btn_sc;
		_log(msg); 
		if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
		
		return true;
	
	}

	function _bindAction() {

		return true;
	}

	function _checkParametres(parametres) {

		var msg = plc.st.set_savings;
		
		if(_isObject(parametres)) {
			
			uSettings = parametres;
			_log(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
			return true;
		
		} else if(_isEmpty(parametres)) {

			msg = plc.st.set_def;
			uSettings = dSettigns;
			_log(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
			return true;

		} else {
			
			msg = plc.err.set;
			_log(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'redTheme', life: 3000})
			return false;
		
		}		
		
	}

	function _isObject(obj){

		var strPres = Object.prototype.toString.call(obj);

		return (strPres === "[object Object]");
	}

	function _isEmpty(obj){

		var strPres = Object.prototype.toString.call(obj);

		return (strPres === "[object Null]" || strPres === "[object Undefined]");

	}

	function _ajaxWrap(obj){

		if(!_isObject(obj)){
			_log(plc.err.set);
			return false;
		}

		if(!obj.success){
			obj.success = function(response){
				_log(plc.st.sc_dt);
			}
		}

		if(!obj.error){
			obj.error = function(response){
				_log(plc.err.er_dt);
			}
		}

		$.ajax(obj)

	}


	return {
		init : init,
		set : set
	}


}())



