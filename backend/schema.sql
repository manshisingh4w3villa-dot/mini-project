--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)
-- Dumped by pg_dump version 12.22 (Ubuntu 12.22-0ubuntu0.20.04.4)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    workspace_id integer NOT NULL,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status character varying(20) DEFAULT 'booked'::character varying NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    hours numeric(5,2),
    hourly_rate numeric(10,2),
    subscription_id integer,
    payment_status character varying(20) DEFAULT 'not_required'::character varying NOT NULL,
    stripe_checkout_session_id character varying(255),
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['booked'::character varying, 'checked_in'::character varying, 'cancelled'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: coworking_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coworking_locations (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    city character varying(100) NOT NULL,
    address text NOT NULL,
    latitude numeric(9,6),
    longitude numeric(9,6),
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: coworking_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coworking_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coworking_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coworking_locations_id_seq OWNED BY public.coworking_locations.id;


--
-- Name: user_social_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_social_accounts (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    provider character varying(32) NOT NULL,
    provider_subject character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_social_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_social_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_social_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_social_accounts_id_seq OWNED BY public.user_social_accounts.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(225) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    password_hash character varying(255),
    is_verified boolean DEFAULT false,
    verification_token character varying(255),
    profile_picture_url text,
    address text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_admin boolean DEFAULT false,
    plan_expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    verification_token_expires_at timestamp with time zone,
    plan_status character varying(20) DEFAULT 'free'::character varying NOT NULL,
    plan_name character varying(50),
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    pending_subscription_session_id character varying(255),
    pending_subscription_plan character varying(50),
    CONSTRAINT users_plan_status_check CHECK (((plan_status)::text = ANY ((ARRAY['free'::character varying, 'active'::character varying, 'past_due'::character varying, 'cancelled'::character varying, 'expired'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id integer NOT NULL,
    location_id integer NOT NULL,
    name character varying(150) NOT NULL,
    type character varying(50) DEFAULT 'desk'::character varying NOT NULL,
    capacity integer DEFAULT 1 NOT NULL,
    price_per_day numeric(10,2) DEFAULT 0 NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    price_per_hour numeric(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT workspaces_type_check CHECK (((type)::text = ANY ((ARRAY['desk'::character varying, 'private-office'::character varying, 'meeting-room'::character varying, 'event-space'::character varying])::text[])))
);


--
-- Name: workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workspaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workspaces_id_seq OWNED BY public.workspaces.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: coworking_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coworking_locations ALTER COLUMN id SET DEFAULT nextval('public.coworking_locations_id_seq'::regclass);


--
-- Name: user_social_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_social_accounts ALTER COLUMN id SET DEFAULT nextval('public.user_social_accounts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workspaces id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN id SET DEFAULT nextval('public.workspaces_id_seq'::regclass);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: coworking_locations coworking_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coworking_locations
    ADD CONSTRAINT coworking_locations_pkey PRIMARY KEY (id);


--
-- Name: user_social_accounts user_social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_social_accounts
    ADD CONSTRAINT user_social_accounts_pkey PRIMARY KEY (id);


--
-- Name: user_social_accounts user_social_accounts_provider_subject_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_social_accounts
    ADD CONSTRAINT user_social_accounts_provider_subject_key UNIQUE (provider, provider_subject);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: bookings_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_date_idx ON public.bookings USING btree (booking_date);


--
-- Name: bookings_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_user_idx ON public.bookings USING btree (user_id);


--
-- Name: bookings_workspace_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bookings_workspace_idx ON public.bookings USING btree (workspace_id);


--
-- Name: user_social_accounts_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_social_accounts_user_id_idx ON public.user_social_accounts USING btree (user_id);


--
-- Name: users_pending_subscription_session_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_pending_subscription_session_idx ON public.users USING btree (pending_subscription_session_id) WHERE (pending_subscription_session_id IS NOT NULL);


--
-- Name: users_stripe_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_stripe_customer_idx ON public.users USING btree (stripe_customer_id);


--
-- Name: users_stripe_subscription_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_stripe_subscription_idx ON public.users USING btree (stripe_subscription_id);


--
-- Name: users_verification_token_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_verification_token_expiry_idx ON public.users USING btree (verification_token_expires_at) WHERE (verification_token_expires_at IS NOT NULL);


--
-- Name: users_verification_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_verification_token_idx ON public.users USING btree (verification_token);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: user_social_accounts user_social_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_social_accounts
    ADD CONSTRAINT user_social_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.coworking_locations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

