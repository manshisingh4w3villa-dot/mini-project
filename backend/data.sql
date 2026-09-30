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

--
-- Data for Name: coworking_locations; Type: TABLE DATA; Schema: public; Owner: coworking_user
--

COPY public.coworking_locations (id, name, city, address, latitude, longitude, description, created_at) FROM stdin;
1	Skyline Hub	Bengaluru	MG Road, Bengaluru	12.975800	77.594600	Central business district coworking space	2026-09-17 10:54:34.278828+05:30
2	Capital Workspace	Delhi	Connaught Place, New Delhi	28.631500	77.216700	Premium coworking space in the heart of New Delhi	2026-09-18 14:57:57.132517+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: coworking_user
--

COPY public.users (id, email, first_name, last_name, password_hash, is_verified, verification_token, profile_picture_url, address, latitude, longitude, is_admin, plan_expires_at, created_at, updated_at, verification_token_expires_at, plan_status, plan_name, stripe_customer_id, stripe_subscription_id, pending_subscription_session_id, pending_subscription_plan) FROM stdin;
3	test1@gmail.com	Tester	One	$2b$12$bczFdAVjb09SWVlYqYZ83./iTIhhq6u5VmoYz/PZg8skdZLtzLCXO	t	\N	\N	\N	\N	\N	f	\N	2026-09-16 18:22:02.068303	2026-09-16 18:22:02.068303	\N	free	\N	\N	\N	\N	\N
4	location.tester@example.com	Location	Tester	$2b$12$g0xyReAIFiPJXISzF0bVAePcJ04W1IY1eMBppwvF.nZM6o3XtPV2.	t	\N	\N	\N	\N	\N	f	\N	2026-09-17 10:55:37.403819	2026-09-17 10:55:37.403819	\N	free	\N	\N	\N	\N	\N
5	profile.owner@example.com	Profile	Owner	$2b$12$.nnfboDaN0g8iEYsbquh7.S3Fmg7mq6pU708idWFNtX8vx7eYrx7.	t	\N	\N	MG Road, Bengaluru	12.975800	77.594600	f	\N	2026-09-17 11:11:44.321906	2026-09-17 11:11:44.631285	\N	free	\N	\N	\N	\N	\N
2	local-test-1789560649@example.com	Local	Tester	$2b$12$5EYcADw5yuMHhNF4DBHUy.3sTAlhH2/Bl07tu4AJJtShSxqQPnMXG	t	\N	https://res.cloudinary.com/sxf5cq0y/image/upload/v1789638642/nook/profile-images/user-2.png	Koramangala, Bengaluru	12.935200	77.624500	f	\N	2026-09-16 17:40:49.660075	2026-09-17 15:20:43.465661	\N	free	\N	\N	\N	\N	\N
6	site.admin@example.com	Site	Admin	$2b$12$2zvoMI.OCBo85MQ1y3Hgw.oS2F6cMzIKDlQv/cTr2Cq8zAXcoxcbG	t	\N	https://res.cloudinary.com/sxf5cq0y/image/upload/v1789716265/nook/profile-images/user-6.jpg	Ground Floor, Metro Station Botanical Garden, Botanical Garden, Sector 38, Noida, Uttar Pradesh 201303, India	28.563465	77.334643	t	\N	2026-09-18 10:45:24.804442	2026-09-25 18:26:54.941998	\N	free	\N	\N	\N	cs_test_b1ULEv1ej3eIG6Sxq2mnMSl4YzQTQRrukHCrQR1uATG0rstIS1X6L7oyGA	gold
1	test@gmail.com	Test	User	$2b$12$.6Z/cnQjM4/K6O7fTiLYpOvK5mjcK5/nA9KaHP.gwEaHuO/p8bxfe	f	7ed3ade8e602fc4e503cd3eb09213f662172e2bcedc1ec6ca5d690a060d483e3	https://res.cloudinary.com/sxf5cq0y/image/upload/v1789707548/nook/profile-images/user-1.png	Sector 59 Noida	0.000000	0.000000	f	2026-10-21 16:24:06	2026-09-16 16:20:28.279604	2026-09-21 16:35:27.23229	2026-09-24 11:46:29.960576+05:30	active	gold	cus_VIgDvfFa9clX33	sub_1UI4rL2KKtl1xlYrvduirVoi	\N	\N
7	jenny@yopmail.com	Ruby	Jenny	$2b$12$c7Ssl3Lzw0AYA7L2MjxCVeUm2acwEkG/A4YmDmD41E5JSecSoF3oW	t	\N	\N	\N	\N	\N	f	\N	2026-09-18 15:24:03.735045	2026-09-18 15:24:03.735045	\N	free	\N	\N	\N	\N	\N
18	user1@example.com	Alice	Kumar	$2b$12$dDivEIzk2YQ8nEiKYC/ZnefNNqZ0mPvZG.07t9gX.67/opuhgtDti	t	\N	\N	\N	\N	\N	f	\N	2026-09-29 16:28:32.757429	2026-09-29 16:28:40.826003	\N	free	\N	\N	\N	\N	\N
19	user2@example.com	Blushy	Rani	$2b$12$xb2nJS9QE7CToVW59Km.VuPPy4UDu.EHEOnS6wEWbl8vo3q1oQvBa	t	\N	\N	\N	\N	\N	f	\N	2026-09-29 16:30:56.911536	2026-09-29 16:31:00.025264	\N	free	\N	\N	\N	\N	\N
10	yanagujral11@gmail.com	Yana	Cutu	$2b$12$4oUQ4UswkF1ySO9wVupGOO7RPgvUSrBWlhMWM.ykrc7gl.CY/uUZu	t	\N	\N	\N	\N	\N	f	2026-10-25 12:36:50	2026-09-23 12:02:36.890453	2026-09-25 12:37:11.572776	\N	active	gold	cus_VK7S66ZgFlfJP2	sub_1UJTDc2KKtl1xlYraAr7oqYu	\N	\N
17	manshi.singh@w3villa.com	Manshi	Singh	\N	t	\N	https://res.cloudinary.com/sxf5cq0y/image/upload/v1790231540/nook/profile-images/user-17.jpg	Janakpuri, New Delhi, Delhi, India	28.621899	77.087838	f	2026-10-24 15:10:55	2026-09-24 11:54:04.038422	2026-09-25 13:07:04.553929	\N	active	silver	cus_VJmisEOY5WUna0	sub_1UJ99B2KKtl1xlYrmKqVW0LP	\N	\N
\.


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: coworking_user
--

