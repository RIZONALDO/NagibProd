--
-- PostgreSQL database dump
--

\restrict eeHgmktXRgzTqzAD8S1qFDLxZlCnUazMS7Kf6rppgrNlBtj8utp3JwagAsjQL30

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    shoot_id integer,
    equipment_id integer,
    team_member_id integer,
    metadata text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.app_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: app_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.app_settings_id_seq OWNED BY public.app_settings.id;


--
-- Name: checkout_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checkout_items (
    id integer NOT NULL,
    checkout_id integer NOT NULL,
    equipment_id integer NOT NULL,
    quantity integer NOT NULL,
    condition_out text,
    notes text
);


--
-- Name: checkout_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checkout_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checkout_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checkout_items_id_seq OWNED BY public.checkout_items.id;


--
-- Name: checkouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checkouts (
    id integer NOT NULL,
    shoot_id integer NOT NULL,
    delivered_by text NOT NULL,
    reviewed_by text NOT NULL,
    received_by text NOT NULL,
    checkout_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: checkouts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checkouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checkouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checkouts_id_seq OWNED BY public.checkouts.id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    internal_code text,
    total_quantity integer DEFAULT 1 NOT NULL,
    available_quantity integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    storage_location text,
    notes text,
    image_url text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: equipment_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_links (
    id integer NOT NULL,
    equipment_id integer NOT NULL,
    linked_equipment_id integer NOT NULL,
    default_quantity integer DEFAULT 1 NOT NULL,
    required boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: equipment_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipment_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipment_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipment_links_id_seq OWNED BY public.equipment_links.id;


--
-- Name: return_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.return_items (
    id integer NOT NULL,
    return_id integer NOT NULL,
    equipment_id integer NOT NULL,
    quantity_sent integer NOT NULL,
    quantity_returned integer NOT NULL,
    condition_return text,
    notes text,
    has_damage boolean DEFAULT false NOT NULL
);


--
-- Name: return_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.return_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: return_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.return_items_id_seq OWNED BY public.return_items.id;


--
-- Name: returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.returns (
    id integer NOT NULL,
    shoot_id integer NOT NULL,
    returned_by text NOT NULL,
    reviewed_by text NOT NULL,
    received_by text NOT NULL,
    has_pendencies boolean DEFAULT false NOT NULL,
    return_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: returns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.returns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.returns_id_seq OWNED BY public.returns.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: shoot_equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shoot_equipment (
    id integer NOT NULL,
    shoot_id integer NOT NULL,
    equipment_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    notes text,
    condition_out text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_linked_item boolean DEFAULT false NOT NULL,
    parent_shoot_equipment_id integer
);


--
-- Name: shoot_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shoot_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shoot_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shoot_equipment_id_seq OWNED BY public.shoot_equipment.id;


--
-- Name: shoot_team; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shoot_team (
    id integer NOT NULL,
    shoot_id integer NOT NULL,
    team_member_id integer NOT NULL,
    role text NOT NULL,
    confirmed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    travel_diarias integer DEFAULT 0 NOT NULL
);


--
-- Name: shoot_team_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shoot_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shoot_team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shoot_team_id_seq OWNED BY public.shoot_team.id;


--
-- Name: shoots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shoots (
    id integer NOT NULL,
    date text NOT NULL,
    "time" text,
    location text NOT NULL,
    briefing text,
    whatsapp_summary text,
    producer_name text,
    client_project text,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    has_travel boolean DEFAULT false NOT NULL,
    end_date text,
    schedule_changed_at timestamp with time zone,
    title text
);


--
-- Name: shoots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shoots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shoots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shoots_id_seq OWNED BY public.shoots.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    name text NOT NULL,
    primary_role text NOT NULL,
    secondary_role text,
    phone text,
    notes text,
    avatar_url text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_freelancer boolean DEFAULT false NOT NULL
);


--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    login text NOT NULL,
    password_hash text NOT NULL,
    profile text DEFAULT 'visualizador'::text NOT NULL,
    avatar_url text,
    phone text,
    notes text,
    status text DEFAULT 'active'::text NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_producer boolean DEFAULT false NOT NULL
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
-- Name: whatsapp_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_templates (
    id integer NOT NULL,
    template_key text NOT NULL,
    name text NOT NULL,
    content text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.whatsapp_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.whatsapp_templates_id_seq OWNED BY public.whatsapp_templates.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: app_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings ALTER COLUMN id SET DEFAULT nextval('public.app_settings_id_seq'::regclass);


--
-- Name: checkout_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_items ALTER COLUMN id SET DEFAULT nextval('public.checkout_items_id_seq'::regclass);


--
-- Name: checkouts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkouts ALTER COLUMN id SET DEFAULT nextval('public.checkouts_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: equipment_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_links ALTER COLUMN id SET DEFAULT nextval('public.equipment_links_id_seq'::regclass);


--
-- Name: return_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items ALTER COLUMN id SET DEFAULT nextval('public.return_items_id_seq'::regclass);


--
-- Name: returns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns ALTER COLUMN id SET DEFAULT nextval('public.returns_id_seq'::regclass);


--
-- Name: shoot_equipment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_equipment ALTER COLUMN id SET DEFAULT nextval('public.shoot_equipment_id_seq'::regclass);


--
-- Name: shoot_team id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_team ALTER COLUMN id SET DEFAULT nextval('public.shoot_team_id_seq'::regclass);


--
-- Name: shoots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoots ALTER COLUMN id SET DEFAULT nextval('public.shoots_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: whatsapp_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_templates ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_templates_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, type, description, shoot_id, equipment_id, team_member_id, metadata, created_at) FROM stdin;
1	shoot_created	Diária em Sede da Empresa ABC criada	1	\N	\N	\N	2026-04-23 08:36:57.98665+00
2	team_added_to_shoot	Carlos Mendes adicionado à diária	1	\N	1	\N	2026-04-23 08:36:57.98665+00
3	team_added_to_shoot	Fernanda Costa adicionada à diária	1	\N	2	\N	2026-04-23 08:36:57.98665+00
4	equipment_added_to_shoot	Sony FX3 adicionada à diária	1	1	\N	\N	2026-04-23 08:36:57.98665+00
5	shoot_created	Diária no Estúdio Nagibe criada	2	\N	\N	\N	2026-04-23 08:36:57.98665+00
6	shoot_created	Diária na Praia de Santos criada	3	\N	\N	\N	2026-04-23 08:36:57.98665+00
7	team_member_created	Membro Carlos Mendes cadastrado	\N	\N	1	\N	2026-04-23 08:36:57.98665+00
8	equipment_created	Equipamento Sony FX3 cadastrado	\N	1	\N	\N	2026-04-23 08:36:57.98665+00
9	settings_updated	Configurações do sistema atualizadas: company_name, system_name, logo_url, primary_color, secondary_color	\N	\N	\N	\N	2026-04-23 09:01:04.01592+00
10	equipment_updated	Equipamento Bateria Sony NP-FZ100 atualizado	\N	10	\N	\N	2026-04-23 09:14:16.63059+00
11	team_added_to_shoot	Julia Souza adicionado à diária	2	\N	4	\N	2026-04-23 09:31:34.650039+00
12	equipment_added_to_shoot	Cartão SD SanDisk 256GB adicionado à diária	3	11	\N	\N	2026-04-23 09:35:40.454213+00
13	equipment_added_to_shoot	Sony FX3 adicionado à diária	1	1	\N	\N	2026-04-23 09:40:27.262888+00
14	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à diária (item vinculado)	1	5	\N	\N	2026-04-23 09:40:27.331828+00
15	equipment_added_to_shoot	Lente Sony 24-70mm f/2.8 adicionado à diária (item vinculado)	1	3	\N	\N	2026-04-23 09:40:39.676409+00
16	shoot_updated	Diária em Praia de Santos - Santos atualizada	3	\N	\N	\N	2026-04-23 09:54:59.493389+00
17	shoot_updated	Diária em Praia de Santos - Santos atualizada	3	\N	\N	\N	2026-04-23 09:55:14.876745+00
18	team_added_to_shoot	Carlos Mendes adicionado à diária	3	\N	1	\N	2026-04-23 10:11:05.499814+00
19	shoot_updated	Diária em Praia de Santos - Santos atualizada	3	\N	\N	\N	2026-04-23 10:12:10.901126+00
20	shoot_updated	Diária em Sede da Empresa ABC - São Paulo atualizada	1	\N	\N	\N	2026-04-23 10:13:00.651784+00
21	shoot_created	Pauta em Estúdio Teste Período em 2026-04-24 criada	5	\N	\N	\N	2026-04-23 10:21:49.456419+00
22	shoot_updated	Pauta em Estúdio Teste Período atualizada	5	\N	\N	\N	2026-04-23 10:22:31.655462+00
23	equipment_added_to_shoot	Sony A7S III adicionado à pauta	3	2	\N	\N	2026-04-23 13:23:02.964273+00
24	shoot_updated	Pauta em Praia de Santos - Santos atualizada	3	\N	\N	\N	2026-04-23 13:23:30.704565+00
25	shoot_updated	Pauta em Praia de Santos - Santos atualizada	3	\N	\N	\N	2026-04-23 13:23:40.610589+00
26	shoot_created	Pauta em Ginásio Paulo Conrado em 2026-04-27 criada	6	\N	\N	\N	2026-04-23 13:26:31.223479+00
27	shoot_updated	Pauta em Ginásio Paulo Conrado atualizada	6	\N	\N	\N	2026-04-23 13:26:48.288794+00
28	team_added_to_shoot	Ana Paula adicionado à pauta	6	\N	6	\N	2026-04-23 13:27:07.310282+00
29	team_added_to_shoot	Julia Souza adicionado à pauta	6	\N	4	\N	2026-04-23 13:27:27.46164+00
30	equipment_added_to_shoot	Sony A7S III adicionado à pauta	6	2	\N	\N	2026-04-23 13:27:49.200143+00
31	equipment_added_to_shoot	Gravador Zoom H6 adicionado à pauta	6	6	\N	\N	2026-04-23 13:28:09.260318+00
32	settings_updated	Configurações do sistema atualizadas: company_name, system_name, logo_url, primary_color, secondary_color	\N	\N	\N	\N	2026-04-23 14:21:05.700663+00
33	team_member_created	Membro Carlos Freela cadastrado	\N	\N	9	\N	2026-04-23 14:28:31.876617+00
34	team_member_updated	Membro Carlos Freela atualizado	\N	\N	9	\N	2026-04-23 14:29:52.791388+00
35	team_member_updated	Membro Ana Paula atualizado	\N	\N	6	\N	2026-04-23 14:32:00.807557+00
36	settings_updated	Configurações do sistema atualizadas: company_name, system_name, logo_url, primary_color, secondary_color	\N	\N	\N	\N	2026-04-23 14:34:10.106556+00
37	settings_updated	Configurações do sistema atualizadas: company_name, system_name, logo_url, primary_color, secondary_color	\N	\N	\N	\N	2026-04-23 14:34:24.184047+00
38	checkout	Saída de equipamentos registrada para pauta	6	\N	\N	\N	2026-04-23 14:36:59.982215+00
39	equipment_added_to_shoot	Sony FX3 adicionado à pauta	2	1	\N	\N	2026-04-23 14:41:38.742803+00
40	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à pauta (item vinculado)	2	5	\N	\N	2026-04-23 14:41:38.938513+00
41	equipment_added_to_shoot	Bateria Sony NP-FZ100 adicionado à pauta	1	10	\N	\N	2026-04-23 14:49:19.195605+00
42	equipment_added_to_shoot	Sony FX3 adicionado à pauta	7	1	\N	\N	2026-04-23 14:54:25.752486+00
43	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à pauta (item vinculado)	7	5	\N	\N	2026-04-23 14:54:25.831077+00
44	equipment_added_to_shoot	Lente Sony 24-70mm f/2.8 adicionado à pauta (item vinculado)	7	3	\N	\N	2026-04-23 14:54:30.577924+00
45	shoot_updated	Pauta em Ginásio Paulo Conrado atualizada	6	\N	\N	\N	2026-04-23 15:03:57.130037+00
46	equipment_added_to_shoot	Sony FX3 adicionado à pauta	6	1	\N	\N	2026-04-23 16:34:16.358852+00
47	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à pauta (item vinculado)	6	5	\N	\N	2026-04-23 16:34:16.790781+00
48	equipment_added_to_shoot	Lente Sony 24-70mm f/2.8 adicionado à pauta (item vinculado)	6	3	\N	\N	2026-04-23 16:34:23.359016+00
49	checkout	Saída de equipamentos registrada para pauta	2	\N	\N	\N	2026-04-23 16:37:29.24323+00
50	return	Devolução de equipamentos registrada com pendências	2	\N	\N	\N	2026-04-23 16:40:35.112979+00
51	return	Devolução de equipamentos registrada	6	\N	\N	\N	2026-04-23 16:41:29.429908+00
52	equipment_created	Equipamento Blackmagick 4k cadastrado	\N	15	\N	\N	2026-04-23 16:52:34.604915+00
53	shoot_updated	Pauta em Ginásio Paulo Conrado atualizada	6	\N	\N	\N	2026-04-23 16:55:43.315771+00
54	shoot_updated	Pauta em Ginásio Paulo Conrado atualizada	6	\N	\N	\N	2026-04-23 16:55:56.496721+00
55	equipment_created	Equipamento Teste Vinculação cadastrado	\N	16	\N	\N	2026-04-23 16:57:10.974432+00
56	team_member_updated	Membro Ana Paula atualizado	\N	\N	6	\N	2026-04-23 16:59:11.361149+00
57	shoot_updated	Pauta em Ginásio Paulo Conrado atualizada	6	\N	\N	\N	2026-04-23 17:14:03.161778+00
58	shoot_updated	Pauta em Ginásio Paulo Conrado atualizada	6	\N	\N	\N	2026-04-23 17:14:09.033275+00
59	shoot_updated	Pauta em Estúdio Nagibe - Pinheiros atualizada	2	\N	\N	\N	2026-04-23 17:19:13.087038+00
60	shoot_updated	Pauta em Estúdio Nagibe - Pinheiros atualizada	2	\N	\N	\N	2026-04-23 17:19:19.386407+00
61	shoot_updated	Pauta em Estúdio Nagibe - Pinheiros (Atualizado) atualizada	2	\N	\N	\N	2026-04-23 17:19:46.623327+00
62	shoot_updated	Pauta em Estúdio Teste Período atualizada	5	\N	\N	\N	2026-04-23 18:43:12.583541+00
63	shoot_created	Pauta em Calçoene em 2026-04-25 criada	8	\N	\N	\N	2026-04-23 18:46:33.261686+00
64	team_added_to_shoot	Beatriz Santos adicionado à pauta	8	\N	8	\N	2026-04-23 18:46:47.772486+00
65	team_added_to_shoot	Fernanda Costa adicionado à pauta	8	\N	2	\N	2026-04-23 18:46:56.608718+00
66	shoot_updated	Pauta em Calçoene atualizada	8	\N	\N	\N	2026-04-23 18:47:00.195889+00
67	equipment_added_to_shoot	Sony A7S III adicionado à pauta	8	2	\N	\N	2026-04-23 18:47:15.223815+00
68	shoot_updated	Pauta em Calçoene atualizada	8	\N	\N	\N	2026-04-23 18:47:34.418182+00
69	shoot_created	Pauta em Estúdio Central em 2026-04-23 criada	9	\N	\N	\N	2026-04-23 18:54:21.295804+00
70	shoot_updated	Pauta em Estúdio Central atualizada	9	\N	\N	\N	2026-04-23 18:55:07.093083+00
71	shoot_updated	Pauta em Praia de Santos - Santos atualizada	3	\N	\N	\N	2026-04-23 19:07:02.826732+00
72	shoot_updated	Pauta em Estúdio Nagibe - Pinheiros (Atualizado) atualizada	2	\N	\N	\N	2026-04-23 19:09:31.505327+00
73	shoot_created	Pauta em Estúdio Teste em 2026-04-23 criada	10	\N	\N	\N	2026-04-23 19:12:12.524554+00
74	shoot_created	Pauta em Estúdio Teste em 2026-04-23 criada	11	\N	\N	\N	2026-04-23 19:12:51.211612+00
75	shoot_updated	Pauta em Estúdio Teste Período atualizada	5	\N	\N	\N	2026-04-23 19:14:04.199402+00
76	shoot_updated	Pauta em Estúdio Teste Período atualizada	5	\N	\N	\N	2026-04-23 19:17:59.263737+00
77	shoot_updated	Pauta em Estúdio Teste Período atualizada	5	\N	\N	\N	2026-04-23 19:18:10.962171+00
78	team_added_to_shoot	Beatriz Santos adicionado à pauta	9	\N	8	\N	2026-04-23 19:19:02.704176+00
79	shoot_updated	Pauta em Estúdio Central atualizada	9	\N	\N	\N	2026-04-23 19:19:06.539533+00
80	equipment_added_to_shoot	Sony A7S III adicionado à pauta	9	2	\N	\N	2026-04-23 19:19:14.658399+00
81	equipment_created	Equipamento BlackMagic 4k cadastrado	\N	17	\N	\N	2026-04-23 19:20:09.962396+00
82	equipment_added_to_shoot	Sony FX3 adicionado à pauta	2	1	\N	\N	2026-04-23 19:24:29.955778+00
83	shoot_created	Pauta em Estúdio em 2026-04-23 criada	12	\N	\N	\N	2026-04-23 19:25:45.492891+00
84	equipment_added_to_shoot	Sony FX3 adicionado à pauta	12	1	\N	\N	2026-04-23 19:26:07.803817+00
85	equipment_added_to_shoot	Lente Sony 24-70mm f/2.8 adicionado à pauta (item vinculado)	12	3	\N	\N	2026-04-23 19:26:16.504077+00
86	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à pauta (item vinculado)	12	5	\N	\N	2026-04-23 19:26:16.540162+00
87	equipment_added_to_shoot	Sony FX3 adicionado à pauta	12	1	\N	\N	2026-04-23 19:26:40.338428+00
88	shoot_created	Pauta em Studio em 2026-04-23 criada	13	\N	\N	\N	2026-04-23 19:28:58.257749+00
89	equipment_added_to_shoot	Sony FX3 adicionado à pauta	13	1	\N	\N	2026-04-23 19:29:21.363374+00
90	equipment_added_to_shoot	Lente Sony 24-70mm f/2.8 adicionado à pauta (item vinculado)	13	3	\N	\N	2026-04-23 19:29:27.729244+00
91	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à pauta (item vinculado)	13	5	\N	\N	2026-04-23 19:29:27.762668+00
92	team_added_to_shoot	Ana Paula adicionado à pauta	5	\N	6	\N	2026-04-23 19:49:17.729595+00
93	equipment_added_to_shoot	BlackMagic 4k adicionado à pauta	5	17	\N	\N	2026-04-23 19:49:26.419047+00
94	equipment_created	Equipamento BlackMagic 4k cadastrado	\N	18	\N	\N	2026-04-23 20:08:46.538513+00
95	team_added_to_shoot	Ana Paula adicionado à pauta	2	\N	6	\N	2026-04-23 20:15:26.827664+00
96	equipment_added_to_shoot	Bateria Sony NP-FZ100 adicionado à pauta	2	10	\N	\N	2026-04-23 20:15:54.817318+00
97	team_added_to_shoot	Carlos Freela adicionado à pauta	2	\N	9	\N	2026-04-23 21:06:22.777481+00
98	equipment_added_to_shoot	Sony A7S III adicionado à pauta	5	2	\N	\N	2026-04-23 21:07:19.261271+00
99	equipment_added_to_shoot	Tripé Manfrotto 504X adicionado à pauta	5	9	\N	\N	2026-04-23 21:07:25.466056+00
100	equipment_added_to_shoot	Sony FX3 adicionado à pauta	2	1	\N	\N	2026-04-23 21:08:37.339203+00
101	equipment_added_to_shoot	Lente Sony 24-70mm f/2.8 adicionado à pauta (item vinculado)	2	3	\N	\N	2026-04-23 21:08:43.323385+00
102	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à pauta (item vinculado)	2	5	\N	\N	2026-04-23 21:08:43.595318+00
103	shoot_updated	Pauta em Estúdio Nagibe - Pinheiros (Atualizado) atualizada	2	\N	\N	\N	2026-04-23 21:08:50.916274+00
104	shoot_updated	Pauta em Estúdio Nagibe - Pinheiros (Atualizado) atualizada	2	\N	\N	\N	2026-04-23 21:09:20.904304+00
105	team_added_to_shoot	Carlos Freela adicionado à pauta	5	\N	9	\N	2026-04-23 21:10:52.898397+00
106	equipment_added_to_shoot	Microfone Rode NTG-4 adicionado à pauta	5	5	\N	\N	2026-04-23 21:12:45.908883+00
107	equipment_added_to_shoot	Sony FX3 adicionado à pauta	5	1	\N	\N	2026-04-23 21:13:06.272738+00
108	team_added_to_shoot	Carlos Mendes adicionado à pauta	2	\N	1	\N	2026-04-23 21:16:02.836024+00
109	equipment_added_to_shoot	Bateria Sony NP-FZ100 adicionado à pauta	2	10	\N	\N	2026-04-23 23:37:02.446391+00
110	team_added_to_shoot	Marcos Rocha adicionado à pauta	5	\N	7	\N	2026-04-23 23:38:13.826385+00
111	equipment_added_to_shoot	BlackMagic 4k adicionado à pauta	5	18	\N	\N	2026-04-23 23:38:19.769907+00
112	equipment_added_to_shoot	Cartão SD SanDisk 256GB adicionado à pauta (item vinculado)	5	11	\N	\N	2026-04-23 23:38:22.179142+00
113	equipment_created	Equipamento Teste Câmera cadastrado	\N	19	\N	\N	2026-04-23 23:44:44.743611+00
114	shoot_updated	Pauta em Estúdio Teste atualizada	10	\N	\N	\N	2026-04-23 23:48:35.935901+00
115	team_added_to_shoot	Carlos Mendes adicionado à pauta	10	\N	1	\N	2026-04-23 23:48:44.386725+00
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_settings (id, key, value, updated_at) FROM stdin;
1	company_name	Nagib Prod	2026-04-23 14:34:24.129+00
2	system_name	NagibeProd	2026-04-23 14:34:24.142+00
3	logo_url	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMHBhQSBxMSFRUXFhoXFhgXGBYYGhgYHRUXFhcWHRUYHyghHxsnIRYWITEiJSkrLi4uFyEzRDUtNygtLisBCgoKDg0OGxAQGy0mICUtLS8vNy0vLS0tLS0rLS0tLSstLS0tLS0tLS0tLS0vLS0tLS0tLS0tLS0tLS0tLS0tNf/AABEIAOEA4QMBEQACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcBBAUDCAL/xABEEAACAQIDAwcGCQsFAAAAAAAAAQIDBAUGERIhMQdBUWFxgaETIkJSYpEVFiMycoKissEkNVNzkrGzwtHS4RQzNqPx/8QAGgEBAAMBAQEAAAAAAAAAAAAAAAQFBgMCAf/EADARAQACAQIEBAQGAgMAAAAAAAABAgMEEQUSITEiQVFxEzJhkRQzgaGx0ULBIzRS/9oADAMBAAIRAxEAPwCqA+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1AxqBkAAAAAAAAAAAAAAAAAAAAAAAAAAAG3hmGVsWuNjDac6kufZW5dsnuXezllz48Vea87PVaWtO0QneEclsppPGayj7FJavvqS3e5PtKXPxysdMVd/rKVTST/lKVWWQrC0X+x5R9NSUp/Zb2fArMnFdTf/Lb2SK6bHHk6lHALSivkrW2XZSp/wBCNOrzz3vP3dPh09GK2X7SuvlrW2fbSp/0EavPXtefuTjp6OXe5CsLtbqHk3005Sh9nXZ8CTj4tqaf5b+7nbTY58kVxfktnTTeD1lP2KqUX3Tju96XaWmDjlZ6Za7eyPfSTHyygmJYbWwq42MRpzpy5lJcetSW6S602XOLNjyxzUndFtSaztLVOryAAAAAAAAAAAAAAAAAAAAAPct4E4ydkCeKxVbGNqnRe+MeE6i6fZj18X1cSm1/Fa4vBj62/aErDp5t1t2WrYWNPDrZU7GEYQXBRWnf1vrZmcua+W3Ned5T61isbQ2Dm9AAAAAAa2IWFLErV07+EZwfNJa96fM+tHTFmvitzUnaXm1YtG0qozjkKeERdbCtqpR4yT3zprpfrR6+K5+k0+h4rXN4MnS37SgZtPNeteyFFwigAAAAAAAAAAAAAAAAAAAWJyc5NV0o3eLR1hxo03wl0VJLo6Fz8egoeKcR5N8OLv5z/pM0+DfxWWiZpPAAAAAAAAAACq+UXJqstq7wmOlN76sF6D9eK9XpXNx4cNNwviPxP+LJPXyn1V+owbeKqvi9RAAAAAAAAAAAAAAAAAAkeRcu/GHGdK6+Rp6Sq9e/zaf1mn3JlfxHV/h8W8d57O2DFz2+i8YrZjpHcluSXN1GNmZmd5WsRsyfAAAAAAAAAAAMTgqkGqiTTWjT3pp7mmj7EzE7wTG6i875f+L2NONLXyU9Z0n1a74a9MW9OxrpNpw/V/icW8947/2qs+Pkt9EfJziAAAAAAAAAAAAAAAYb0W8C9MhYN8C5cpxqLSpU+UqdO1Jbo/VjsruZjOJan42edu0dIWmnx8tEiK93AAAAAAAAAAAAAjXKFg3wxlufk1rUpfKw6fNXnR746rt0LHheo+DnjftPSXDUU5qKPNkqwAAAAAAAAAAAAAADp5YsPhTMVCjLhKotr6MfPku9Ra7yPq8vwsFr/R7xV5rxD6CMIuAAAAAAAAAAAAAADtG+w+esw2HwXjtejHhCpJR+i/Oh9lo3mly/Fw1v6wpsleW0w553eQAAAAAAAAAAAAAEy5J6Hlc1OT9CjN97lCK8JSKnjV9tNt6zCTpY3uuMySyAAAAAAAAAAAAAAAKZ5VaHks3Nr06UJd/nQ/kRruD35tNEekyrNVG2REC1RwAAAAAAAAAAAAAE+5Hvz1X/AFK++v8ABScd/Jr7pej+afZa5l1gAAAAAAAAAAAAAAAVHyv/APIaX6hfxJmp4H+RPurtX8/6IMXSKAAAAAAAAAAAAAAmfJNX8lmpxfCdGa71KEl4RkVHGqb6ff0mEnSztdcRk1kAAAAAAAAAAHExXNtnhMmruvDaXGMNZyXU1DXTv0JuHh+oy9a16fXo5WzUr3lH6/KlawlpRo3EuvSnH98tSdXgeae9oj7uM6yvlElHlStZy0rUbiPXpTf7pai3A80drR+5Grr6O9hWb7LFZKNrXipPcoz1pyb6Ep6a92pBzcO1GLrNen06u1c9LdpVtyqXCr5tag09ilCD6n502vto0XB8c103XzmUHU23uiBaI4AAAAAAAAAAAAADqZWv1hmY6FWfCNRKX0ZeZJ+6TfcRtZi+LgtT6PeK3LeJfQJhVwAAAAAAAAaOM4tSwWxdXEJbMVuS4uT5oxXOztg0989+SkPF7xSN5VBmbPFxjknGi3Ro+pF+dJe3Nb32Ld28TV6ThmLB1nrb1/pXZdRa/SOkIslpol2JFlPRwdW1y3eXcdbe1rtdLg4/e0I99Zgr814+73GK89oZucs3lrDWva10uqDl93U+V1mC07VvBOK8d4cpre1Lm3NPm6miRE7w8HDgfQAAAAAAAAAAAAAAAw1qt4F7ZExn4ay5TlN61IfJ1OnailpLvWzLvZi+Jab4OeY8p6wtcF+eiQEB2AAAAAA8b27hY2c6t09mEIuUn0JHvHjtkvFK95fLWisbyofNGYKmYsSdWvqordThzQj/AHPi3+CRtdHpK6fHy17+apy5ZyTu2spZTq5kraw8yjF6TqNa/ViueXgvB89br6aavrbyh6xYZyey3cCy1bYFT/IKa2uepLzpv6z4di0RltRrs2efFPT0jssKYaUjpDrkR1AOVjeXbbHKemIUot8015s12TW/ueqJWn1ubBPgn9PJzvirfuqPN+UKuW6m1q6lFvSNTTTR80ZrmfXwfVwNToeIU1Mbdren9K7NhnHP0RssHEAAAAAAAAAAAAAAAkmQ8xfF/Gdbh/I1NI1fZ9Wp3avXqb6iv4lpPxGLp80dv6dsGXkt9F4p7S1jvRjZiYnaVqHwAAAABWvK7jLiqdpRfFeVq9mrVOPvUn3RNDwTTR1zT7R/tB1d+1YQbLuDyx3GIUKL02t8perBfOl+C62i61WojBinJKLjpN7bL7sLKGHWcKVnFRhBaRX+edvi3z6mIy5bZbze3eVtWsVjaGwc3oAAAPK7tYXtrKndRUoSWzJPg0z3jyWx2i1Z6w+TETG0qFzRgssAxqdGerj86nJ+lB67L7dzT60zbaPUxqMUXjv5+6py45pbZySU5gAAAAAAAAAAAAAAFjcnOclbxjZ4tLSPCjUfBdFKT5l6r7ugoOKcO5t82KOvnH+0zT59vDZZ5m08AAAAFC51vP8AXZruZa6pVHBdShpT/lb7zb6DHyaekfT+VRmtzXmU15HcPUbSvcSW+UlSj2RSnLTtco/slPx3N4q4/wBUrR16TZYpQJoAAAAAFf8AK/h6qYXRuIrfCew37M1r96K/aZe8DzbXtj9ev2Q9XXwxZVRpkAAAAAAAAAAAAAAAAPet4E6ydygSwyMaONbVSkt0Z8ZwXQ16UfFdfApdfwmuXx4ulv2n+krDqZr0t2WpZXlO/tlUspxnB8JReq/96jM5MV8duW8bSn1tFo3h7nh6AMriB854t+d6+v6ap/Ekb/D+XX2j+FNf5p91uclaXxQjp+kqa9u1/TQy3Gv+z+kLDS/lpeVKSAAAAABFeU/T4mVdfWpadvlYFpwff8VHtP8ACPqvy1KGvVgAAAAAAAAAAAAAAAAAbuFYtXwi428NqSpvn04S+lF7n3o45tPjzRtkru9Uvas9JTvCOVNxSWM0NfbpPT/rk/3S7ilz8DieuK33S6az/wBQlVlnqwu1uuIwfRUUoeMlp4lZk4Xqaf47+3V3jUY583WpYzbVlrSuKD7KkH+JGnS5o70n7OnxK+qi80xhHMlz/ppKUfKzacXqnq9p6NdDbXcbTR7/AAKc0ddlVk2552T7kev1PD69CT3xmqiXsyiov3OH2kUXHMW165P0TNHbpNVhlCmAAAAAAQLlfv1SwelQi/OqVNpr2YL+6UPcXnA8Uzktk9I2+6Jq7eGIVOadXgAAAAAAAAAAAAAAAAAAAAMaagZA62VsalgGNQrQ1cV5tSK9KD+cu3g11xRF1mmjUYpp9vd0xX5Lbr7tq8bq3jUt2pRlFSi1wcWtU/czEXpNLTW3eFtE7xu9Dy+gAAB+K9aNtQlO4koxinKTe5JJattnqlJvaK17y+TMR1lQ2bsceYMblVWqgvMpp80Frpqulttvt05ja6HTRp8MU8/P3VOXJz23cYmOYAAAAAAAAAAAAAAAAAAAADcwrC62L3Xk8NpynLi9OCXTKT3JdpyzZ8eGvNedoeq0m07QmVtyV3E6etzXowfQoyn4+aVF+O4onw1mf2SY0dvOWvdcmN5TqpW86E1621KOnbFp+Gp1pxrTzG9omHmdJdZdlCnlrLtOF9UioUacYSnLcm0kvF8EZ3JzarPM0jrMp0bY6RvPZ7YVjFDF6beG1YVNOKT3rti9670eM2my4Z8dZh9rkrbtLeOD2AaOL4xQwa328SqRguZP50uqMFvb7Ed8Gmy5p2pG7xfJWkbzKo8550nmF+Ttk6dBPXZ9KbXBz05uiPfv3aanQcNrp/Fbrb+PZX5s836R2RQs0cAAAAAAAAAAAAAAAAAAAAB6W9GVzcRp0FrKclGK6ZSail72jze0UrNp7Q+xG87Qv3LmB08AwuNG1S14zlzznzyf4LmRh9XqrajJNrdvL2W2PHFI2h1CM6AEG5XqcpZdpuGuzGunLvhNR8WveXXA5iM8xPfZF1fyKlp1HSqKVFuMlwcW012Nb0aiaxMbTCuiduzuW+c7+2jpTuqjXtKE/GcW/Eh34dprd6Q6xnyR5lxnS/uI6TuqiXsqEPGMU/EU4dpq9qQTnyT5uHVqyr1XKvKUpPjKTcm+1veTK1isbVjZymd+78n0AAAAAAAAAAAAAAAAAAAAAAO9kNJ5ytdvhtv3qnNx8dCFxHf8Lfb0dcG3xI3XuYlbAACOcokYyyZceV6INdvlYbPjoWHC5n8VXZw1H5cqNNmqwAAAAAAAAAAAAAAAAAAAAAAAAAAPayupWN5Crb/OhOM49sWmk+rceMlIvSaz5w+xMxO8PoLBsUp4zhsK1m9YyW9c8Zc8X1ow2owWwZJpZb0vF43hunB7AK35Wcei6MbK3actVOrpzJb4QfW3pLuXSaHgukmJnNb2hB1eSPlhWRokIAAAAAAAAAAAAAAAAAAAAAAAAAAAB1MBx+vgFy54dPRP50Jb4S7Y9PWtGRtTpMWorteP7e6ZLUneE5tuVaPk/wArtZa+xNNe6SWniU1uBdfDfp9YSo1nrDm4zym17uk44ZTjRT9Nvbn3bkk+5kjT8FxUnfJPN/DxfVWmNq9EFnJzm3Ubbb1bbbbb3ttviy5iIiNoRZndg+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//9k=	2026-04-23 14:34:24.145+00
4	logo_small_url		2026-04-23 14:34:24.149+00
5	primary_color	#f7ca31	2026-04-23 14:34:24.152+00
6	secondary_color	#000000	2026-04-23 14:34:24.155+00
7	favicon_url		2026-04-23 14:34:24.159+00
8	footer_text		2026-04-23 14:34:24.162+00
9	date_format	DD/MM/YYYY	2026-04-23 14:34:24.165+00
10	timezone	America/Sao_Paulo	2026-04-23 14:34:24.168+00
11	login_message	Bem-vindo ao sistema de gestão operacional.	2026-04-23 14:34:24.172+00
12	whatsapp_button	open	2026-04-23 14:34:24.174+00
13	language	pt-BR	2026-04-23 14:34:24.178+00
14	dark_mode	disabled	2026-04-23 14:34:24.18+00
\.


--
-- Data for Name: checkout_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checkout_items (id, checkout_id, equipment_id, quantity, condition_out, notes) FROM stdin;
3	2	4	1		
4	2	5	2		
5	2	2	1		
6	2	6	1		
\.


--
-- Data for Name: checkouts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checkouts (id, shoot_id, delivered_by, reviewed_by, received_by, checkout_at, created_at) FROM stdin;
2	2	Carlos Mendes	Carlos Mendes	Carlos Mendes	2026-04-23 16:37:29.177+00	2026-04-23 16:37:29.189238+00
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment (id, name, category, internal_code, total_quantity, available_quantity, status, storage_location, notes, image_url, active, created_at, updated_at) FROM stdin;
7	LED Panel Aputure 300D	luz	LUZ-001	4	4	available	Sala de Luzes	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 08:36:15.112501+00
8	LED Godox SL-60W	luz	LUZ-002	6	5	maintenance	Sala de Luzes	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 08:36:15.112501+00
9	Tripé Manfrotto 504X	tripé	TRP-001	3	3	available	Sala de Equipamentos - Prateleira D	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 08:36:15.112501+00
11	Cartão SD SanDisk 256GB	cartão de memória	MEM-001	8	8	available	Carregadores - Gaveta 2	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 08:36:15.112501+00
12	DJI Mavic 3 Pro	drone	DRO-001	1	1	available	Sala de Equipamentos - Cofre	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 08:36:15.112501+00
13	Monitor SmallHD 702	maquinaria	MAQ-001	2	2	available	Sala de Equipamentos - Prateleira E	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 08:36:15.112501+00
14	Slider Edelkrone	acessórios	ACE-001	1	1	available	Sala de Equipamentos - Prateleira F	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 08:36:15.112501+00
10	Bateria Sony NP-FZ100	bateria	BAT-001	10	10	available			\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 09:14:16.617+00
4	Lente Sony 85mm f/1.8	lente	LEN-002	1	1	pending_return	Sala de Equipamentos - Prateleira B	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 16:40:35.096+00
1	Sony FX3	câmera	CAM-001	2	2	available	Sala de Equipamentos - Prateleira A	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 16:41:29.408+00
3	Lente Sony 24-70mm f/2.8	lente	LEN-001	2	2	available	Sala de Equipamentos - Prateleira B	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 16:41:29.412+00
5	Microfone Rode NTG-4	áudio	AUD-001	3	3	available	Sala de Equipamentos - Prateleira C	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 16:41:29.416+00
2	Sony A7S III	câmera	CAM-002	1	1	available	Sala de Equipamentos - Prateleira A	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 16:41:29.419+00
6	Gravador Zoom H6	áudio	AUD-002	2	2	available	Sala de Equipamentos - Prateleira C	\N	\N	t	2026-04-23 08:36:15.112501+00	2026-04-23 16:41:29.422+00
17	BlackMagic 4k	câmera		2	2	available			\N	t	2026-04-23 19:20:09.921631+00	2026-04-23 19:20:09.921631+00
18	BlackMagic 4k	câmera		1	1	available			\N	t	2026-04-23 20:08:46.530794+00	2026-04-23 20:08:46.530794+00
19	Teste Câmera	câmera	NGB-0001	1	1	available			\N	t	2026-04-23 23:44:44.738244+00	2026-04-23 23:44:44.738244+00
\.


--
-- Data for Name: equipment_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment_links (id, equipment_id, linked_equipment_id, default_quantity, required, notes, created_at, updated_at) FROM stdin;
1	10	11	2	t	Verificar carga antes	2026-04-23 09:35:09.270192+00	2026-04-23 09:35:09.270192+00
2	1	5	1	t	Sempre verificar bateria do microfone	2026-04-23 09:38:41.095943+00	2026-04-23 09:38:41.095943+00
3	1	3	1	f	Lente padrão para filmagens	2026-04-23 09:38:41.095943+00	2026-04-23 09:38:41.095943+00
4	18	11	1	f	\N	2026-04-23 20:09:01.760553+00	2026-04-23 20:09:01.760553+00
5	17	12	1	f	\N	2026-04-23 21:05:24.064904+00	2026-04-23 21:05:24.064904+00
6	17	4	1	t	\N	2026-04-23 21:05:42.540672+00	2026-04-23 21:05:42.540672+00
7	2	11	1	f	\N	2026-04-23 21:07:51.451092+00	2026-04-23 21:07:51.451092+00
\.


--
-- Data for Name: return_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.return_items (id, return_id, equipment_id, quantity_sent, quantity_returned, condition_return, notes, has_damage) FROM stdin;
1	1	4	1	0			f
2	1	5	2	2			f
3	1	2	1	1			f
4	1	6	1	1			f
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.returns (id, shoot_id, returned_by, reviewed_by, received_by, has_pendencies, return_at, created_at) FROM stdin;
1	2	Teste Devolvido	Teste Recebido	Teste Recebido	t	2026-04-23 16:40:35.054+00	2026-04-23 16:40:35.064052+00
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
YgDynPNhYlZ_dfUBnW_0OadTXqoN8O5a	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T19:02:32.930Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 19:04:28
GABKP-W5gIDXx_Xbx2dV14O3P5NJ9Zdh	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T19:28:38.776Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 19:29:38
GXLG2hFK0k1kxOl-dTmoVybQleG6faax	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T18:48:03.315Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 18:49:42
ue4cL_hZgxToQgTU0bA0iSG1zpnVMfJd	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T19:06:05.004Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 19:07:36
RA-g9ccbZZtCuHTe8EGMVhgVTPQr6gta	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T17:08:58.168Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":false}}	2026-04-30 17:10:10
kgjJpOHPirHEmugn541Ju5hmkLCzc7VE	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T21:13:48.863Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 21:16:13
Xvax775RU7zsZDQHaGY7vIDQ5ON9UulG	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T17:13:32.437Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 17:14:37
BRxSAJHcRIWDgNaWOxohXtLZyx32wVRa	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T17:18:33.653Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 17:19:57
2uuWDGPF4dgf-vZAmD2na-s54T2eTQs8	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T18:53:43.335Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 18:55:18
yM2YLYKsjYNThng-JubZKG9WCXIu6GpA	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T18:59:22.795Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 19:00:16
6c5kQWC8gBXAjW_REf0oR8TcLli2sKak	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T21:08:20.839Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 21:09:35
5CTPEnmgwKoZJfiFCW59RMDT0rsO6ZiF	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T23:35:57.035Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 23:37:13
yLYmwwCErtf4-4UjKkTGiqDtLMzy31Pc	{"cookie":{"originalMaxAge":604800000,"expires":"2026-05-01T00:03:19.835Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-05-04 23:53:14
6YB65PktC4zWfW9v0jweuWO7jueQPKMQ	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T19:23:41.392Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 19:24:41
9g76H3gEjQbIbwYRHBOSgLpsGqNHLQbU	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T19:10:31.806Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 19:13:02
vFETY2nlWPx_yN84OegLuN0-U4SQa3Zr	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T23:44:04.170Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 23:45:13
asdVORkyc9rCPrGWUz16NXCDnOTmeteF	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T19:25:27.382Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 19:26:52
JohtgftW1I2NWXok-7PvwoG5EBIukzJ5	{"cookie":{"originalMaxAge":604800000,"expires":"2026-04-30T20:14:51.786Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"name":"Administrador","email":"admin@nagibe.com.br","login":"admin","profile":"administrador","avatarUrl":null,"isProducer":true}}	2026-04-30 20:16:08
\.


--
-- Data for Name: shoot_equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shoot_equipment (id, shoot_id, equipment_id, quantity, notes, condition_out, created_at, is_linked_item, parent_shoot_equipment_id) FROM stdin;
4	1	9	1	Tripé para entrevistas	\N	2026-04-23 08:36:54.151105+00	f	\N
5	1	10	4	\N	\N	2026-04-23 08:36:54.151105+00	f	\N
6	1	11	2	\N	\N	2026-04-23 08:36:54.151105+00	f	\N
10	2	6	1	\N	\N	2026-04-23 08:36:54.151105+00	f	\N
11	3	1	1	Câmera externa	\N	2026-04-23 08:36:54.151105+00	f	\N
12	3	12	1	Drone para aéreas	\N	2026-04-23 08:36:54.151105+00	f	\N
13	3	11	1	\N	\N	2026-04-23 09:35:40.449606+00	f	\N
14	1	1	1	\N	\N	2026-04-23 09:40:27.259414+00	f	\N
15	1	5	1	\N	\N	2026-04-23 09:40:27.327287+00	t	14
16	1	3	1	\N	\N	2026-04-23 09:40:39.671759+00	t	14
17	3	2	1	\N	\N	2026-04-23 13:23:02.870536+00	f	\N
29	8	2	1	\N	\N	2026-04-23 18:47:15.216805+00	f	\N
30	9	2	1	\N	\N	2026-04-23 19:19:14.655095+00	f	\N
32	12	1	1	\N	\N	2026-04-23 19:26:07.79954+00	f	\N
33	12	3	1	\N	\N	2026-04-23 19:26:16.500595+00	t	32
34	12	5	1	\N	\N	2026-04-23 19:26:16.537031+00	t	32
35	12	1	1	\N	\N	2026-04-23 19:26:40.328305+00	f	\N
36	13	1	1	\N	\N	2026-04-23 19:29:21.357233+00	f	\N
37	13	3	1	\N	\N	2026-04-23 19:29:27.726098+00	t	36
38	13	5	1	\N	\N	2026-04-23 19:29:27.758381+00	t	36
43	2	1	1	\N	\N	2026-04-23 21:08:37.335788+00	f	\N
44	2	3	1	\N	\N	2026-04-23 21:08:43.318069+00	t	43
45	2	5	1	\N	\N	2026-04-23 21:08:43.59325+00	t	43
47	5	1	1	\N	\N	2026-04-23 21:13:06.267725+00	f	\N
48	2	10	1	\N	\N	2026-04-23 23:37:02.424006+00	f	\N
49	5	18	1	\N	\N	2026-04-23 23:38:19.766303+00	f	\N
50	5	11	1	\N	\N	2026-04-23 23:38:22.176266+00	t	49
\.


--
-- Data for Name: shoot_team; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shoot_team (id, shoot_id, team_member_id, role, confirmed, created_at, travel_diarias) FROM stdin;
2	1	2	Produtora	t	2026-04-23 08:36:50.08801+00	0
3	1	3	Cinegrafista	t	2026-04-23 08:36:50.08801+00	0
9	3	6	Operadora de Drone	f	2026-04-23 08:36:50.08801+00	0
10	3	3	Cinegrafista	f	2026-04-23 08:36:50.08801+00	0
12	3	1	Diretor	f	2026-04-23 10:11:05.495046+00	0
8	3	1	Diretor	f	2026-04-23 08:36:50.08801+00	0
15	8	8	Social Media	f	2026-04-23 18:46:47.763495+00	2
16	8	2	Apoio de Produção	f	2026-04-23 18:46:56.604574+00	2
17	9	8	Motorista	f	2026-04-23 19:19:02.684483+00	1
21	5	9	Operador de Drone	f	2026-04-23 21:10:52.893494+00	0
23	5	7	Editor	f	2026-04-23 23:38:13.820621+00	0
24	10	1	Diretor	f	2026-04-23 23:48:44.381265+00	0
\.


--
-- Data for Name: shoots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shoots (id, date, "time", location, briefing, whatsapp_summary, producer_name, client_project, priority, status, created_at, updated_at, has_travel, end_date, schedule_changed_at, title) FROM stdin;
4	2026-04-22	09:00	Shopping Center Norte - São Paulo	Captação de produto para campanha de verão. 5 looks diferentes.	Campanha Verão - 5 looks	Fernanda Costa	Campanha Moda Verão	medium	closed	2026-04-23 08:36:31.25803+00	2026-04-23 08:36:31.25803+00	f	\N	\N	\N
11	2026-04-23		Estúdio Teste			Administrador		medium	planned	2026-04-23 19:12:51.206756+00	2026-04-23 19:12:51.206756+00	f	\N	\N	Teste Produtor Padrão 2
1	2026-04-23	08:00	Sede da Empresa ABC - São Paulo	Captação institucional para vídeo de apresentação da empresa. Foco nos espaços, equipe e produtos.	Institucional ABC - Captação no escritório central	Fernanda Costa	Vídeo Institucional ABC	high	team_defined	2026-04-23 08:36:31.25803+00	2026-04-23 10:13:00.613+00	t	\N	\N	\N
5	2026-04-24	16:13	Estúdio Teste Período			Administrador	Clécio Luiz	medium	planned	2026-04-23 10:21:49.451673+00	2026-04-23 19:18:10.957+00	f	2026-04-28	2026-04-23 19:18:10.957+00	Gravação em estúdio - Mais visão
9	2026-04-23		Estúdio Central			Administrador		medium	planned	2026-04-23 18:54:21.291415+00	2026-04-23 19:19:06.535+00	t	\N	\N	Gravação Comercial Banco ABC – Rio de Janeiro
12	2026-04-23		Estúdio			Administrador		medium	planned	2026-04-23 19:25:45.488315+00	2026-04-23 19:25:45.488315+00	f	\N	\N	Teste Vinculo
13	2026-04-23		Studio			Administrador		medium	planned	2026-04-23 19:28:58.252803+00	2026-04-23 19:28:58.252803+00	f	\N	\N	Vinculo Test
2	2026-04-24	14:00	Estúdio Nagibe - Pinheiros (Atualizado)	Gravação de entrevistas com diretores para série documental.	Entrevistas Doc - Série Diretores	Administrador	Aldeia LTDA	medium	return_pending	2026-04-23 08:36:31.25803+00	2026-04-23 21:09:20.901+00	t	2026-04-30	2026-04-23 21:09:20.901+00	Série Documental 2024
10	2026-04-28	12:00	Estúdio Teste			Administrador		medium	planned	2026-04-23 19:12:12.50861+00	2026-04-23 23:48:35.931+00	f	2026-04-30	2026-04-23 23:48:35.93+00	Estúdio Teste
8	2026-04-25	09:00	Calçoene			Administrador	Clécio Luiz	high	closed	2026-04-23 18:46:33.210839+00	2026-04-23 18:47:34.379+00	t	2026-04-26	\N	\N
3	2026-04-24	07:00	Praia de Santos - Santos	Captação externa ao nascer do sol. Drone e câmera principal. Vento previsto 15km/h.	Clip musical - Santos ao amanhecer	Carlos Mendes	Clip Musical - Banda Nova	urgent	cancelled	2026-04-23 08:36:31.25803+00	2026-04-23 19:07:02.787+00	t	\N	\N	\N
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, name, primary_role, secondary_role, phone, notes, avatar_url, status, created_at, updated_at, is_freelancer) FROM stdin;
1	Carlos Mendes	Diretor	\N	(11) 99999-1111	\N	\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 08:35:57.531674+00	f
2	Fernanda Costa	Produtora	\N	(11) 99999-2222	\N	\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 08:35:57.531674+00	f
3	Rafael Lima	Cinegrafista	2º Cinegrafista	(11) 99999-3333	\N	\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 08:35:57.531674+00	f
4	Julia Souza	Fotógrafa	\N	(11) 99999-4444	\N	\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 08:35:57.531674+00	f
5	Pedro Alves	Assistente de Câmera	\N	(11) 99999-5555	\N	\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 08:35:57.531674+00	f
7	Marcos Rocha	Editor	Social Media	(11) 99999-7777	\N	\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 08:35:57.531674+00	f
8	Beatriz Santos	Assistente de Maquinaria	\N	(11) 99999-8888	\N	\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 08:35:57.531674+00	f
9	Carlos Freela	Cinegrafista				\N	active	2026-04-23 14:28:31.869189+00	2026-04-23 14:29:52.775+00	f
6	Ana Paula	Operadora de Drone	none	(11) 99999-6666		\N	active	2026-04-23 08:35:57.531674+00	2026-04-23 16:59:11.356+00	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, login, password_hash, profile, avatar_url, phone, notes, status, last_login_at, created_at, updated_at, is_producer) FROM stdin;
1	Administrador	admin@nagibe.com.br	admin	$2b$10$cNbkI/uM2ewNyHIvS1i08Oat8RTU5za9omI0hNzMunx.qkWRSHve6	administrador	\N	\N	\N	active	2026-04-24 00:03:19.831+00	2026-04-23 08:48:59.851766+00	2026-04-24 00:03:19.832+00	t
\.


--
-- Data for Name: whatsapp_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.whatsapp_templates (id, template_key, name, content, updated_at) FROM stdin;
1	pauta	Espelho da Pauta	*{data} - {horario}*\n📍 {local}\n\n*Projeto:* {resumo}\n*Produtor(a):* {produtor}\n\n*Equipe:*\n{equipe}	2026-04-23 08:48:59.92605+00
2	equipamentos	Espelho dos Equipamentos	*Equipamentos - {data}*\n📍 {local}\n\n{equipamentos}\n\n*Entregue por:* {entregue_por}\n*Revisado por:* {revisado_por}	2026-04-23 08:48:59.928904+00
3	completo	Espelho Completo	*ESPELHO COMPLETO*\n\n*{data} - {horario}*\n📍 {local}\n\n*Projeto:* {resumo}\n*Produtor(a):* {produtor}\n\n*Equipe:*\n{equipe}\n\n*Equipamentos:*\n{equipamentos}\n\n*Entregue por:* {entregue_por}\n*Revisado por:* {revisado_por}\n*Recebido por:* {recebido_por}	2026-04-23 08:48:59.931474+00
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 115, true);


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 14, true);


--
-- Name: checkout_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checkout_items_id_seq', 6, true);


--
-- Name: checkouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checkouts_id_seq', 2, true);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipment_id_seq', 19, true);


--
-- Name: equipment_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipment_links_id_seq', 7, true);


--
-- Name: return_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.return_items_id_seq', 9, true);


--
-- Name: returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.returns_id_seq', 2, true);


--
-- Name: shoot_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shoot_equipment_id_seq', 50, true);


--
-- Name: shoot_team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shoot_team_id_seq', 24, true);


--
-- Name: shoots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shoots_id_seq', 13, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_members_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.whatsapp_templates_id_seq', 3, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_key_unique UNIQUE (key);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: checkout_items checkout_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_items
    ADD CONSTRAINT checkout_items_pkey PRIMARY KEY (id);


--
-- Name: checkouts checkouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkouts
    ADD CONSTRAINT checkouts_pkey PRIMARY KEY (id);


--
-- Name: equipment_links equipment_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_links
    ADD CONSTRAINT equipment_links_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: return_items return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_pkey PRIMARY KEY (id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: shoot_equipment shoot_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_equipment
    ADD CONSTRAINT shoot_equipment_pkey PRIMARY KEY (id);


--
-- Name: shoot_team shoot_team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_team
    ADD CONSTRAINT shoot_team_pkey PRIMARY KEY (id);


--
-- Name: shoots shoots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoots
    ADD CONSTRAINT shoots_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_login_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_unique UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_template_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_template_key_unique UNIQUE (template_key);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: checkout_items checkout_items_checkout_id_checkouts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_items
    ADD CONSTRAINT checkout_items_checkout_id_checkouts_id_fk FOREIGN KEY (checkout_id) REFERENCES public.checkouts(id) ON DELETE CASCADE;


--
-- Name: checkout_items checkout_items_equipment_id_equipment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkout_items
    ADD CONSTRAINT checkout_items_equipment_id_equipment_id_fk FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: checkouts checkouts_shoot_id_shoots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checkouts
    ADD CONSTRAINT checkouts_shoot_id_shoots_id_fk FOREIGN KEY (shoot_id) REFERENCES public.shoots(id) ON DELETE CASCADE;


--
-- Name: equipment_links equipment_links_equipment_id_equipment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_links
    ADD CONSTRAINT equipment_links_equipment_id_equipment_id_fk FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment_links equipment_links_linked_equipment_id_equipment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_links
    ADD CONSTRAINT equipment_links_linked_equipment_id_equipment_id_fk FOREIGN KEY (linked_equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: return_items return_items_equipment_id_equipment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_equipment_id_equipment_id_fk FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- Name: return_items return_items_return_id_returns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_return_id_returns_id_fk FOREIGN KEY (return_id) REFERENCES public.returns(id) ON DELETE CASCADE;


--
-- Name: returns returns_shoot_id_shoots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_shoot_id_shoots_id_fk FOREIGN KEY (shoot_id) REFERENCES public.shoots(id) ON DELETE CASCADE;


--
-- Name: shoot_equipment shoot_equipment_equipment_id_equipment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_equipment
    ADD CONSTRAINT shoot_equipment_equipment_id_equipment_id_fk FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: shoot_equipment shoot_equipment_shoot_id_shoots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_equipment
    ADD CONSTRAINT shoot_equipment_shoot_id_shoots_id_fk FOREIGN KEY (shoot_id) REFERENCES public.shoots(id) ON DELETE CASCADE;


--
-- Name: shoot_team shoot_team_shoot_id_shoots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_team
    ADD CONSTRAINT shoot_team_shoot_id_shoots_id_fk FOREIGN KEY (shoot_id) REFERENCES public.shoots(id) ON DELETE CASCADE;


--
-- Name: shoot_team shoot_team_team_member_id_team_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shoot_team
    ADD CONSTRAINT shoot_team_team_member_id_team_members_id_fk FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict eeHgmktXRgzTqzAD8S1qFDLxZlCnUazMS7Kf6rppgrNlBtj8utp3JwagAsjQL30

