$.fn.GIForm = function(customOptions) {
	'use strict';
	/**
	 * Private methods
	 */
	var $form = this,
		_ID = '_' + new Date().getTime(),
		_isDisabled = false,
		_options = $.extend({
			ajaxOptions: {},
			extraFormParams: {},
			parseErrors: null,
			parseSuccessMsg: null,
			validateResponse: null,
			removeTheFormOnSuccess: true,
			$formFeedbackWrapper: null,
			onInputError: null
		}, customOptions),
		/**
		 * Parse the json response checking if it's a success or a failure
		 */
		_validateResponse = function(data) {
			if (_options.validateResponse)
				return _options.validateResponse(data);
			else return data.success;
		},
		/**
		 * If the validation fails this function returns the form errors array
		 */
		_parseErrors = function(data) {
			if (_options.parseErrors)
				return _options.parseErrors(data);
			else return data.errors;
		},
		/**
		 * If the validation is passed find the success message to print
		 */
		_parseSuccessMsg = function(data) {
			if (_options.parseSuccessMsg)
				return _options.parseSuccessMsg(data);
			else return data.message;
		},
		/**
		 *
		 * Init the form validation
		 *
		 */
		_formFeedback = function(response) {

			$form.stop().animate({
				opacity:1
			});

			$('.error', $form).removeClass('error');
			if (_validateResponse(response))
				_onFormSuccess(response);
			else
				_onFormError(response);

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

				_options.$formFeedbackWrapper.html(_parseSuccessMsg(response));
			}
			if (_options.removeTheFormOnSuccess) {
				$form.stop().off().remove();
			}
		},
		/**
		 *
		 * Append the form errors
		 *
		 */
		_onFormError = function(response) {
			_.each(_parseErrors(response), function(error) {
				var $input = $('[name=' + error + ']', $form);
				$input.addClass('error');
				if (_options.onInputError)
					_options.onInputError($input, error);
			}, this);
		},
		_onBeforeSend = function () {
			$form.stop().animate({
				opacity:0.3
			});
			_isDisabled = true;
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
			$.each(extraFormParams, function(value, key) {
				formData += '&' + key + '=' + value;
			});

			// fire the ajax request
			$.ajax({
				url: $form.attr('action'),
				data: formData,
				dataType:'json',
				method: 'post',
				beforeSend: _onBeforeSend,
			}, _options.ajaxOptions).always(_formFeedback);
		},
		/**
		 * Public api
		 */
		API = {
			destroy: _destroy
		};

	// bind the submit event to the form
	$form
		.on('submit.' + _ID, _onFormSubmit)
		.data('GIForm', API);

	return API;

};