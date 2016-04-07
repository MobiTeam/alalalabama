///////////////////////////////////////////////
// Блок инициализации canvas  [07.04.2016]  ///
///////////////////////////////////////////////

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