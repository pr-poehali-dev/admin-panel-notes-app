import os
import json
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    """Получает популярные видео с YouTube Data API v3"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    api_key = os.environ.get('YOUTUBE_API_KEY', '')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'YOUTUBE_API_KEY not set'})
        }

    params = event.get('queryStringParameters') or {}
    query = params.get('q', '')
    max_results = int(params.get('maxResults', '12'))
    region = params.get('regionCode', 'RU')

    if query:
        # Поиск по запросу
        url_params = urllib.parse.urlencode({
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': max_results,
            'regionCode': region,
            'relevanceLanguage': 'ru',
            'key': api_key
        })
        url = f'https://www.googleapis.com/youtube/v3/search?{url_params}'
    else:
        # Популярные видео
        url_params = urllib.parse.urlencode({
            'part': 'snippet,statistics,contentDetails',
            'chart': 'mostPopular',
            'regionCode': region,
            'maxResults': max_results,
            'videoCategoryId': '0',
            'key': api_key
        })
        url = f'https://www.googleapis.com/youtube/v3/videos?{url_params}'

    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())

    videos = []
    items = data.get('items', [])

    for item in items:
        if query:
            video_id = item['id'].get('videoId', '')
            snippet = item.get('snippet', {})
        else:
            video_id = item.get('id', '')
            snippet = item.get('snippet', {})
            stats = item.get('statistics', {})

        if not video_id:
            continue

        title = snippet.get('title', '')
        channel = snippet.get('channelTitle', '')
        thumbnail = snippet.get('thumbnails', {}).get('high', {}).get('url', '')
        published = snippet.get('publishedAt', '')[:10]

        view_count = 0
        if not query:
            view_count = int(stats.get('viewCount', 0))

        videos.append({
            'id': video_id,
            'title': title,
            'channel': channel,
            'thumbnail': thumbnail,
            'publishedAt': published,
            'viewCount': view_count,
            'url': f'https://www.youtube.com/watch?v={video_id}',
            'embedUrl': f'https://www.youtube.com/embed/{video_id}',
        })

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'videos': videos, 'total': len(videos)})
    }
