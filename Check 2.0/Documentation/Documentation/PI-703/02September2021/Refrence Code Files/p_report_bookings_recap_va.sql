ALTER PROCEDURE [dbo].[p_report_bookings_recap_va]
	@start_date AS DATETIME = NULL,
	@end_date AS DATETIME = NULL,
	@facility_id AS INT
AS
--RMP 09/02/21 PI-703, Modified the query to get the vcc code value, Modified the join to get the vcc code value. Also commented the join charges_newport as it's no longer needed
BEGIN
	SET NOCOUNT ON;

	SET @start_date= CONVERT (DATE, @start_date)
	SET @start_date = @start_date + '00:00:00:000'
	SET @end_date = CONVERT (DATE, @end_date)
	SET @end_date = @end_date + '23:59:59:990'

	DECLARE @str_sql NVARCHAR(MAX)

	SET @str_sql = ' SELECT	a.id
							,a.booking_number AS BookingNumber
							,i.criminal_history_number AS CHN
							,CONCAT(dbo.f_full_name(i.last_name, i.first_name, i.middle_name, i.suffix), '' '', a.booking_number) AS name
							,dbo.fn_date(a.booking_date) AS BookDate
							,i.date_of_birth AS DateOfBirth
							,r.race
							,ISNULL(s.sex,'''') AS sex
							,ar.agency AS ArrestingAgency
							,ct.custody_type AS CustodyType
							,REPLACE(SUBSTRING(CONVERT(VARCHAR(20),a.booking_date,108),1,5),'':'','''') as [Booking Time]
							,dbo.f_full_name(i.last_name, i.first_name, i.middle_name, i.suffix) as InmateName  --IStart IEnd SKB 04/29/21 SP4-1447, Get the inmate full name.
							--IStart SKB 05/28/19 SP4-1140, Adding Facility Name to Reports with Facility Filters.
							,ISNULL(f.facility_name, ''Unknown'') AS FacilityName
							--IEnd SKB 05/28/19 SP4-1140
					FROM (admissions a join inmates i ON a.id_inmates = i.id) 
					LEFT JOIN race r ON i.id_race = r.id 
					LEFT JOIN sex s ON i.id_sex = s.id 
					LEFT JOIN arresting_agency ar ON a.id_arresting_agency = ar.id 
					LEFT JOIN custody_type  ct ON a.id_custody_type = ct.id
					--IStart SKB 05/28/19 SP4-1140, Adding Facility Name to Reports with Facility Filters.
					LEFT JOIN facilities f on a.id_facilities = f.id
					--IEnd SKB 05/28/19 SP4-1140
					WHERE a.deleted = 0  and i.deleted = 0
					AND dbo.fn_datetime_from_a(a.booking_date, dbo.f_get_time(a.booking_date))
					between ''' + CAST(@start_date AS NVARCHAR) + ''' and ''' + CAST(@end_date AS NVARCHAR) + ''''

	IF (@facility_id > 0)
	BEGIN
		SET @str_sql = @str_sql + ' AND a.id_facilities = ''' +  CAST(@facility_id AS NVARCHAR) + ''' '
	END
	
	SET @str_sql = @str_sql + ' order by name,bookingnumber'
	print (@str_sql)
	EXEC (@str_sql)

	DECLARE @str_charge_sql NVARCHAR(MAX)

	SET @str_charge_sql = ' SELECT	a.booking_number AS BookingNumber
									,CONCAT(dbo.f_full_name(i.last_name, i.first_name, i.middle_name, i.suffix), '' '', a.booking_number) AS name
									,cld.bail_amount
									,cl.history_number as HistoryNumber
									,ch.title_sect AS [Title/Sect]
									,ch.degree AS DegreeCharge
									,ch.description AS ChargeDescription
									,bail.description AS BailType
									,cl.charge_number AS ChargeNumber
									,bond.description AS BondType
									,cld.bond_amount AS BondAmount
									,dbo.fn_datetime(cl.court_date) as court_datetime
									,cr.court as return_court --IStart SKB 04/22/21 SP4-1447, Gets the return court value.
									,ISNULL(f.facility_name, ''Unknown'') AS FacilityName
									--MStart RMP 09/02/21 PI-703, Modified the query to get the vcc code value
									--,cnp.vcc_cd AS vcc_code
									,ISNULL(vc.vcc_code,'''') as vcc_code
									--MEnd RMP 09/02/21 PI-703
							FROM (admissions a join inmates i ON a.id_inmates = i.id) 
							LEFT JOIN dbo.f_inmate_charges_at_a_date(''' + CAST(@end_date AS NVARCHAR) + ''') cl on cl.id_admissions = a.id 
							LEFT JOIN charge_lists cld ON cl.id = cld.id and cld.deleted = 0
							LEFT JOIN facilities f on a.id_facilities = f.id
							LEFT JOIN charges ch ON cl.id_charges = ch.id 
							LEFT JOIN charge_lists_newport cln ON cln.id_charge_lists = cld.id
							--MStart RMP 09/02/21 PI-703, Modified the join to get the vcc code value. Also commented the join charges_newport as it''s no longer needed
							LEFT join vcc_codes vc ON ISNUMERIC(cln.vcc_code) = 1 AND vc.id = cln.vcc_code
							--LEFT JOIN charges_newport cnp ON cnp.id_charges = ch.id
							--MEnd RMP 09/02/21 PI-703
							LEFT JOIN bail_bond_type bond ON cld.id_bond_type = bond.id 
							LEFT JOIN bail_bond_type bail ON cld.id_bail_type = bail.id 
							LEFT JOIN courts cr ON cld.id_courts = cr.id  --IStart SKB 04/22/21 SP4-1447, Added new join with courts table for getting return court.
							WHERE  a.deleted = 0  and i.deleted = 0 
							AND dbo.fn_datetime_from_a(a.booking_date, dbo.f_get_time(a.booking_date)) 
							between ''' + CAST(@start_date AS NVARCHAR) + ''' and ''' + CAST(@end_date AS NVARCHAR) + ''''

	IF (@facility_id > 0)
	BEGIN
		SET @str_charge_sql = @str_charge_sql + ' AND a.id_facilities = ''' +  CAST(@facility_id AS NVARCHAR) + ''' '
	END
	
	SET @str_charge_sql = @str_charge_sql + ' order by a.id,cl.charge_number desc'
	print (@str_charge_sql)
	EXEC (@str_charge_sql)

END


GO