/////////////////////////////////////////////////////////////////////////////////
// Базовый модуль, включающий методы инициализации и рисования  [05.04.2016]  ///
/////////////////////////////////////////////////////////////////////////////////

var mapperIni = (function(){

	var plc = i18n.getLocale(), // загрузка локали
		
		canvas, // холст canvas fabric.js
			
		// определение настроек
		uSettings = null,
		dSettigns = {
			width: $('#canvas-ini').width(),
			height: $('#canvas-ini').height(),
			id: 'canvas-ini',
			showMessage: true
		}, 

		// текущее состояние
		state = {
			currentObject : null,
			currentAction : null
		},

		// параметры рисования
		scale = scaleX = scaleY = 1,
		markerColor = '#2567d5';


	// блок инициализации
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

			canvas = new fabric.Canvas('canvas-block', {
				scale: 1
			});

			canvas.setHeight(uSettings.height);
			canvas.setWidth(uSettings.width);

		} else {

			msg = plc.err.bad_sel;
			_log(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'redTheme', life: 3000})
			return false;
		
		}

		_createButtonPanel();
		_setUpListeners();
		
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

	return {
		init : init,
		set : set
	}


	function _getCurrentTool() {
		return $('.tool-palette .active').attr('data-tool');
	}

	function _setUpListeners() {
		
		canvas.on('mouse:down', function (event) {

			switch(_getCurrentTool()){

				case 'lasso':
					_addExtendZone(event);
				break;

				default:
				break;
			}

			
		}).on('mouse:move', function (event) {

			switch(_getCurrentTool()){

				case 'lasso':
					_drawZone(event);
				break;

				default:
				break;

			}
		
		});

		//$(document).on('dblclick', _finishZone).on('keydown', _undoZonePoint);

	}

	// добавление новой области выделения
	function _addExtendZone(mouseEvent) {

		var pos = canvas.getPointer(mouseEvent.e);

		if(state.currentAction === "add") {
			
			var polygon = new fabric.Polygon([
					{
						x: pos.x,
						y: pos.y
					},
					{
						x: pos.x + 0.5,
						y: pos.y + 0.5
					}
				], {
					fill: 'blue',
					opacity: 0.25,
					selectable: false,
					stroke: '#2e69b6'
				}
			);

			state.currentObject = polygon;
			canvas.add(polygon);
			state.currentAction = "edit";

		} else if(state.currentAction === "edit" && state.currentObject && state.currentObject.type === "polygon") {

			var points = state.currentObject.get('points');

			points.push({
				x: pos.x - state.currentObject.get("left"),
				y: pos.y - state.currentObject.get("top")
			});

			state.currentObject.set({
				points: points
			});

			canvas.renderAll();

		}		

	}

	// перерисовка области выделения
	function _drawZone(mouseEvent) {

		if(state.currentAction === "edit" && state.currentObject) {

			var pos = canvas.getPointer(mouseEvent.e),
				points = state.currentObject.get("points");

			points[points.length - 1].x = pos.x - state.currentObject.get("left");
			points[points.length - 1].y = pos.y - state.currentObject.get("top");

			state.currentObject.set({
				points: points
			});	

			canvas.renderAll();
		}

	}

	// // Вспомогательная функция для получения координат, учитывающих текущий масштаб
	// function _convertPointToRelative(point, object) {

	// 	return { x: (point.x - object.left) / scale, y: (point.y - object.top) / scale };

	// };

	// // добавлние новой области выделения
	// function _addExtendZone(mouseEvent) {
		
	// 	var position = canvas.getPointer(mouseEvent);

	// 	// Новая точка уже существующей зоны
	// 	if (currentEditingZone) {
	// 		currentEditingZone.points.push(_convertPointToRelative(position, currentEditingZone));
	// 		return;
	// 	}
	// 	// Новая зона - сделаем сразу 3 точки, тогда визуально зона будет линией
	// 	currentEditingZone = new fabric.Polygon(
	// 		[{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 2 }], {
	// 		scaleX: scale, 
	// 		scaleY: scale, 
	// 		left: position.x,
	// 		top: position.y,
	// 		fill: new fabric.Color(markerColor).setAlpha(0.3).toRgba(),
	// 		stroke: '#2e69b6',
	// 		selectable: true
	// 	});

	// 	canvas.add(currentEditingZone);
	// 	canvas.renderAll();
	// };

	// function _drawZone(mouseEvent) {
	// 	var points;
	// 	if (currentEditingZone) {
	// 		// При перемещении мыши меняем только последнюю точку, следуя за курсором
	// 		points = currentEditingZone.points;
	// 		points[points.length - 1] = _convertPointToRelative(canvas.getPointer(mouseEvent), currentEditingZone);
	// 		canvas.renderAll();
	// 	}
	// };

	// function _finishZone() {

	// 	if (!currentEditingZone) {
	// 		return;
	// 	}
		
	// 	// Уберём последнюю точку, так как клик двойной
	// 	currentEditingZone.points.pop();
	// 	currentEditingZone = null;
	// };

	// function _undoZonePoint(event) {
	// 	// Только backspace и delete
	// 	if (currentEditingZone && (event.which == 8 || event.which == 46)) {
	// 		var points = currentEditingZone.points,
	// 			isDeleted = points.length <= 3;
	// 		points[points.length - 2] = points[points.length - 1];
	// 		points.pop();
	// 		// Отмена зоны вообще
	// 		if (isDeleted) {
	// 			canvas.remove(currentEditingZone);
	// 			currentEditingZone = null;
	// 		}
	// 		canvas.renderAll();
	// 		event.preventDefault();
	// 	}
	// };


	// динамическое создание
	function _createButtonPanel() {

		var button_block = $('<div/>', {
				class: 'btn-group-vertical tool-palette',
				click: function(e){
					_changeTool(e);	
				}
			}).appendTo($("#" + uSettings.id)),

			btn_cursor = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.cursor,
				click: function(){
					canvas.isDrawingMode = false;
				},
				html: '<i class="glyphicon glyphicon-hand-up"></i>'
			}).appendTo(button_block),

			btn_point = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.btn_point,
				click: function(e) {
					canvas.isDrawingMode = !canvas.isDrawingMode;
				},
				html: '<i class="glyphicon glyphicon-pencil"></i>'
			}).appendTo(button_block),

			btn_remove_el = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.btn_rem,
				click: function(e) {

					canvas.isDrawingMode = false;
					lib_removeElement(canvas);					
					
				},
				html: '<i class="glyphicon glyphicon-remove"></i>'
			}).appendTo(button_block),

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

      							//_loadMap(json.img_src);

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
			
			btn_draw_zone = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.drarea,
				"data-tool": "lasso",
				html: '<i class="glyphicon glyphicon-unchecked"></i>'
			}).appendTo(button_block),

			btn_load = $('<button/>', {
				class: 'btn btn-success',
				title: plc.btn.load_img,
				click: function(e){
					btn_load_file.click();
				},
				html: '<i class="glyphicon glyphicon-floppy-open"></i>'
			}).appendTo(button_block);

			

		msg = plc.st.btn_sc;
		_log(msg); 
		if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
		
		return true;
	
	}

	// смена активного инструмента
	function _changeTool(e) {

		var eventEl;
		
		switch(e.target.tagName) {
			
			case 'BUTTON':
				eventEl = $(e.target); 
			break;

			case 'I':
				eventEl = $(e.target.parentNode);
			break;

			default:
				eventEl = null;
			break;

		}

		if(!!eventEl && !eventEl.hasClass('active')) {
			$('.tool-palette .active').removeClass('active');
			eventEl.addClass('active');
		} else if(!!eventEl && eventEl.hasClass('active')){
			$('.tool-palette .active').removeClass('active');
		}

		_resetAction();

	}

	// сброс текущего действия и активного элемента
	function _resetAction() {
		state.currentAction = "add";
		state.currentObject = null;
	}

	// проверка и установка параметров инициализации
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

	// обертка функции ajax, содержащая основные обработчики success, error, complete
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

}())








	// function _setUpListeners() {
		
		// canvListener.on('mouseup', _mouseup);
		// canvListener.on('mousedown', _mousedown);
		// canvListener.on('mousemove', _startTracking);
		// canvListener.on('mouseleave', _stopTracking);
	// 	return true;

	// }

	// function _mouseup(e) {
		
	// 	// _log('up');

	// 	mousedown = false;

	// }

	// function _mousedown(e) {
		
	// 	// _log('down');

	// 	mousedown = true;

	// 	x0 = _getCursorCoordinate(e).x;
	// 	y0 = _getCursorCoordinate(e).y;

	// 	console.log(x0 + " " + y0);

	// }

	// function _startTracking(e) {
		
	// 	// _log('start');

	// 	mouse.x = _getCursorCoordinate(e).x;
	// 	mouse.y = _getCursorCoordinate(e).y;

	// 	e.preventDefault();

	// 	if(mousedown) {
	// 		if(!started) {

	// 		} else {

	// 		}
	// 	}
		

	// }

	// function _stopTracking() {
	// 	_log('stop');
	// }

	// function _getCursorCoordinate(e) {
		
	// 	var mouseX = e.pageX - canvListener.offset().left,
	// 		mouseY = e.pageY - canvListener.offset().top;

	// 	return {
	// 		x: mouseX,
	// 		y: mouseY
	// 	}

	// }
