# Environment Setup Guide

This guide explains how to set up environment variables for the Tailor Billing Django project.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your specific values:
   ```bash
   # Edit the .env file with your configuration
   nano .env  # or use your preferred editor
   ```

## Environment Variables

### Django Settings
- `SECRET_KEY`: Django secret key (required for production)
- `DEBUG`: Set to `True` for development, `False` for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

### Database Settings
- `DB_ENGINE`: Database engine (sqlite3, postgresql, mysql, etc.)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port

### Email Settings
- `EMAIL_BACKEND`: Email backend (console, smtp, etc.)
- `EMAIL_HOST`: SMTP host
- `EMAIL_PORT`: SMTP port
- `EMAIL_USE_TLS`: Use TLS (True/False)
- `EMAIL_USE_SSL`: Use SSL (True/False)
- `EMAIL_HOST_USER`: SMTP username
- `EMAIL_HOST_PASSWORD`: SMTP password
- `DEFAULT_FROM_EMAIL`: Default sender email

### JWT Settings
- `JWT_ACCESS_TOKEN_LIFETIME`: Access token lifetime in minutes
- `JWT_REFRESH_TOKEN_LIFETIME`: Refresh token lifetime in minutes

### CORS Settings
- `CORS_ALLOW_ALL_ORIGINS`: Allow all origins (True/False)
- `CORS_ALLOW_CREDENTIALS`: Allow credentials (True/False)

## Example Configurations

### Development (SQLite)
```env
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Production (PostgreSQL)
```env
SECRET_KEY=your-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

DB_ENGINE=django.db.backends.postgresql
DB_NAME=tailor_billing
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong SECRET_KEY** in production
3. **Set DEBUG=False** in production
4. **Use secure database passwords**
5. **Configure proper ALLOWED_HOSTS** for production

## Installation

Make sure you have the required dependencies:

```bash
pip install python-dotenv
```

Or if using Poetry:

```bash
poetry add python-dotenv
```

## Testing Environment Variables

You can test if your environment variables are loaded correctly:

```bash
python manage.py check
```

If everything is configured correctly, you should see no errors. 