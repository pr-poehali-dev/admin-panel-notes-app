CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  avatar_emoji VARCHAR(8) DEFAULT '🎮',
  bio TEXT DEFAULT '',
  role VARCHAR(16) DEFAULT 'user',
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.clans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) UNIQUE NOT NULL,
  tag VARCHAR(8) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  emoji VARCHAR(8) DEFAULT '⚔️',
  owner_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.clan_members (
  clan_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.clans(id),
  user_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  role VARCHAR(16) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (clan_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  content TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.post_likes (
  post_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.posts(id),
  user_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description TEXT DEFAULT '',
  emoji VARCHAR(8) DEFAULT '📢',
  owner_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  is_public BOOLEAN DEFAULT TRUE,
  members_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.chat_members (
  chat_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.chats(id),
  user_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.messages (
  id SERIAL PRIMARY KEY,
  chat_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.chats(id),
  user_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72891405_admin_panel_notes_ap.game_scores (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES t_p72891405_admin_panel_notes_ap.users(id),
  game VARCHAR(32) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);