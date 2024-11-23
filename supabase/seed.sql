-- Insert demo user
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  created_at,
  aud,
  role
) VALUES (
  'demo-user-id',
  'demo@example.com',
  '{"name": "Demo User"}',
  now(),
  'authenticated',
  'authenticated'
);

-- Set the user's password (password is 'demo123')
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'demo-user-id',
  'demo-user-id',
  format('{"sub": "demo-user-id", "email": "demo@example.com"}')::jsonb,
  'email',
  now(),
  now(),
  now()
);

-- Insert demo workspaces
INSERT INTO public.workspaces (
  id,
  name,
  emoji,
  user_id
) VALUES 
  ('demo-workspace-1', 'Personal Notes', '📔', 'demo-user-id'),
  ('demo-workspace-2', 'Work Projects', '💼', 'demo-user-id');

-- Insert demo documents
INSERT INTO public.documents (
  id,
  title,
  content,
  emoji,
  user_id,
  workspace_id,
  created_at,
  updated_at
) VALUES 
  (
    'demo-doc-1',
    'Getting Started Guide',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Getting Started Guide"}]},{"type":"paragraph","content":[{"type":"text","text":"Welcome to your demo workspace! Here are some tips to get you started..."}]}]}',
    '📚',
    'demo-user-id',
    'demo-workspace-1',
    now(),
    now()
  ),
  (
    'demo-doc-2',
    'Project Ideas',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Project Ideas"}]},{"type":"paragraph","content":[{"type":"text","text":"A collection of project ideas and inspirations..."}]}]}',
    '💡',
    'demo-user-id',
    'demo-workspace-2',
    now(),
    now()
  );