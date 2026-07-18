CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert reports
CREATE POLICY "Users can submit reports" ON post_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