COPY public.workspaces (id, location_id, name, type, capacity, price_per_day, is_available, created_at, price_per_hour) FROM stdin;
2	1	Private Office 1	private-office	4	3200.00	t	2026-09-17 10:54:34.285293+05:30	400.00
1	1	Hot Desk A	desk	1	900.00	t	2026-09-17 10:54:34.281197+05:30	112.50
3	2	Delhi Desk 01	desk	1	450.00	t	2026-09-18 14:58:12.863214+05:30	56.25
4	2	Delhi Desk 02	desk	1	450.00	t	2026-09-18 14:58:12.863214+05:30	56.25
5	2	Delhi Desk 03	desk	1	450.00	t	2026-09-18 14:58:12.863214+05:30	56.25
6	2	Delhi Desk 04	desk	1	450.00	t	2026-09-18 14:58:12.863214+05:30	56.25
7	2	Delhi Private Office 01	private-office	4	2200.00	t	2026-09-18 14:58:12.863214+05:30	275.00
8	2	Delhi Private Office 02	private-office	6	3200.00	t	2026-09-18 14:58:12.863214+05:30	400.00
9	2	Delhi Meeting Room A	meeting-room	6	1400.00	t	2026-09-18 14:58:12.863214+05:30	175.00
10	2	Delhi Meeting Room B	meeting-room	10	1900.00	t	2026-09-18 14:58:12.863214+05:30	237.50
11	2	Delhi Event Space	event-space	50	4500.00	t	2026-09-18 14:58:12.863214+05:30	562.50
12	1	Desk 01	desk	1	500.00	t	2026-09-18 15:02:17.056142+05:30	62.50
13	1	Desk 02	desk	1	500.00	t	2026-09-18 15:02:17.056142+05:30	62.50
14	1	Desk 03	desk	1	500.00	t	2026-09-18 15:02:17.056142+05:30	62.50
15	1	Desk 04	desk	1	500.00	t	2026-09-18 15:02:17.056142+05:30	62.50
16	1	Private Office 01	private-office	4	2500.00	t	2026-09-18 15:02:17.056142+05:30	312.50
17	1	Private Office 02	private-office	6	3500.00	t	2026-09-18 15:02:17.056142+05:30	437.50
18	1	Meeting Room A	meeting-room	6	1500.00	t	2026-09-18 15:02:17.056142+05:30	187.50
19	1	Meeting Room B	meeting-room	10	2000.00	t	2026-09-18 15:02:17.056142+05:30	250.00
20	1	Event Space	event-space	50	5000.00	t	2026-09-18 15:02:17.056142+05:30	625.00
21	1	Desk 01	desk	1	500.00	t	2026-09-18 15:03:11.169557+05:30	62.50
22	1	Desk 02	desk	1	500.00	t	2026-09-18 15:03:11.169557+05:30	62.50
23	1	Desk 03	desk	1	500.00	t	2026-09-18 15:03:11.169557+05:30	62.50
24	1	Desk 04	desk	1	500.00	t	2026-09-18 15:03:11.169557+05:30	62.50
25	1	Private Office 01	private-office	4	2500.00	t	2026-09-18 15:03:11.169557+05:30	312.50
26	1	Private Office 02	private-office	6	3500.00	t	2026-09-18 15:03:11.169557+05:30	437.50
27	1	Meeting Room A	meeting-room	6	1500.00	t	2026-09-18 15:03:11.169557+05:30	187.50
28	1	Meeting Room B	meeting-room	10	2000.00	t	2026-09-18 15:03:11.169557+05:30	250.00
29	1	Event Space	event-space	50	5000.00	t	2026-09-18 15:03:11.169557+05:30	625.00
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: coworking_user
--

