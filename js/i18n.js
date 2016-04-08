///////////////////////////////////////////////////
// Basic object for localization  [19.03.2016]  ///
///////////////////////////////////////////////////

var i18n = (function(){

	var l = [],
		defLocale = 'ru-RU';


	l['ru-RU'] = {
		mn: {
			title: 'MapperJS',
			descr: 'MapperJS - сервис для построения планов зданий.'
		},
		btn: {
			del: 'Удалить',
			crt: 'Создать',
			upd: 'Обновить',
			load_img: 'Загрузить изображение',
			cls_all: 'Закрыть все',
			btn_point: 'Нарисовать контур',
			btn_rem: 'Удалить фигуру',
			cursor: 'Курсор',
			drarea: 'Лассо'
		},
		err: {
			ftl: 'Критическая ошибка',
			set: 'При применении параметров произошла ошибка',
			ini: 'При инициализации объекта произошла ошибка',
			loc: 'Ошибка настройки локализации',
			bad_sel: 'Неправильно задан селектор',
			btn_cr: 'Ошибка создания блока кнопок',
			er_dt: 'Ошибка отправки данных',
			empty_img: 'Не удалось загрузить изображение'
		},
		st: {
			in_finish: 'Инициализация завершена',
			set_savings: 'Пользовательские настройки применены',
			set_def: 'Стандартные настройки применены',
			form_send: 'Форма отправлена',
			sc_dt: 'Данные успешно отправлены',
			btn_sc: 'Интерфейс успешно загружен',
			not_el: 'Необходимо выбрать какой-нибудь объект',
			not_del: 'Элемент не был удален',
			suc_del: 'Элемент успешно удален',
			suc_object_draw: 'Объект успешно построен'
		}
			
	}                                            

	l['en-EN'] = {
		mn: {
			title: 'MapperJS',
			descr: 'MapperJS - service for planning the construction of buildings.'
		},
		btn: {
			del: 'Delete',
			crt: 'Create',
			upd: 'Update',
			cls_all: 'Close all',
			load_img: 'Load image',
			btn_point: 'Draw path',
			btn_rem: 'Remove object',
			cursor: 'Cursor',
			drarea: 'Lasso'
		},
		err: {
			ftl: 'Critical error',
			set: 'Applying the parameters error',
			ini: 'Initialisation object error',
			loc: 'Applying localization error',
			bad_sel: 'Selector find error',
			btn_cr: 'Buttons block create error',
			er_dt: 'Senging data error',
			empty_img: 'Image load error'
		},
		st: {
			in_finish: 'Initialisation completed',
			set_savings: 'User settings are applied',
			set_def: 'Default settings are applied',
			form_send: 'Form sending',
			sc_dt: 'Successfully sent',
			btn_sc: 'Interface successfully loaded',
			not_el: 'You need to select any object',
			not_del: 'The element has not been deleted',
			suc_del: 'Element successfully removed',
			suc_object_draw: 'Object successfully built'					
		}
			
	}

	function getLocale(locale) {
		locale = locale || defLocale;

		if(l[locale]){
			return l[locale];
		}
	}

	function setLocale(locale) {
		if(l[locale]){
			defLocale = locale;
		} else {
			var msg = l[defLocale].err.loc || "Ошибка настройки локализации";
			s_alert(msg, {theme: 'redTheme', life: 3000})
			logger(msg);
		}
	}

	return {
		getLocale : getLocale,
		setLocale : setLocale
	}


}());


