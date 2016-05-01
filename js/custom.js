///////////////////////////////////////////////
// Блок инициализации canvas  [07.04.2016]  ///
///////////////////////////////////////////////

$(document).ready(function(){

	var settings = {
		id: 'canvas-ini',
		showMessage: true,
		fixedSize: false
 	}
		
 	if(mapperIni.set(settings))
		if(mapperIni.init()) {

		}	 		
	
})