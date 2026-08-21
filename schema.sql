


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."certificates_swap_priority_on_conflict"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare v_conflict_id uuid;
begin
  if not (new.priority is distinct from old.priority) then return new; end if;
  if new.priority is null then return new; end if;
  if pg_trigger_depth() > 1 then return new; end if;

  set constraints certificates_priority_key deferred;

  select c.id into v_conflict_id
  from public.certificates c
  where c.priority = new.priority and c.id <> new.id
  for update limit 1;

  if v_conflict_id is not null then
    update public.certificates set priority = old.priority where id = v_conflict_id;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."certificates_swap_priority_on_conflict"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."experiences_swap_priority_on_conflict"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare v_conflict_id uuid;
begin
  if not (new.priority is distinct from old.priority) then return new; end if;
  if new.priority is null then return new; end if;
  if pg_trigger_depth() > 1 then return new; end if;

  set constraints experiences_priority_key deferred;

  select e.id into v_conflict_id
  from public.experiences e
  where e.priority = new.priority and e.id <> new.id
  for update limit 1;

  if v_conflict_id is not null then
    update public.experiences set priority = old.priority where id = v_conflict_id;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."experiences_swap_priority_on_conflict"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."skill_categories_swap_priority_on_conflict"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_conflict_id uuid;
begin
  if not (new.priority is distinct from old.priority) then
    return new;
  end if;

  if new.priority is null then
    return new;
  end if;

  if pg_trigger_depth() > 1 then
    return new;
  end if;

  set constraints skill_categories_priority_key deferred;

  select c.id
    into v_conflict_id
  from public.skill_categories c
  where c.priority = new.priority
    and c.id <> new.id
  for update
  limit 1;

  if v_conflict_id is not null then
    update public.skill_categories
    set priority = old.priority
    where id = v_conflict_id;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."skill_categories_swap_priority_on_conflict"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."skills_swap_priority_on_conflict"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_conflict_id uuid;
begin
  if not (
    new.priority is distinct from old.priority
    or new.skill_category_id is distinct from old.skill_category_id
  ) then
    return new;
  end if;

  if new.skill_category_id is null or new.priority is null then
    return new;
  end if;

  if pg_trigger_depth() > 1 then
    return new;
  end if;

  -- Defer uniqueness check until end of transaction
  set constraints skills_category_priority_key deferred;

  select s.id
    into v_conflict_id
  from public.skills s
  where s.skill_category_id = new.skill_category_id
    and s.priority = new.priority
    and s.id <> new.id
  for update
  limit 1;

  if v_conflict_id is not null then
    update public.skills
    set priority = old.priority
    where id = v_conflict_id;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."skills_swap_priority_on_conflict"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "issuer" "text" NOT NULL,
    "year" "text",
    "link" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "priority" integer NOT NULL
);


ALTER TABLE "public"."certificates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."educations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "issuer" "text" NOT NULL,
    "year" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."educations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."experiences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "company" "text" NOT NULL,
    "period" "text",
    "description" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "priority" integer NOT NULL
);


ALTER TABLE "public"."experiences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."personal_info" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "location" "text",
    "summary" "text",
    "headline" "text",
    "profile_image" "text",
    "is_available_for_work" boolean DEFAULT true,
    "social" "jsonb" DEFAULT '{}'::"jsonb",
    "languages" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."personal_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "project_category" integer,
    "github_url" "text",
    "live_url" "text",
    "technologies" "jsonb" DEFAULT '[]'::"jsonb",
    "key_features" "jsonb" DEFAULT '[]'::"jsonb",
    "screenshots" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "hierarchy" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "projects_hierarchy_positive_or_temp" CHECK ((("hierarchy" = '-1'::integer) OR ("hierarchy" >= 1)))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skill_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "priority" integer NOT NULL
);


ALTER TABLE "public"."skill_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "icon" integer,
    "skill_category_id" "uuid",
    "certificate_id" "uuid",
    "mastery_level" numeric DEFAULT 0,
    "is_new" boolean DEFAULT false,
    "details" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "priority" integer NOT NULL
);


ALTER TABLE "public"."skills" OWNER TO "postgres";


ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_priority_key" UNIQUE ("priority") DEFERRABLE;



ALTER TABLE ONLY "public"."educations"
    ADD CONSTRAINT "educations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."experiences"
    ADD CONSTRAINT "experiences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."experiences"
    ADD CONSTRAINT "experiences_priority_key" UNIQUE ("priority") DEFERRABLE;



