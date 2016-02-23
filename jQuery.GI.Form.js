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
			_options = $.extend({
				ajaxOptions: {},
				extraFormParams: {},
				errorClass: 'error',
				onError: $.noop,
				onBeforeSend: $.noop,
				onSuccess: $.noop,
				findErrors: null,
				findSuccessMessage: null,
				validateResponse: null,
				removeTheFormOnSuccess: true,
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
			_formFeedback = function(response, status) {

				var parsedResponse = _parse('validateResponse', response, 'success')

				$form.stop().animate({
					opacity: 1
				});

				$('.' + _options.errorClass, $form).removeClass(_options.errorClass);
				if (
					parsedResponse && status == 'success' ||
					parsedResponse == null && status == 'success'
				)
					_onFormSuccess.apply(this, arguments);
				else
					_onFormError.apply(this, arguments);

				_isDisabled = false;
			},
			/**
			 * Destroy the plugin stuff
			 */
			_destroy = function() {
				$form.off('.' + _ID).data('GIForm', null);
			},
			/**
			 *
			 * Print the message success message
			 *
			 */
			_onFormSuccess = function(response) {

				if (_options.$formFeedbackWrapper) {
					_options.$formFeedbackWrapper.html(_parse('findSuccessMessage', response, 'message'));
				}
				if (_options.removeTheFormOnSuccess) {
					$form.stop().off().remove();
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

				// get the form input data
				var formData = $form.serialize(),
					extraFormParams = _options.extraFormParams;

				// extend the form params
				$.each(extraFormParams, function(key, value) {
					formData += '&' + key + '=' + value;
				});

				// fire the ajax request
				$.ajax({
						url: $form.attr('action'),
						data: formData,
						dataType: 'json',
						method: $form.attr('type') || 'post',
						beforeSend: _onBeforeSend,
					}, _options.ajaxOptions)
					.always(_formFeedback);
			},
			/**
			 * Public api
			 */
			API = {
				__VERSION: '2.0.0',
				destroy: _destroy
			};

		// bind the submit event to the form
		$form
			.on('submit.' + _ID, _onFormSubmit)
			.data('GIForm', API);

		return API;

	};
}));
