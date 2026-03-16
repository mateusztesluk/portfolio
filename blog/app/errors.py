from flask import Blueprint, jsonify, current_app
from werkzeug.exceptions import RequestEntityTooLarge

from app.exceptions import BadRequest, NotPermitted, NotAuthorized, FileExtensionNotAllowed
from flask_limiter import RateLimitExceeded

errors = Blueprint('errors', __name__)

@errors.app_errorhandler(Exception)
def handle_exception_format(error):
    current_app.logger.exception('Unhandled application error')
    payload = {}
    payload['message'] = str(error) or error.__class__.__name__
    payload['type'] = error.__class__.__name__
    return jsonify(payload), 500

@errors.app_errorhandler(BadRequest)
def handle_bad_request_format(error):
    payload = {}
    payload['message'] = str(error) or error.args
    payload['type'] = error.__class__.__name__
    return jsonify(payload), error.status_code

@errors.app_errorhandler(NotPermitted)
def handle_not_permitted_request_format(error):
    payload = {}
    payload['message'] = 'User not allowed to execute this operation'
    payload['type'] = error.__class__.__name__
    return jsonify(payload), error.status_code

@errors.app_errorhandler(NotAuthorized)
def handle_not_authorized_request_format(error):
    payload = {}
    payload['message'] = 'You are not authorized!'
    payload['type'] = error.__class__.__name__
    return jsonify(payload), error.status_code

@errors.app_errorhandler(FileExtensionNotAllowed)
def handle_not_valid_file_format(error):
    payload = {}
    allowed_formats = ', '.join(current_app.config['ALLOWED_EXTENSIONS'])
    payload['message'] = f'Format of file/image is not valid! Allowed formats {allowed_formats}'
    payload['type'] = error.__class__.__name__
    return jsonify(payload), error.status_code

@errors.app_errorhandler(RateLimitExceeded)
def ratelimit_handler(error):
    payload = {}
    payload['message'] = 'Limit of requests is off'
    payload['type'] = error.__class__.__name__
    return jsonify(payload), 429

@errors.app_errorhandler(RequestEntityTooLarge)
def max_file_size_handler(error):
    payload = {}
    payload['message'] = 'Overstep max size of file which is 16 Megabytes'
    payload['type'] = error.__class__.__name__
    return jsonify(payload), 413