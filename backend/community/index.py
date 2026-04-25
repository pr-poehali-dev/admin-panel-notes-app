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
    """Каналы и чаты сообщества"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id') or headers.get('x-session-id', '')
    body = json.loads(event['body']) if event.get('body') else {}
    params = event.get('queryStringParameters') or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET /channels
        if method == 'GET' and '/channels' in path:
            cur.execute(
                f"SELECT c.id, c.name, c.description, c.emoji, c.members_count, c.created_at, u.username FROM {SCHEMA}.channels c JOIN {SCHEMA}.users u ON u.id=c.owner_id ORDER BY c.members_count DESC LIMIT 50"
            )
            rows = cur.fetchall()
            channels = [{'id': r[0], 'name': r[1], 'description': r[2], 'emoji': r[3], 'members': r[4], 'created_at': r[5].isoformat(), 'owner': r[6]} for r in rows]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'channels': channels})}

        # POST /channels
        if method == 'POST' and '/channels' in path and not '/messages' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            name = body.get('name', '').strip()
            description = body.get('description', '').strip()
            emoji = body.get('emoji', '📢')
            if not name:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Укажи название канала'})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.channels (name, description, emoji, owner_id) VALUES (%s,%s,%s,%s) RETURNING id",
                (name, description, emoji, user[0])
            )
            channel_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'id': channel_id, 'name': name})}

        # GET /chats — список групповых чатов
        if method == 'GET' and '/chats' in path and not '/messages' in path:
            cur.execute(f"SELECT id, name, is_group, created_at FROM {SCHEMA}.chats ORDER BY created_at DESC LIMIT 50")
            rows = cur.fetchall()
            chats = [{'id': r[0], 'name': r[1], 'is_group': r[2], 'created_at': r[3].isoformat()} for r in rows]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'chats': chats})}

        # POST /chats
        if method == 'POST' and '/chats' in path and not '/messages' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            name = body.get('name', '').strip()
            if not name:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Укажи название чата'})}
            cur.execute(f"INSERT INTO {SCHEMA}.chats (name, is_group) VALUES (%s, TRUE) RETURNING id", (name,))
            chat_id = cur.fetchone()[0]
            cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s,%s)", (chat_id, user[0]))
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'id': chat_id, 'name': name})}

        # GET /messages?chat_id=X
        if method == 'GET' and '/messages' in path:
            params = event.get('queryStringParameters') or {}
            chat_id = int(params.get('chat_id', 0))
            cur.execute(
                f"""SELECT m.id, m.content, m.created_at, u.username, u.avatar_emoji
                    FROM {SCHEMA}.messages m JOIN {SCHEMA}.users u ON u.id=m.user_id
                    WHERE m.chat_id=%s ORDER BY m.created_at ASC LIMIT 100""",
                (chat_id,)
            )
            rows = cur.fetchall()
            msgs = [{'id': r[0], 'content': r[1], 'created_at': r[2].isoformat(), 'username': r[3], 'avatar_emoji': r[4]} for r in rows]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'messages': msgs})}

        # POST /messages
        if method == 'POST' and '/messages' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            chat_id = int(body.get('chat_id', 0))
            content = body.get('content', '').strip()
            if not content:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Пустое сообщение'})}
            cur.execute(f"SELECT 1 FROM {SCHEMA}.chats WHERE id=%s", (chat_id,))
            if not cur.fetchone():
                return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Чат не найден'})}
            cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id=%s AND user_id=%s", (chat_id, user[0]))
            if not cur.fetchone():
                cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s,%s)", (chat_id, user[0]))
            cur.execute(
                f"INSERT INTO {SCHEMA}.messages (chat_id, user_id, content) VALUES (%s,%s,%s) RETURNING id, created_at",
                (chat_id, user[0], content)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'id': row[0], 'content': content, 'username': user[1], 'avatar_emoji': user[2], 'created_at': row[1].isoformat()})}

        # GET /leaderboard?game=snake
        if method == 'GET' and '/leaderboard' in path:
            game = params.get('game', 'snake')
            cur.execute(
                f"""SELECT u.username, u.avatar_emoji, MAX(gs.score) as best_score
                    FROM {SCHEMA}.game_scores gs JOIN {SCHEMA}.users u ON u.id=gs.user_id
                    WHERE gs.game=%s GROUP BY u.id, u.username, u.avatar_emoji
                    ORDER BY best_score DESC LIMIT 10""",
                (game,)
            )
            rows = cur.fetchall()
            leaders = [{'username': r[0], 'avatar_emoji': r[1], 'score': r[2], 'rank': i+1} for i, r in enumerate(rows)]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'leaderboard': leaders, 'game': game})}

        # POST /score
        if method == 'POST' and '/score' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            params2 = body
            game = params2.get('game', 'snake')
            score = int(params2.get('score', 0))
            if game not in ['snake', 'tetris', 'reaction']:
                game = 'snake'
            cur.execute(f"INSERT INTO {SCHEMA}.game_scores (user_id, game, score) VALUES (%s,%s,%s)", (user[0], game, score))
            cur.execute(f"UPDATE {SCHEMA}.users SET xp=xp+%s WHERE id=%s", (min(score // 10, 100), user[0]))
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True, 'xp_gained': min(score // 10, 100)})}

        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        cur.close()
        conn.close()