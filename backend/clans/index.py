import os
import json
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p72891405_admin_panel_notes_ap')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user(cur, session_id):
    cur.execute(
        f"SELECT u.id, u.username, u.avatar_emoji, u.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id WHERE s.id=%s AND s.expires_at > NOW()",
        (session_id,)
    )
    return cur.fetchone()

def cors():
    return {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,X-Session-Id', 'Content-Type': 'application/json'}

def handler(event: dict, context) -> dict:
    """Управление кланами: список, создание, вступление"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id') or headers.get('x-session-id', '')
    body = json.loads(event['body']) if event.get('body') else {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET / — список кланов
        if method == 'GET' and not '/join' in path:
            cur.execute(
                f"""SELECT c.id, c.name, c.tag, c.description, c.emoji, c.created_at,
                    u.username as owner,
                    (SELECT COUNT(*) FROM {SCHEMA}.clan_members cm WHERE cm.clan_id=c.id) as member_count
                    FROM {SCHEMA}.clans c JOIN {SCHEMA}.users u ON u.id=c.owner_id
                    ORDER BY member_count DESC LIMIT 50"""
            )
            rows = cur.fetchall()
            clans = [{'id': r[0], 'name': r[1], 'tag': r[2], 'description': r[3], 'emoji': r[4],
                      'created_at': r[5].isoformat(), 'owner': r[6], 'members': r[7]} for r in rows]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'clans': clans})}

        # POST / — создать клан
        if method == 'POST' and not '/join' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            name = body.get('name', '').strip()
            tag = body.get('tag', '').strip().upper()
            description = body.get('description', '').strip()
            emoji = body.get('emoji', '⚔️')
            if not name or not tag:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Укажи название и тег'})}
            if len(tag) > 5:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Тег максимум 5 символов'})}
            cur.execute(f"SELECT id FROM {SCHEMA}.clans WHERE name=%s OR tag=%s", (name, tag))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors(), 'body': json.dumps({'error': 'Клан с таким названием или тегом уже существует'})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.clans (name, tag, description, emoji, owner_id) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                (name, tag, description, emoji, user[0])
            )
            clan_id = cur.fetchone()[0]
            cur.execute(f"INSERT INTO {SCHEMA}.clan_members (clan_id, user_id, role) VALUES (%s,%s,'owner')", (clan_id, user[0]))
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'id': clan_id, 'name': name, 'tag': tag})}

        # POST /join
        if method == 'POST' and '/join' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            clan_id = int(body.get('clan_id', 0))
            cur.execute(f"SELECT 1 FROM {SCHEMA}.clan_members WHERE clan_id=%s AND user_id=%s", (clan_id, user[0]))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors(), 'body': json.dumps({'error': 'Ты уже в этом клане'})}
            cur.execute(f"INSERT INTO {SCHEMA}.clan_members (clan_id, user_id) VALUES (%s,%s)", (clan_id, user[0]))
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        cur.close()
        conn.close()
