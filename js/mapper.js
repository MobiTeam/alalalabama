/////////////////////////////////////////////////////////////////////////////////
// Базовый модуль, включающий методы инициализации и рисования  [05.04.2016]  ///
/////////////////////////////////////////////////////////////////////////////////

var mapperIni = (function(){

	// переменные модуля
	{ 
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
			currentAction : null,
			keyPressed: []
		},

		// параметры рисования
		scale = scaleX = scaleY = 1,
		markerColor = '#2567d5'; 

	}

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

			canvas = new fabric.CanvasEx('canvas-block', {
				scale: 1
			});

			_updateCanvasSize(uSettings.height, uSettings.width);
		
		} else {

			msg = plc.err.bad_sel;
			logger(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'redTheme', life: 3000})
			return false;
		
		}

		_createButtonPanel();
		_setUpListeners();
		
		msg = plc.st.in_finish;		

		logger(msg); 
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

			if(event.target && event.target.get('type') !== 'image') return;
			
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
			
		}).on('mouse:dblclick', function (event) {

			switch(_getCurrentTool()){

				case 'lasso':
					_finishDrawShape();
				break;

				default:
				break;

			}

		});

		$(document).on('keydown', function(event) {

			if (state.keyPressed.indexOf(event.keyCode) == -1) {
				state.keyPressed.push(event.keyCode);
			}
			

			if(state.currentAction === "edit") {

				_finishDrawShape(event);

			} else {

				if(event.keyCode == 46) lib_removeElement(canvas);

			}


		}).on('keyup', function(event) {

			var pos = state.keyPressed.indexOf(event.keyCode);

			if (pos != -1) {
				state.keyPressed.splice(pos, 1);
			}

		})

		$(window).on('resize', function(event) {

			_updateCanvasSize();

		})
		
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

				var points = state.currentObject.get('points'),
					RelativeCords = _convertPointToRelative(pos, state.currentObject);

				points.push({
					x: RelativeCords.x,
					y: RelativeCords.y
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
					points = state.currentObject.get("points"),
					RelativeCords = _convertPointToRelative(pos, state.currentObject);

				if (state.keyPressed.indexOf(16) != -1) {

					var FixedbyX = {
							x: points[points.length - 2].x,
							y: RelativeCords.y	
						},
						FixedbyY = {
							x: RelativeCords.x,
							y: points[points.length - 2].y
						},
						lx = calcDecart(points[points.length - 2], FixedbyX),
						ly = calcDecart(points[points.length - 2], FixedbyY);

					
					if(lx > ly) {

						points[points.length - 1] = FixedbyX;

					} else if(lx < ly) {

						points[points.length - 1] = FixedbyY;

					} else {

						points[points.length - 1].x = RelativeCords.x;
						points[points.length - 1].y = RelativeCords.y;

					}
				
				} else {
					points[points.length - 1].x = RelativeCords.x;
					points[points.length - 1].y = RelativeCords.y;
				}	 

				state.currentObject.set({
					points: points
				});	

				canvas.renderAll();
			}

		}

		// завершение области выделения
		function _finishDrawShape(keyboardEvent) {

			var allowedKeyCodes = [13, 27];

			if(!keyboardEvent || (keyboardEvent && allowedKeyCodes.indexOf(keyboardEvent.keyCode) != -1)) {

				switch(keyboardEvent.keyCode) {

					case 13:

						// switch shape type 
						var currentShape = state.currentObject,
						    points = state.currentObject.get('points');
						
						points.pop();

						currentShape.set({
							points: points
						})

						var oldC = currentShape.getCenterPoint();
          				currentShape._calcDimensions();

				        var xx = currentShape.get("minX");
				        var yy = currentShape.get("minY");
			         	
			         	currentShape.set({
			            	left: currentShape.get('left') + xx,
			            	top: currentShape.get('top') + yy
			          	});

	          			var pCenter = currentShape.getCenterPoint();
	          			var adjPoints = currentShape.get("points").map(function(p) {
			            
				            return {
				              x: p.x - pCenter.x + oldC.x,
				              y: p.y - pCenter.y + oldC.y
				            };

	        		  	});
				        
				        currentShape.set({
				            points: adjPoints,
				            selectable: true
				        });

			            canvas.setActiveObject(currentShape);
			            currentShape.setCoords();
			            canvas.renderAll();
			            _resetAction();
						logger(plc.st.suc_object_draw);

					break;

					case 27:

						state.currentObject.remove();
						canvas.renderAll();
						_resetAction();
						logger(plc.st.suc_del);

					break;

				}
					
			} 

		}

	}

	// Вспомогательная функция для получения координат, учитывающих текущий масштаб
	function _convertPointToRelative(point, object) {

		return { x: (point.x - object.left) / scale, y: (point.y - object.top) / scale };

	};

	// динамическое создание панели кнопок
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
				'data-tool': 'pointer',
				html: '<i class="glyphicon glyphicon-hand-up"></i>'
			}).appendTo(button_block),

			btn_point = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.btn_point,
				'data-tool': 'pencil',
				click: function(e) {
					canvas.isDrawingMode = !canvas.isDrawingMode;
				},
				html: '<i class="glyphicon glyphicon-pencil"></i>'
			}).appendTo(button_block),

			btn_remove_el = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.btn_rem,
				'data-no-focus': true,
				click: function(e) {
					if(lib_removeElement(canvas)) logger(plc.st.suc_del);
				},
				html: '<i class="glyphicon glyphicon-remove"></i>'
			}).appendTo(button_block),

			load_form = $('<form/>', {
				method: 'post',
				enctype: 'multipart/form-data',
				submit: function(e){

					var $that = load_form;

					e.preventDefault();
					logger(plc.st.form_send);

					ajaxWrap({
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
		logger(msg); 
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

		if(!!eventEl) {

			if(!eventEl.hasClass('active')) {
			
				$('.tool-palette .active').removeClass('active');
				if(!eventEl.attr('data-no-focus')) eventEl.addClass('active');
			
			} else {

				$('.tool-palette .active').removeClass('active');
			
			}

			if(eventEl.attr('data-tool') != "pencil") {
				canvas.isDrawingMode = false;
			} 

			if(eventEl.attr('data-tool') == "lasso") {
				canvas.selection = false;
			} else {
				canvas.selection = true;
			}
			
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
		
		if(isObject(parametres)) {
			
			uSettings = parametres;
			logger(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
			return true;
		
		} else if(isEmpty(parametres)) {

			msg = plc.st.set_def;
			uSettings = dSettigns;
			logger(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
			return true;

		} else {
			
			msg = plc.err.set;
			logger(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'redTheme', life: 3000})
			return false;
		
		}		
		
	}

	// обновить размеры canvas
	function _updateCanvasSize(height, width) {

		canvas.setHeight(height || $('#canvas-ini').height());
		canvas.setWidth(width || $('#canvas-ini').width());
		canvas.calcOffset();
		canvas.renderAll();

	}

}())



	
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

	// function _finishDrawShape() {

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





	// function _setUpListeners() {
		
		// canvListener.on('mouseup', _mouseup);
		// canvListener.on('mousedown', _mousedown);
		// canvListener.on('mousemove', _startTracking);
		// canvListener.on('mouseleave', _stopTracking);
	// 	return true;

	// }

	// function _mouseup(e) {
		
	// 	// logger('up');

	// 	mousedown = false;

	// }

	// function _mousedown(e) {
		
	// 	// logger('down');

	// 	mousedown = true;

	// 	x0 = _getCursorCoordinate(e).x;
	// 	y0 = _getCursorCoordinate(e).y;

	// 	console.log(x0 + " " + y0);

	// }

	// function _startTracking(e) {
		
	// 	// logger('start');

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
	// 	logger('stop');
	// }

	// function _getCursorCoordinate(e) {
		
	// 	var mouseX = e.pageX - canvListener.offset().left,
	// 		mouseY = e.pageY - canvListener.offset().top;

	// 	return {
	// 		x: mouseX,
	// 		y: mouseY
	// 	}

	// }
