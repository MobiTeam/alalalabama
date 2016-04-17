////////////////////////////////////////
// Библиотека функций  [20.03.2016]  ///
////////////////////////////////////////

var plc = i18n.getLocale();

//////////////////////////////////////////////////////
////  Функция добавления изображения [14.03.2016]   //
//////////////////////////////////////////////////////

function lib_addImageOnCanvas(canvas, imgSrc){
    
    if(imgSrc) {
		
		var imgObj = new Image();

    	imgObj.src = imgSrc;
        
        opBl();

    	imgObj.onload = function() {
    		
    		fabric.Image.fromURL(imgSrc, function(oImg) {
    		  oImg.set('scaleY', (canvas.height - 100) / oImg.height);	
    		  oImg.set('scaleX', (canvas.height - 100) / oImg.height);
              oImg.set({selectable:false});
    		  canvas.add(oImg);
              canvas.centerObject(oImg);
    		  canvas.sendBackwards(oImg);
    		});
    		
    		hdBl();
    	}
    
    	imgObj.onerror = function() {
    		s_alert(plc.err.empty_img);
    		logger(plc.err.empty_img);
    		hdBl();
    	} 
		
		
	}
}

/////////////////////////////////////////////////////////////////////////////////
////  Функция удаления выбранного элемента или группы элементов [05.04.2016]   //
/////////////////////////////////////////////////////////////////////////////////


function lib_removeElement(canvas) {
	
	var currEl = canvas.getActiveObject(),
		currGr = canvas.getActiveGroup(),
		msg = plc.st.not_el;

	if(currGr){
		currGr.forEachObject(function(o){ canvas.remove(o) });
		canvas.discardActiveGroup().renderAll();
		return true;
    } else if(currEl){
    	canvas.remove(currEl);
    	return true;
    }	

    s_alert(msg, {theme: 'redTheme', life: 2000});
    logger(plc.st.not_del);
    return false;
	
}

/////////////////////////////////////////////////////
////  Вывод встлывающего сообщения  [20.03.2016]   //
/////////////////////////////////////////////////////

function s_alert(msg, par){
    $.jGrowl(msg, par);
}

////////////////////////////////////
////  Вывод логов  [20.03.2016]   //
////////////////////////////////////

function logger(msg) {
    var dt = new Date(),
        hr = dt.getHours() > 9 ? dt.getHours() : ("0" + dt.getHours()),
        mn = dt.getMinutes() > 9 ? dt.getMinutes() : ("0" + dt.getMinutes()),
        sc = dt.getSeconds() > 9 ? dt.getSeconds() : ("0" + dt.getSeconds());

    console.log("[" + hr + "." + mn + "." + sc + "] " + msg);
}

//////////////////////////////////////////////
////  Открыть блок-заглушку  [07.04.2016]   //
//////////////////////////////////////////////

function opBl() {

}

//////////////////////////////////////////////
////  Закрыть блок-заглушку  [07.04.2016]   //
//////////////////////////////////////////////

function hdBl() {

}

///////////////////////////////////////////
////  Проверка на объект  [07.04.2016]   //
///////////////////////////////////////////

function isObject(obj) {

    var strPres = Object.prototype.toString.call(obj);

    return (strPres === "[object Object]");
}

///////////////////////////////////////////
////  Проверка на пустоту  [07.04.2016]  //
///////////////////////////////////////////

function isEmpty(obj){

    var strPres = Object.prototype.toString.call(obj);

    return (strPres === "[object Null]" || strPres === "[object Undefined]");

}

//////////////////////////////////////////////////////////////////////////////////////////////////////
////  Обертка функции ajax, содержащая основные обработчики success, error, complete  [07.04.2016]  //
//////////////////////////////////////////////////////////////////////////////////////////////////////

function ajaxWrap(obj){

    if(!isObject(obj)){
        logger(plc.err.set);
        return false;
    }

    if(!obj.success){
        obj.success = function(response){
            logger(plc.st.sc_dt);
        }
    }

    if(!obj.error){
        obj.error = function(response){
            logger(plc.err.er_dt);
        }
    }

    $.ajax(obj)

}

/////////////////////////////////////////////////////
////  Расчет расстояния между точками [07.04.2016] //
/////////////////////////////////////////////////////

function calcDecart(pt1, pt2) {

    if(pt1.x && pt1.y && pt2.x && pt2.y){
        return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
    } 
    
    return 0;
}