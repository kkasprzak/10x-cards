-- Migration: Initial Schema Creation
-- Description: Creates the core tables for the flashcard application with RLS policies
-- Tables: flashcards, generations, generation_error_logs
-- Author: AI Assistant
-- Date: 2024-03-20

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Generations table
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS on generations
alter table generations enable row level security;

-- RLS Policies for generations
create policy "Users can view their own generations" 
    on generations for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own generations" 
    on generations for insert 
    with check (auth.uid() = user_id);

create policy "Users can update their own generations" 
    on generations for update 
    using (auth.uid() = user_id);

create policy "Users can delete their own generations" 
    on generations for delete 
    using (auth.uid() = user_id);

-- Flashcards table
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null check (char_length(front) between 100 and 200),
    back varchar(500) not null check (char_length(back) between 100 and 500),
    source varchar not null check (source in ('ai-full', 'manual', 'ai-edited')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references generations(id) on delete set null,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- Enable RLS on flashcards
alter table flashcards enable row level security;

-- RLS Policies for flashcards
create policy "Users can view their own flashcards" 
    on flashcards for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards" 
    on flashcards for insert 
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards" 
    on flashcards for update 
    using (auth.uid() = user_id);

create policy "Users can delete their own flashcards" 
    on flashcards for delete 
    using (auth.uid() = user_id);

-- Generation error logs table
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Enable RLS on generation_error_logs
alter table generation_error_logs enable row level security;

-- RLS Policies for generation_error_logs
create policy "Users can view their own error logs" 
    on generation_error_logs for select 
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs" 
    on generation_error_logs for insert 
    with check (auth.uid() = user_id);

-- Create indexes
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_generations_user_id on generations(user_id);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- Create trigger for updating flashcards.updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

create trigger update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_column(); 