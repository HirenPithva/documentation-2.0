ALTER PROCEDURE [dbo].[p_report_charge_record_va]
	@charge_list_id AS INT
AS
--RMP 09/02/21 PI-703, Modified the query to get the vcc code value, Modified the join to get the vcc code value. Also commented the join charges_newport as it's no longer needed
BEGIN
SET NOCOUNT ON;
	
	DECLARE @str_sql NVARCHAR(MAX)

SELECT
	a.booking_number AS [Booking Number]
   ,i.criminal_history_number AS [Criminal History Number]
   ,a.sequence_number AS [Sequence Number]
   ,a.finger_print_number AS [Finger Print Number]
   ,dbo.fn_date(cl.court_date) AS [Court Date]
   ,cl.bail_amount AS [Bail Amount]
   ,dbo.fn_date(cl.release_date) AS [Release Date]
   ,dbo.f_full_name(sec.lastname, sec.firstname, sec.middlename, NULL) AS [Release Officer]
   ,sec.badge AS [RO Badge]
   ,cl.release_comments AS [Release Comments]
   ,dbo.fn_date(cl.sent_start_date) AS [Sentence Start Date]
   ,dbo.f_get_time(cl.sent_start_date) AS [Sentence Start Time]
   ,cl.days_suspended AS [Days Suspended]
   ,cl.good_time AS [Good Time]
   ,cl.other_time AS [Trustee Time]
   ,cl.weekend_holiday AS [Work Time]
   ,cl.time_served AS [Time Served to Date]
   ,dbo.fn_date(cl.sent_expire_date) AS [Sentence Expires]
   ,dbo.fn_date(cl.max_rel_date) AS MaximumRelDate
   ,dbo.f_get_time(cl.max_rel_date) AS MaximumRelTime
   ,cl.charge_comments AS [Charge Comments]
   ,cl.sent_comments AS [Sentence Comments]
   ,dbo.f_get_time(cl.court_date) AS [Court Time]
   ,dbo.f_get_time(cl.release_date) AS [Release Time]
   ,CLTotalTimeServed =
	CASE
		WHEN cl.is_released = 1 THEN DATEDIFF(DAY, cl.charge_date, cl.release_date) + 1
		ELSE DATEDIFF(DAY, cl.charge_date, GETDATE()) + 1
	END
   ,cl.special_rel_req AS [Special release Requirements]
   ,cl.history_number AS [History Number]
   ,dbo.fn_date(cl.charge_date) AS [Charge Date]
   ,cl.other_reason
	AS [OtherOutDateDay Comments]
   ,cl.out_calc_comments AS [OutDate Comments]
   ,cvt.description AS Description
   ,ch.title_sect AS [Title/Sect]
   ,ch.degree AS DegreeCharge
   ,ch.description AS [Charge Description]
   ,st.type
	AS [Sentence Type]
   ,b2.description AS [Bail Types.Bail Type]
   ,ct.court AS Courts
   ,j.judge AS Judges
   ,chrr.reason AS [Release Reason]
   ,i.last_name AS [Last Name]
   ,i.first_name AS [First Name]
   ,i.middle_name AS [Middle Name]
   ,i.suffix AS Suffix
   ,jr.jail_name AS [Jail Name]
   ,cl.id
   ,CASE b1.description
		WHEN 'No Bail' THEN 'No Bond'
		ELSE b1.description
	END AS [Bail Types_1.Bail Type]
   ,cl.bond_amount AS BondAmount
   ,CASE
		WHEN ch.is_attempted = 1 THEN 'A'
		ELSE ''
	END AS Attempted
   ,cl.days_remaining_to_serve AS [Time To Serve]
   ,cl.charge_number AS [Charge Number]
   ,dbo.fn_date(cl.edited_date) AS [Revision Date]
   ,dbo.f_get_time(cl.edited_date) AS [Revision Time]
   ,dbo.f_get_time(cl.sent_expire_date) AS [Sentence Expires Time]
   ,CONVERT(INT, ISNULL(cl.sent_length_days, 0)) + CONVERT(INT, (ISNULL(cl.sent_length_hours, 0) / 24)) + CONVERT(INT, ((ISNULL(cl.sent_length_months, 0)) * (30)) + (CONVERT(INT, (ISNULL(cl.sent_length_months, 0)) / (2)))) +
	CONVERT(INT, ((ISNULL(cl.sent_length_years, 0)) * (365))) AS [Sentence Length]
   ,cl.counts
   --MStart RMP 09/02/21 PI-703, Modified the query to get the vcc code value
   --,cnp.vcc_cd AS vcc_code --cnp.vcc_cd
   ,ISNULL(vc.vcc_code,'') as vcc_code
   --MEnd RMP 09/02/21 PI-703
FROM charge_lists cl
LEFT JOIN charges ch
	ON cl.id_charges = ch.id
LEFT JOIN charge_lists_newport cln
	ON cln.id_charge_lists = cl.id
--MStart RMP 09/02/21 PI-703, Modified the join to get the vcc code value. Also commented the join charges_newport as it's no longer needed
LEFT join vcc_codes vc ON 
	ISNUMERIC(cln.vcc_code) = 1 AND vc.id = cln.vcc_code
--LEFT JOIN charges_newport cnp
--	ON cnp.id_charges = ch.id
--MEnd RMP 09/02/21 PI-703
LEFT JOIN sentence_types st
	ON cl.id_sentence_type = st.id
LEFT JOIN courts ct
	ON cl.id_courts = ct.id
LEFT JOIN judge j
	ON cl.id_judge = j.id
LEFT JOIN charge_hold_release_reason chrr
	ON cl.id_charge_hold_release_reason = chrr.id
LEFT JOIN jurisdictions jr
	ON cl.id_jurisdiction = jr.id
LEFT JOIN bail_bond_type b1
	ON cl.id_bond_type = b1.id
LEFT JOIN bail_bond_type b2
	ON cl.id_bail_type = b2.id
LEFT JOIN security sec
	ON cl.id_security_release = sec.id
LEFT JOIN admissions a
	ON cl.id_admissions = a.id
LEFT JOIN inmates i
	ON a.id_inmates = i.id
LEFT JOIN conviction_type cvt
	ON cl.id_conviction_type = cvt.id
WHERE cl.id = CAST(@charge_list_id AS NVARCHAR)
AND ISNULL(cl.record_sealed, 0) = 0

END
