////////////////////////////////////////////////////////
// Additional functions for Fabric.js  [20.03.2016]  ///
////////////////////////////////////////////////////////

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
    		  canvas.add(oImg);
    		  canvas.sendBackwards(oImg);
    		});
    		
    		hdBl();
    	}
    
    	imgObj.onerror = function() {
    		s_alert(plc.err.empty_img);
    		_log(plc.err.empty_img);
    		hdBl();
    	} 
		
		
	}
}


