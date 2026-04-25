INSERT INTO t_p72891405_admin_panel_notes_ap.users (username, email, password_hash, role, avatar_emoji, level, xp)
VALUES ('vizariya', 'admin@vizariya.gg', '87286dc36988271d46890bfe6e544991fbf53058a0fd2cbad6728f5267e5db70', 'admin', '🛡️', 99, 999999)
ON CONFLICT (username) DO UPDATE SET role='admin', password_hash='87286dc36988271d46890bfe6e544991fbf53058a0fd2cbad6728f5267e5db70';