ALTER TABLE ONLY "public"."personal_info"
    ADD CONSTRAINT "personal_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_hierarchy_unique" UNIQUE ("hierarchy");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skill_categories"
    ADD CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skill_categories"
    ADD CONSTRAINT "skill_categories_priority_key" UNIQUE ("priority") DEFERRABLE;



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_category_priority_key" UNIQUE ("skill_category_id", "priority") DEFERRABLE;



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "certificates_set_updated_at" BEFORE UPDATE ON "public"."certificates" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "certificates_swap_priority_trigger" BEFORE UPDATE OF "priority" ON "public"."certificates" FOR EACH ROW EXECUTE FUNCTION "public"."certificates_swap_priority_on_conflict"();



CREATE OR REPLACE TRIGGER "educations_set_updated_at" BEFORE UPDATE ON "public"."educations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "experiences_set_updated_at" BEFORE UPDATE ON "public"."experiences" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "experiences_swap_priority_trigger" BEFORE UPDATE OF "priority" ON "public"."experiences" FOR EACH ROW EXECUTE FUNCTION "public"."experiences_swap_priority_on_conflict"();



CREATE OR REPLACE TRIGGER "personal_info_set_updated_at" BEFORE UPDATE ON "public"."personal_info" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "projects_set_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "skill_categories_set_updated_at" BEFORE UPDATE ON "public"."skill_categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "skill_categories_swap_priority_trigger" BEFORE UPDATE OF "priority" ON "public"."skill_categories" FOR EACH ROW EXECUTE FUNCTION "public"."skill_categories_swap_priority_on_conflict"();



CREATE OR REPLACE TRIGGER "skills_set_updated_at" BEFORE UPDATE ON "public"."skills" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "skills_swap_priority_trigger" BEFORE UPDATE OF "priority", "skill_category_id" ON "public"."skills" FOR EACH ROW EXECUTE FUNCTION "public"."skills_swap_priority_on_conflict"();



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_skill_category_id_fkey" FOREIGN KEY ("skill_category_id") REFERENCES "public"."skill_categories"("id");



CREATE POLICY "auth write certificates" ON "public"."certificates" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "auth write educations" ON "public"."educations" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "auth write experiences" ON "public"."experiences" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "auth write personal_info" ON "public"."personal_info" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "auth write projects" ON "public"."projects" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "auth write skill_categories" ON "public"."skill_categories" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "auth write skills" ON "public"."skills" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."certificates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."educations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."experiences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."personal_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public read" ON "public"."certificates" FOR SELECT USING (true);



CREATE POLICY "public read" ON "public"."educations" FOR SELECT USING (true);



CREATE POLICY "public read" ON "public"."experiences" FOR SELECT USING (true);



CREATE POLICY "public read" ON "public"."personal_info" FOR SELECT USING (true);



CREATE POLICY "public read" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "public read" ON "public"."skill_categories" FOR SELECT USING (true);



CREATE POLICY "public read" ON "public"."skills" FOR SELECT USING (true);



ALTER TABLE "public"."skill_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skills" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."certificates_swap_priority_on_conflict"() TO "anon";
GRANT ALL ON FUNCTION "public"."certificates_swap_priority_on_conflict"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."certificates_swap_priority_on_conflict"() TO "service_role";



GRANT ALL ON FUNCTION "public"."experiences_swap_priority_on_conflict"() TO "anon";
GRANT ALL ON FUNCTION "public"."experiences_swap_priority_on_conflict"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."experiences_swap_priority_on_conflict"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."skill_categories_swap_priority_on_conflict"() TO "anon";
GRANT ALL ON FUNCTION "public"."skill_categories_swap_priority_on_conflict"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."skill_categories_swap_priority_on_conflict"() TO "service_role";



GRANT ALL ON FUNCTION "public"."skills_swap_priority_on_conflict"() TO "anon";
GRANT ALL ON FUNCTION "public"."skills_swap_priority_on_conflict"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."skills_swap_priority_on_conflict"() TO "service_role";


















GRANT ALL ON TABLE "public"."certificates" TO "anon";
GRANT ALL ON TABLE "public"."certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."certificates" TO "service_role";



GRANT ALL ON TABLE "public"."educations" TO "anon";
GRANT ALL ON TABLE "public"."educations" TO "authenticated";
GRANT ALL ON TABLE "public"."educations" TO "service_role";



GRANT ALL ON TABLE "public"."experiences" TO "anon";
GRANT ALL ON TABLE "public"."experiences" TO "authenticated";
GRANT ALL ON TABLE "public"."experiences" TO "service_role";



GRANT ALL ON TABLE "public"."personal_info" TO "anon";
GRANT ALL ON TABLE "public"."personal_info" TO "authenticated";
GRANT ALL ON TABLE "public"."personal_info" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."skill_categories" TO "anon";
GRANT ALL ON TABLE "public"."skill_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."skill_categories" TO "service_role";



GRANT ALL ON TABLE "public"."skills" TO "anon";
GRANT ALL ON TABLE "public"."skills" TO "authenticated";
GRANT ALL ON TABLE "public"."skills" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































