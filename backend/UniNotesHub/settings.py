import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "fallback-secret-key")
DEBUG = os.getenv("DEBUG", "False").lower() in ["true", "1"]

ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost").split(",")
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS if host]

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework.authtoken',
    'authentication'
]

AUTH_USER_MODEL = 'authentication.User' 


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'uninoteshub'),
        'USER': os.getenv('DB_USER', 'uninotes_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'securepassword'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

SECURE_SSL_REDIRECT = os.getenv("DJANGO_SECURE_SSL_REDIRECT", "True").lower() in ["true", "1"]
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

CORS_ALLOWED_ORIGINS = os.getenv("DJANGO_CORS_ALLOWED_ORIGINS", "").split(",")
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS if origin]


LOG_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOG_DIR, exist_ok=True) 


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'security.log'),
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # ✅ Ensure a templates directory is set
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

ROOT_URLCONF = 'UniNotesHub.urls'


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}