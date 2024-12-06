-- First check if the trigger exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        drop trigger if exists on_auth_user_created on auth.users;
    END IF;
END $$;

-- Drop the function if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname = 'handle_new_user'
    ) THEN
        drop function if exists public.handle_new_user();
    END IF;
END $$;

-- Recreate function with updated logic
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    user_name text;
    user_avatar text;
begin
    -- Try to get name from various sources
    user_name := coalesce(
        new.raw_user_meta_data->>'name',                    -- Direct metadata
        new.raw_user_meta_data->>'full_name',              -- OAuth metadata
        new.raw_user_meta_data->'user_metadata'->>'name',  -- Nested OAuth metadata
        split_part(new.email, '@', 1)                      -- Fallback to email
    );
    
    -- Try to get avatar from various sources
    user_avatar := coalesce(
        new.raw_user_meta_data->>'avatar_url',             -- Direct metadata
        new.raw_user_meta_data->>'picture',                -- OAuth metadata
        new.raw_user_meta_data->'user_metadata'->>'picture' -- Nested OAuth metadata
    );

    insert into public.users (
        id,
        email,
        name,
        avatar_url,
        subscription_tier,
        token_usage
    )
    values (
        new.id,
        new.email,
        user_name,
        user_avatar,
        'free',
        0
    );
    return new;
end;
$$;

-- Recreate trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;
