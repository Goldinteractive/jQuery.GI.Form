$.fn.GIForm = function(customOptions) {
	'use strict';
	/**
	 * Private methods
	 */
	var $form = this,
		_ID = '_' + new Date().getTime(),
		_options = $.extend({
			ajaxOptions: {},
			extraFormParams: {},
			parseErrors: null,
			parseSuccessMsg: null,
			validateResponse: null,
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
			$('.error', $form).removeClass('error');
			if (_validateResponse(response))
				_onFormSuccess(arguments);
			else
				_onFormError(arguments);
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
			$form.find('.formFeedback').html(response.message);
		},
		/**
		 *
		 * Append the form errors
		 *
		 */
		_onFormError = function(response) {
			_.each(_parseErrors(response), function(error) {
				var $input = $('[name=' + error + ']', this);
				$input.addClass('error');
				if (_opitons.onInputError)
					_options.onInputError($input, error);
			}, this);
		},
		/**
		 *
		 * On form submit callback
		 *
		 */
		_onFormSubmit = function(e) {
			e.preventDefault();
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
				method: 'post'
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