import os
import json
import psycopg2
import urllib.request

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p72891405_admin_panel_notes_ap')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_from_session(cur, session_id):
    cur.execute(
        f"SELECT u.id, u.username, u.avatar_emoji, u.role FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id WHERE s.id=%s AND s.expires_at > NOW()",
        (session_id,)
    )
    return cur.fetchone()

def cors():
    return {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,X-Session-Id', 'Content-Type': 'application/json'}

def handler(event: dict, context) -> dict:
    """Лента новостей: получить посты, создать пост, лайкнуть"""
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
        # GET / — список постов
        if method == 'GET' and not any(x in path for x in ['/like', '/my']):
            params = event.get('queryStringParameters') or {}
            offset = int(params.get('offset', 0))
            cur.execute(
                f"""SELECT p.id, p.content, p.image_url, p.likes, p.created_at,
                    u.username, u.avatar_emoji
                    FROM {SCHEMA}.posts p JOIN {SCHEMA}.users u ON u.id=p.user_id
                    ORDER BY p.created_at DESC LIMIT 20 OFFSET %s""",
                (offset,)
            )
            rows = cur.fetchall()
            posts = [{'id': r[0], 'content': r[1], 'image_url': r[2], 'likes': r[3],
                      'created_at': r[4].isoformat(), 'username': r[5], 'avatar_emoji': r[6]} for r in rows]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'posts': posts})}

        # POST / — создать пост
        if method == 'POST' and path.rstrip('/') in ['', '/']:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user_from_session(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            content = body.get('content', '').strip()
            if not content:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Пустой пост'})}
            if len(content) > 1000:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Максимум 1000 символов'})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.posts (user_id, content) VALUES (%s, %s) RETURNING id, created_at",
                (user[0], content)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'id': row[0], 'content': content, 'username': user[1], 'avatar_emoji': user[2], 'likes': 0, 'created_at': row[1].isoformat()})}

        # POST /like
        if method == 'POST' and '/like' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Нужна авторизация'})}
            user = get_user_from_session(cur, session_id)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Сессия истекла'})}
            post_id = int(body.get('post_id', 0))
            cur.execute(f"SELECT 1 FROM {SCHEMA}.post_likes WHERE post_id=%s AND user_id=%s", (post_id, user[0]))
            if cur.fetchone():
                cur.execute(f"UPDATE {SCHEMA}.posts SET likes=likes-1 WHERE id=%s", (post_id,))
                cur.execute(f"DELETE FROM {SCHEMA}.post_likes WHERE post_id=%s AND user_id=%s", (post_id, user[0]))
                liked = False
            else:
                cur.execute(f"UPDATE {SCHEMA}.posts SET likes=likes+1 WHERE id=%s", (post_id,))
                cur.execute(f"INSERT INTO {SCHEMA}.post_likes (post_id, user_id) VALUES (%s, %s)", (post_id, user[0]))
                liked = True
            conn.commit()
            cur.execute(f"SELECT likes FROM {SCHEMA}.posts WHERE id=%s", (post_id,))
            row = cur.fetchone()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'liked': liked, 'likes': row[0]})}

        # GET /memes?sub=memes
        if method == 'GET' and '/memes' in path:
            qp = event.get('queryStringParameters') or {}
            subreddit = qp.get('sub', 'memes')
            if subreddit not in ['memes', 'dankmemes', 'me_irl', 'gaming', 'ProgrammerHumor', 'funny']:
                subreddit = 'memes'
            limit = int(qp.get('limit', '24'))
            url = f'https://www.reddit.com/r/{subreddit}/hot.json?limit={limit}'
            req = urllib.request.Request(url, headers={'User-Agent': 'NexusDashboard/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
            memes = []
            for post in data.get('data', {}).get('children', []):
                p = post.get('data', {})
                if p.get('over_18') or p.get('is_video'):
                    continue
                url_img = p.get('url', '')
                if not any(url_img.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                    preview = p.get('preview', {})
                    images = preview.get('images', [])
                    if images:
                        url_img = images[0].get('source', {}).get('url', '').replace('&amp;', '&')
                    else:
                        continue
                memes.append({
                    'id': p.get('id'), 'title': p.get('title', ''), 'image': url_img,
                    'ups': p.get('ups', 0), 'comments': p.get('num_comments', 0),
                    'author': p.get('author', ''), 'subreddit': p.get('subreddit', ''),
                    'permalink': f"https://reddit.com{p.get('permalink', '')}",
                })
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'memes': memes})}

        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        cur.close()
        conn.close()