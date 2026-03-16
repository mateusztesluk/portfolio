import os

from flask import request, flash, redirect, url_for, send_file, Blueprint, views, jsonify, current_app
from sqlalchemy.exc import OperationalError, IntegrityError

from app.decorators import is_allowed, is_auth
from app.blog.services import BlogService
from app.exceptions import BadRequest
from app.filter import Filter, Equal, Boolean, Contains
from app.extensions import limiter


blueprint = Blueprint('blog', __name__)

class BlogFilter(Filter):
    user_id = Equal
    countries = Contains
    is_active = Boolean


class BlogViewSet(views.MethodView):
    def get(self, id):
        if not id:
            return self._list()
        return self._retrieve(id)

    def _list(self):
        params = request.args
        ordering = params.get('ordering', None)
        limit = params.get('limit', None)
        filters = BlogFilter(params).to_dict()
        service = BlogService()
        blogs = service.get_blogs(filters, ordering, limit)
        return jsonify(blogs)

    def _retrieve(self, id):
        service = BlogService()
        service.increase_blog_view(id)
        blog = service.get_blog(id)
        if not blog:
            error_msg = 'Blog with provided id was not found'
            raise BadRequest(error_msg)
        return jsonify(blog)

    @is_auth
    def post(self, user_id, *args, **kwargs):
        try:
            data = request.get_json(silent=True) or request.form.to_dict()
            images = request.files.getlist('file')
            data['user_id'] = user_id
            service = BlogService()
            blog = service.create_blog(data)
            blog_id = blog['id']
            filenames = service.upload_files(images, f'BLOG_{blog_id}')
            service.update_blog(blog_id, {'photo_names': ','.join(filenames)})
            return jsonify(blog), 201
        except (TypeError, OperationalError, IntegrityError) as err:
            raise BadRequest(err.args)
        except Exception as err:
            current_app.logger.exception('Failed to create blog post')
            raise

    @is_auth
    @is_allowed
    def delete(self, id, *args, **kwargs):
        service = BlogService()
        service.remove_blog(id)
        return jsonify({}), 204


    @is_auth
    @is_allowed
    def put(self, id, *args, **kwargs):
        data = request.get_json(silent=True) or request.form.to_dict()
        images = request.files.getlist('file')
        service = BlogService()
        blog = service.update_blog(id, data)
        blog_id = blog['id']
        filenames = service.upload_files(images, f'BLOG_{blog_id}')
        service.update_blog(blog_id, {'photo_names': ','.join(filenames)})
        return jsonify(blog)

def authors():
    params = request.args
    ordering = params.get('ordering', None)
    limit = params.get('limit', None)

    service = BlogService()
    authors = service.get_authors(None, ordering, limit)
    return jsonify(authors)

def countries():
    params = request.args
    ordering = params.get('ordering', None)
    limit = params.get('limit', None)

    service = BlogService()
    countries = service.get_countries(None, ordering, limit)
    countries = service.unpack_countries(countries)
    countries = countries[:int(limit)] if limit else countries
    return jsonify(countries)

view = BlogViewSet.as_view('blog_view')
blueprint.add_url_rule('/', defaults={'id': None}, view_func=view, methods=['GET',])
blueprint.add_url_rule('/', view_func=view, methods=['POST',])
blueprint.add_url_rule('/<int:id>/', view_func=view, methods=['GET', 'PUT', 'DELETE'])
blueprint.add_url_rule('/authors/', view_func=authors, methods=['GET'])
blueprint.add_url_rule('/countries/', view_func=countries, methods=['GET'])
