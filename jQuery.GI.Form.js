/**
 * Module to validate any form via ajax having an ajax api
 */
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(jQuery);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(jQuery);
	}
}(this, function($) {

	'use strict';

	$.fn.GIForm = function(customOptions) {

		/**
		 * Private methods
		 */
		var $form = this,
			_ID = '_' + new Date().getTime(),
			_isDisabled = false,
			files = {},
			_options = $.extend({
				ajaxOptions: {},
				extraFormParams: {},
				errorClass: 'error',
				onError: $.noop,
				onBeforeSubmit: null,
				onBeforeSend: $.noop,
				onSuccess: $.noop,
				findErrors: null,
				findSuccessMessage: null,
				validateResponse: null,
				removeTheFormOnSuccess: true,
				clearFormOnSuccess: false,
				$formFeedbackWrapper: null,
				onInputError: null
			}, customOptions),
			/**
			 * Find any value into a javascript object
			 * @param  { Object } obj
			 * @param  { String } path - path to the object value
			 */
			_deepFind = function(obj, path) {
				var paths = path.split('.'),
					current = obj,
					i;

				for (i = 0; i < paths.length; ++i) {
					if (current[paths[i]] == undefined) {
						return undefined;
					} else {
						current = current[paths[i]];
					}
				}
				return current;
			},
			/**
			 * Parse the json received to get any value
			 * it will use custom parsing methods if specified in the options
			 * @param  { String } customParsingFunction - is the parsing function passed to the plugin options
			 * @param  { Object } data
			 * @param  { String } defaultPathToTheValue
			 */
			_parse = function(customParsingFunction, data, defaultPathToTheValue) {

				if (_options[customParsingFunction])
					return _options[customParsingFunction](data);
				else
					return _deepFind(data, defaultPathToTheValue);
			},
			/**
			 *
			 * Init the form validation
			 *
			 */
			_formFeedback = function(response) {

				$form.stop().animate({
					opacity: 1
				});

				$('.' + _options.errorClass, $form).removeClass(_options.errorClass);
				if (_parse('validateResponse', response, 'success'))
					_onFormSuccess(response);
				else
					_onFormError(response);

				_isDisabled = false;
			},
			/**
			 * Destroy the plugin stuff
			 */
			_destroy = function() {
				$form.off('.' + _ID).data('SVForm', null);
			},
			/**
			 *
			 * Print the message success message
			 *
			 */
			_onFormSuccess = function(response) {
				if (_options.$formFeedbackWrapper) {
					_options.$formFeedbackWrapper.html(_parse('findSuccessMessage', response, 'message'));
					_options.$formFeedbackWrapper.show()
				}

				if (_options.removeTheFormOnSuccess) {
					$form.stop().off().remove()
				}

				if(_options.clearFormOnSuccess) {
					$form[0].reset()
				}

				_options.onSuccess(response);


			},
			/**
			 *
			 * Append the form errors
			 *
			 */
			_onFormError = function(response) {

				_parse('findErrors', response, 'errors').forEach(function(error) {
					var $input = $('[name="' + error + '"]', $form);
					$input.addClass(_options.errorClass);
					if (_options.onInputError)
						_options.onInputError($input, error);
				});

				_options.onError(response);

			},

			_onBeforeSubmit = function() {
				if(_options.onBeforeSubmit) {
					_options.onBeforeSubmit();
				}
			},
			_onBeforeSend = function() {
				$form.stop().animate({
					opacity: 0.3
				});
				_isDisabled = true;

				_options.onBeforeSend();
			},
			/**
			 *
			 * On form submit callback
			 *
			 */
			_onFormSubmit = function(e) {
				e.preventDefault();

				if (_isDisabled) return false;

				_onBeforeSubmit();

				// get the form input data
				var formData = new FormData($form[0]),
					extraFormParams = _options.extraFormParams;

				// extend the form params
				//$.each(extraFormParams, function(key, value) {
				//	formData += '&' + key + '=' + value;
				//});

				$.each(extraFormParams, function(key, value) {
					formData.append(key, value)
				})

				$.each(files, function(key, value) {
					formData.append(key, value)
				})

				// fire the ajax request
				$.ajax({
					url: $form.attr('action'),
					data: formData,
					dataType: 'json',
					processData: false,
					contentType: false,
					method: $form.attr('type') || 'post',
					beforeSend: _onBeforeSend,
				}, _options.ajaxOptions)
					.always(_formFeedback);
			},

			/**
			 * Public api
			 */
			API = {
				__VERSION: '3.0.0',
				destroy: _destroy
			};

		$('input[type=file]').on('change', prepareFileUpload);

		function prepareFileUpload(e)
		{
			var obj = {}

			obj[e.target.name] = e.target.files
			files = $.extend(obj, files)
		}

		// bind the submit event to the form
		$form
			.on('submit.' + _ID, _onFormSubmit)
			.data('GIForm', API);

		return API;

	};
}));
