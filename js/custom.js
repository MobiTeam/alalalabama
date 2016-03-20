$(document).ready(function(){

	var settings = {
		width : 800,
		height: 600,
		id: 'canvas-ini',
		showMessage: true
 	}
		
 	i18n.setLocale('ru-RU');

	if(mapperIni.set())
		if(mapperIni.init()) {

		}	 		
	

})

/////////////////////////////////////////////////////
////  Вывод встлывающего сообщения  [20.03.2016]   //
/////////////////////////////////////////////////////

function s_alert(msg, par){
	$.jGrowl(msg, par);
}

////////////////////////////////////
////  Вывод логов  [20.03.2016]   //
////////////////////////////////////


function _log(msg) {
		var dt = new Date(),
			hr = dt.getHours() > 9 ? dt.getHours() : ("0" + dt.getHours()),
			mn = dt.getMinutes() > 9 ? dt.getMinutes() : ("0" + dt.getMinutes()),
			sc = dt.getSeconds() > 9 ? dt.getSeconds() : ("0" + dt.getSeconds());

		console.log("[" + hr + "." + mn + "." + sc + "] " + msg);
}


function opBl() {

}

function hdBl() {

}