/////////////////////////////////////////////////////////////////////////////////
// Базовый модуль, включающий методы инициализации и рисования  [05.04.2016]  ///
/////////////////////////////////////////////////////////////////////////////////

var mapperIni = (function($){

	// переменные модуля
	{ 
		var plc = i18n.getLocale(), // загрузка локали
		
		canvas, // холст canvas fabric.js
			
		// определение настроек
		uSettings = {
			width: $('#canvas-ini').width(),
			height: $('#canvas-ini').height(),
			id: 'canvas-ini',
			showMessage: true,
			fixedSize: false
		}, 

		// текущее состояние
		state = {
			currentObject : null,
			currentAction : null,
			keyPressed: [],
			currentTool: null,
			isAnimating: false,
			gripPoint: null,
			isBusy: false
		},

		// параметры масштабирования
		scale = scaleX = scaleY = 1,
		trsX = trsY = 0,

		// параметры рисования
		markerColor = '#2567d5'; 

	}

	// блок инициализации
	function init() {

		var msg = "";

		$('.service_title').html(plc.mn.descr);

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

			$.extend(uSettings, parametres);
			return true;
		
		} 

		return false;
	}

	return {
		init : init,
		set : set
	}

	function _getCurrentTool() {
		return state.currentTool;
	}

	function _setUpListeners() {
		
		canvas.on('mouse:down', function (event) {

			if(event.target && event.target.get('type') !== 'image') return;
			
			switch(_getCurrentTool()){

				case 'lasso':
					_addExtendZone(event);
				break;

				case 'rectangle':
					_addNewRectangle(event);
				break;

				case 'transfer':
					_gripCanvas(event);
				break;

				case 'path':
					_drawPoint(event);
				break;

				default:
				break;
			}
			
		}).on('mouse:move', function (event) {

			switch(_getCurrentTool()){

				case 'lasso':
					_drawZone(event);
				break;

				case 'rectangle':
					_reDrawRectangle(event);
				break;

				case 'transfer':
					_transferCanvas(event)
				break;

				case 'path':
					
					// if(!state.isBusy) {

					// 	state.isBusy = true;
					// 	setTimeout(function() {
							_redrawPath(event);
							//console.log(state.currentObject);
					// 	}, 5);

					// }
										
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

		}).on('mouse:up', function (event) {

			switch(_getCurrentTool()){ 

				case 'rectangle':
					_finishDrawRect();
				break;

				case 'transfer':
					_unGripCanvas();
				break;

				case 'path':
					
				break;

				default: 
				break;

			}


		})

		$(canvas.wrapperEl).mousewheel(function (event, delta, deltaX, deltaY) {

			if(!state.isAnimating) {

				var prevScale = canvas.scale,
					h,
					w;
					
				scale += (0.09 * scale) * delta;
            	
            	if(scale < 0){
	            
	            	scale = canvas.scale;
	            
	            } else {

	            	h = canvas.getHeight();
					w = canvas.getWidth();

					// trsX -= 0.09 * scale / 4;
					// trsY -= 0.09 * scale / 4;


	            }

	           
	            _ScaleTransform();
            }

            event.preventDefault();
            event.stopPropagation();           
		
		});

		$(document).on('keydown', function(event) {

			if (state.keyPressed.indexOf(event.keyCode) == -1) {
				state.keyPressed.push(event.keyCode);
			}


			if(_getCurrentTool() === "path") {
				_finishDrawLine();
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

		function _finishDrawLine() {
			canvas.remove(state.currentObject);
			canvas.renderAll();
			$('.tool-palette .active').removeClass('active');
			state.currentTool = null;
			_resetAction();
		}

		function _filterObjects(tag, tagValue) {

			if(tag && tagValue) {

				var objects = canvas.getObjects(), 
					filteredObjects = [];

				$.each(objects, function(index, el) {
					if(el.get(tag) && el.get(tag) === tagValue) {
						filteredObjects.push(el);
					}
				})

				return filteredObjects;

			}

		}


		function _redrawPath(mouseEvent) {

			var pathNodes = _filterObjects('elType', 'pathNode'),
				pos = canvas.getPointer(mouseEvent.e),
				min = Number.MAX_VALUE,
				activeNode = null;

			$.each(pathNodes, function(index, el) {
				
				var elPt = {
						x: el.get('left'),
						y: el.get('top')
					}, 
					dist = calcDecart(elPt, pos);

				if(min > dist) {	
					min = dist;
					activeNode = el; 
				}

			});

			if(activeNode) {
				if(!state.currentObject) {

					state.currentObject = new fabric.Line([activeNode.get('left'), activeNode.get('top'), pos.x, pos.y], {
			            stroke: 'blue',
			            hasControls: false,
			            hasBorders: false,
			            lockMovementX: true,
			            lockMovementY: true,
			            hoverCursor: 'default'
			        });

					canvas.add(state.currentObject);

				} else {

					state.currentObject.set('x1', activeNode.get('left'));
					state.currentObject.set('y1', activeNode.get('top'));
					state.currentObject.set('x2', pos.x);
					state.currentObject.set('y2', pos.y);

				}
				
				canvas.renderAll();

			}

			state.isBusy = false; 			

		}

		// нарисовать точку
		function _drawPoint(mouseEvent) {

			var pos = canvas.getPointer(mouseEvent.e),
				circle = new fabric.Circle({
					elType: "pathNode",
					left: pos.x,
					top: pos.y,
					fill: 'red',
					originX: 'center',
					originY: 'center',
					hasControls: false,
			        hasBorders: false,
			        selectable: false,
			        lockMovementX: true,
			        lockMovementY: true,
					radius: 5 * scale,
					hoverCursor: 'default'
				});

			canvas.add(circle);

			state.currentObject = null;


		}

		// взять холст за точку
		function _gripCanvas(mouseEvent) {

			state.gripPoint = canvas.getPointer(mouseEvent.e);

		}

		// перенос холста
		function _transferCanvas(mouseEvent) {

			if(state.gripPoint) {

				var currPoint = canvas.getPointer(mouseEvent.e);


				trsY = (state.gripPoint.y - currPoint.y) / 1;
				trsX = (state.gripPoint.x - currPoint.x) / 1;

				_ScaleTransform();

				state.gripPoint = currPoint;

			}

		}

		// отпустить холст
		function _unGripCanvas() {
			state.gripPoint = null;
		}

		// перерисовать прямоугольник
		function _reDrawRectangle(mouseEvent) {

			if(state.currentAction === "edit" && state.currentObject && state.currentObject.type === "rect") {
				
				var rect = state.currentObject,
				    e = mouseEvent.e;

				rect.set('width', e.offsetX - rect.left);
                rect.set('height', e.offsetY - rect.top);
                rect.setCoords();
                canvas.renderAll();	
                
			}

		}

		// завершение прямоугольника
		function _finishDrawRect() {

			canvas.renderAll();
			_resetAction();
			logger(plc.st.suc_object_draw);

		}

		// добавление нового прямоугольника
		function _addNewRectangle(mouseEvent) {

			if(state.currentAction === "add") {

				var pos = canvas.getPointer(mouseEvent.e),
				    rectangle = new fabric.Rect({
					 					top : pos.y,
					                    left : pos.x,
					                    width : 0,
					                    height : 0,
					                    fill: 'blue',
										opacity: 0.25,
										stroke: markerColor
					                });

				state.currentObject = rectangle;
				canvas.add(rectangle);
				state.currentAction = "edit";

			} 

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
						stroke: markerColor
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

	// масштабирование canvas
	function _ScaleTransform() {

		var maxTransfY, 
			maxTransfX,
			minTransfX,
			minTransfY,
			allObjectsOnCanvas = new fabric.Group(canvas.getObjects());

		allObjectsOnCanvas.scaleY = allObjectsOnCanvas.scaleX = scale / canvas.scale;
		allObjectsOnCanvas.left -= trsX;
		allObjectsOnCanvas.top -= trsY;

		allObjectsOnCanvas.destroy();
		canvas.scale = scale;
		canvas.renderAll();

	}

	// Вспомогательная функция для получения координат, учитывающих текущий масштаб
	function _convertPointToRelative(point, object) {

		return { x: point.x - object.left, y: point.y - object.top };

	};

	// динамическое создание панели кнопок
	function _createButtonPanel() {

		var button_block = $('<div/>', {
				class: 'btn-group-vertical tool-palette',
				click: function(e){
					_changeTool(e);	
				}
			}).appendTo($("#" + uSettings.id)),

			btn_transfer = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.transfer,
				'data-tool': 'transfer',
				html: '<i class="fa fa-arrows"></i>'
			}).appendTo(button_block),

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
				html: '<i class="fa fa-pencil"></i>'
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
				html: '<i class="fa fa-map-o"></i>'
			}).appendTo(button_block),

			btn_draw_rect = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.drrect,
				"data-tool": "rectangle",
				html: '<i class="glyphicon glyphicon-unchecked"></i>'
			}).appendTo(button_block),

			btn_draw_path = $('<button/>', {
				class: 'btn btn-default',
				title: plc.btn.path,
				"data-tool": "path",
				html: '<i class="glyphicon glyphicon-minus"></i>'
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

			state.currentTool = eventEl.attr('data-tool');

			if(eventEl.attr('data-tool') != "pencil") {
				canvas.isDrawingMode = false;
			} 

			var toolsWithDisabledSelection = ["lasso", "rectangle", "transfer", "path"];

			if(toolsWithDisabledSelection.indexOf(eventEl.attr('data-tool')) != -1) {
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
			
			logger(msg); 
			if(uSettings.showMessage) s_alert(msg, {theme: 'greenTheme', life: 2500})
			return true;
		
		} else if(isEmpty(parametres)) {

			msg = plc.st.set_def;
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

		if(!uSettings.fixedSize){
			canvas.setHeight(height || $('#canvas-ini').height());
			canvas.setWidth(width || $('#canvas-ini').width());
			canvas.calcOffset();
			canvas.renderAll();
		}		

	}

}(jQuery))
