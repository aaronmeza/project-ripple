# Makefile for Supabase local development
# ---------------------------------------

# Set your Supabase project ref and DB connection string
PROJECT_REF=your-project-ref
PG_CONN=postgresql://your_user:your_password@db.${PROJECT_REF}.supabase.co:5432/postgres

# Default target
all: help

.PHONY: help
help:
	@echo "Usage:"
	@echo "  make install      # Install the Supabase CLI"
	@echo "  make init         # Initialize local Supabase project"
	@echo "  make link         # Link local project to remote Supabase project"
	@echo "  make pull         # Pull schema, policies, and RPCs"
	@echo "  make init-sql     # Concatenate all migrations into init.sql"
	@echo "  make seed         # Generate seed.sql from live database"

install:
	brew install supabase/tap/supabase

init:
	supabase init

link:
	supabase link --project-ref $(PROJECT_REF)

pull:
	supabase db pull

init-sql:
	cat supabase/migrations/* > supabase/init.sql

seed:
	pg_dump "$(PG_CONN)" \
		--data-only \
		--column-inserts \
		--table=users \
		--table=outcomes \
		--table=videos \
		--table=video_upvotes \
		> supabase/seed.sql