COPY public.bookings (id, user_id, workspace_id, booking_date, start_time, end_time, status, total_amount, created_at, updated_at, hours, hourly_rate, subscription_id, payment_status, stripe_checkout_session_id) FROM stdin;
3	5	1	2026-09-16	08:00:00	09:00:00	completed	799.00	2026-09-17 16:20:13.095296+05:30	2026-09-17 16:20:13.118736+05:30	\N	\N	\N	not_required	\N
4	1	1	2026-09-18	11:00:00	12:00:00	completed	799.00	2026-09-18 10:40:49.928491+05:30	2026-09-18 12:00:17.151727+05:30	\N	\N	\N	not_required	\N
5	6	4	2026-09-19	09:00:00	10:00:00	completed	450.00	2026-09-18 15:04:50.658904+05:30	2026-09-19 10:42:22.793565+05:30	\N	\N	\N	not_required	\N
9	1	11	2026-09-22	09:00:00	11:00:00	completed	1125.00	2026-09-21 16:31:15.674055+05:30	2026-09-23 10:33:05.079112+05:30	2.00	562.50	\N	paid	cs_test_a1PnoPDayMWBPLTwcm8tZOVXyffmhqX8rGYpLzg4dytoio6uWy6ubNQiVP
13	17	6	2026-09-24	12:00:00	14:00:00	completed	112.50	2026-09-24 12:27:21.807834+05:30	2026-09-24 14:43:13.720097+05:30	2.00	56.25	\N	paid	cs_test_a1gxnGHER3jEUo8IBQ8HFK6nZsVTWq3evUN8bMbC4spDfWgiPwQdAEmD9K
7	7	9	2026-09-24	09:00:00	15:00:00	completed	1050.00	2026-09-18 15:42:08.303311+05:30	2026-09-24 15:02:10.509185+05:30	\N	\N	\N	not_required	\N
14	17	6	2026-09-24	09:00:00	11:00:00	completed	95.62	2026-09-24 15:19:15.374139+05:30	2026-09-24 15:19:56.786457+05:30	2.00	47.81	\N	paid	cs_test_a1wjtePMhKMCGysq9wQr7Sa3zkeqXfL314cy5jKvEOhbKJJXMWTIsgkRsy
8	1	4	2026-09-24	09:00:00	17:00:00	completed	450.00	2026-09-21 16:31:15.170608+05:30	2026-09-24 17:00:14.861594+05:30	8.00	56.25	\N	paid	cs_test_a1GOKzajAozi9PXdRfaLry4Q2SJoySYKI1JQSA8YdnVTZKysCNXcnj1S8E
15	6	11	2026-09-24	09:00:00	17:00:00	completed	4500.00	2026-09-24 15:21:08.584266+05:30	2026-09-24 17:00:14.861594+05:30	8.00	562.50	\N	paid	cs_test_a1ck0RcUBhgBgIULDzMwXbrgq1NnXGpdmllXu7OWbT58cICP04QqCfEXvT
16	10	3	2026-09-25	09:00:00	12:00:00	completed	118.14	2026-09-25 12:39:02.142828+05:30	2026-09-25 12:39:13.210844+05:30	3.00	39.38	\N	paid	cs_test_a1kzrjehIYssnnUMQmmjjbZ2XGxeG2qoofIKdhNevS1gFkGPRPmb2mZCJN
1	5	1	2026-09-25	09:00:00	17:00:00	completed	799.00	2026-09-17 15:32:36.452579+05:30	2026-09-25 17:00:08.240288+05:30	\N	\N	\N	not_required	\N
17	17	4	2026-09-25	09:00:00	17:00:00	completed	382.48	2026-09-25 12:52:40.056967+05:30	2026-09-25 17:00:08.240288+05:30	8.00	47.81	\N	paid	cs_test_a1Rhy2XHPHbCCPVDNKiLonVdANqe4cAUWVt2tk9ynhndXYBCi2WP63tIgp
2	5	1	2026-09-26	10:00:00	12:00:00	completed	799.00	2026-09-17 15:36:55.897383+05:30	2026-09-26 13:07:57.32813+05:30	\N	\N	\N	not_required	\N
18	17	3	2026-09-28	09:00:00	11:00:00	completed	95.62	2026-09-28 17:59:50.979168+05:30	2026-09-28 18:00:04.650384+05:30	2.00	47.81	\N	paid	cs_test_a1BbFv9HJW5IHYdPP7TCRJJjZWWvr38WeFhuhhRtro0ByqTTImXH3KYbMi
19	6	14	2026-09-28	14:00:00	17:00:00	completed	187.50	2026-09-28 18:15:53.976003+05:30	2026-09-28 18:16:05.267273+05:30	3.00	62.50	\N	paid	cs_test_a1tVzQnrhk02eIHNuYVAiWBzxcEWITPVITd5DBbJNj7jYtsR6ZDGBh2m6v
20	6	21	2026-09-30	15:00:00	17:00:00	booked	125.00	2026-09-28 18:17:22.029431+05:30	2026-09-28 18:17:22.029431+05:30	2.00	62.50	\N	paid	cs_test_a1e1TCSVVVQSoCjJASIIUR6HKwdAahv1DlJNXmlSqmpJqkwLHgrRnKM3xc
21	17	3	2026-09-29	16:00:00	17:00:00	completed	47.81	2026-09-29 16:23:11.29295+05:30	2026-09-29 17:00:42.211993+05:30	1.00	47.81	\N	paid	cs_test_a1hPPbzyr6YjuesMM8OBFOZmdB8cNmjFwtKUpo9OaJ5Vyn1PsftpbLlV6I
6	6	9	2026-09-30	09:00:00	10:00:00	completed	1400.00	2026-09-18 15:05:08.706718+05:30	2026-09-30 10:06:47.602899+05:30	\N	\N	\N	not_required	\N
\.


--
-- Data for Name: user_social_accounts; Type: TABLE DATA; Schema: public; Owner: coworking_user
--

COPY public.user_social_accounts (id, user_id, provider, provider_subject, created_at, updated_at) FROM stdin;
3	17	google	108722915479250518417	2026-09-24 11:54:04.038422+05:30	2026-09-24 11:54:04.038422+05:30
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coworking_user
--

SELECT pg_catalog.setval('public.bookings_id_seq', 21, true);


--
-- Name: coworking_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coworking_user
--

SELECT pg_catalog.setval('public.coworking_locations_id_seq', 2, true);


--
-- Name: user_social_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coworking_user
--

SELECT pg_catalog.setval('public.user_social_accounts_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coworking_user
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- Name: workspaces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: coworking_user
--

SELECT pg_catalog.setval('public.workspaces_id_seq', 29, true);


--
-- PostgreSQL database dump complete
--

