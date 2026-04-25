import os
import json
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p72891405_admin_panel_notes_ap')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    salt = "nexus_salt_v1"
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
        'Content-Type': 'application/json'
    }

def handler(event: dict, context) -> dict:
    """Регистрация, вход и получение профиля пользователя"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    conn = get_conn()
    cur = conn.cursor()

    try:
        # POST /register
        if method == 'POST' and '/register' in path:
            username = body.get('username', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not username or not email or not password:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Заполните все поля'})}
            if len(username) < 3:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Никнейм минимум 3 символа'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username=%s OR email=%s", (username, email))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors_headers(), 'body': json.dumps({'error': 'Никнейм или email уже занят'})}

            pw_hash = hash_password(password)
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id, username, email, role, avatar_emoji, level, xp",
                (username, email, pw_hash)
            )
            user = cur.fetchone()
            session_id = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (id, user_id) VALUES (%s, %s)", (session_id, user[0]))
            conn.commit()
            return {
                'statusCode': 200, 'headers': cors_headers(),
                'body': json.dumps({
                    'session': session_id,
                    'user': {'id': user[0], 'username': user[1], 'email': user[2], 'role': user[3], 'avatar_emoji': user[4], 'level': user[5], 'xp': user[6]}
                })
            }

        # POST /login
        if method == 'POST' and '/login' in path:
            login = body.get('login', '').strip().lower()
            password = body.get('password', '')
            pw_hash = hash_password(password)
            cur.execute(
                f"SELECT id, username, email, role, avatar_emoji, level, xp FROM {SCHEMA}.users WHERE (LOWER(email)=%s OR LOWER(username)=%s) AND password_hash=%s",
                (login, login, pw_hash)
            )
            user = cur.fetchone()
            if not user:
                return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Неверный логин или пароль'})}
            session_id = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (id, user_id) VALUES (%s, %s)", (session_id, user[0]))
            cur.execute(f"UPDATE {SCHEMA}.users SET last_seen=NOW() WHERE id=%s", (user[0],))
            conn.commit()
            return {
                'statusCode': 200, 'headers': cors_headers(),
                'body': json.dumps({
                    'session': session_id,
                    'user': {'id': user[0], 'username': user[1], 'email': user[2], 'role': user[3], 'avatar_emoji': user[4], 'level': user[5], 'xp': user[6]}
                })
            }

        # GET /me — получить текущего пользователя по сессии
        if method == 'GET' and '/me' in path:
            headers = event.get('headers') or {}
            session_id = headers.get('X-Session-Id') or headers.get('x-session-id', '')
            if not session_id:
                return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Нет сессии'})}
            cur.execute(
                f"SELECT u.id, u.username, u.email, u.role, u.avatar_emoji, u.level, u.xp, u.bio FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id WHERE s.id=%s AND s.expires_at > NOW()",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Сессия устарела'})}
            return {
                'statusCode': 200, 'headers': cors_headers(),
                'body': json.dumps({'user': {'id': row[0], 'username': row[1], 'email': row[2], 'role': row[3], 'avatar_emoji': row[4], 'level': row[5], 'xp': row[6], 'bio': row[7]}})
            }

        # GET /search?q=username
        if method == 'GET' and '/search' in path:
            params = event.get('queryStringParameters') or {}
            q = params.get('q', '').strip()
            if not q:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Укажи запрос'})}
            cur.execute(
                f"SELECT id, username, avatar_emoji, level, role FROM {SCHEMA}.users WHERE username ILIKE %s LIMIT 20",
                (f'%{q}%',)
            )
            rows = cur.fetchall()
            users = [{'id': r[0], 'username': r[1], 'avatar_emoji': r[2], 'level': r[3], 'role': r[4]} for r in rows]
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'users': users})}

        return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
