-- Migration: Add RLS policies to all tables
-- Description: Enables Row Level Security and adds appropriate policies for CRUD operations
-- Tables affected: flashcards, generation_error_logs, generations

-- Enable RLS on all tables
alter table flashcards enable row level security;
alter table generation_error_logs enable row level security;
alter table generations enable row level security;

-- Flashcards table policies
create policy "Users can view their own flashcards"
  on flashcards
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own flashcards"
  on flashcards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
  on flashcards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
  on flashcards
  for delete
  using (auth.uid() = user_id);

-- Generation error logs policies
create policy "Users can view their own error logs"
  on generation_error_logs
  for select
  using (auth.uid() = user_id);

create policy "Users can create error logs for themselves"
  on generation_error_logs
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own error logs"
  on generation_error_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own error logs"
  on generation_error_logs
  for delete
  using (auth.uid() = user_id);

-- Generations table policies
create policy "Users can view their own generations"
  on generations
  for select
  using (auth.uid() = user_id);

create policy "Users can create generations for themselves"
  on generations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generations"
  on generations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
  on generations
  for delete
  using (auth.uid() = user_id); 