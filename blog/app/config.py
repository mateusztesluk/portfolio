import os


def normalize_pem_env(value):
    if not value:
        return value
    return value.replace('\\n', '\n')


class Config(object):
    DEBUG = False
    TESTING = False
    AUTH_SERVER = os.environ.get('AUTH_SERVER', '')
    ALLOWED_EXTENSIONS = ('txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif')
    RATELIMIT_DEFAULT = '200 per day;10 per second'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024     # 16 megabytes
    CORS_ORIGINS = os.environ.get('BLOG_ALLOWED_ORIGINS', '').split(' ')
    PUBLIC_AUTH_KEY = normalize_pem_env(os.environ.get('PUBLIC_AUTH_KEY', ''))


class ProductionConfig(Config):
    SECRET_KEY = os.environ.get('BLOG_SECRET_KEY', '')
    SQLALCHEMY_DATABASE_URI = os.environ.get('BLOG_SQL_URI', '')
    SQLALCHEMY_POOL_RECYCLE=90
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    SECRET_KEY = os.environ.get('BLOG_SECRET_KEY', '')
    SQLALCHEMY_DATABASE_URI = os.environ.get('BLOG_SQL_URI', '')
    SQLALCHEMY_POOL_RECYCLE=90
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class TestingConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('BLOG_SQL_TESTING', '')
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
