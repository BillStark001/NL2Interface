DROP TABLE IF EXISTS demo_databases;
-- remove Perpetrator DB
DROP TABLE IF EXISTS perpetrator_perpetrator;
DROP TABLE IF EXISTS perpetrator_people;
-- remove College DB
DROP TABLE IF EXISTS college_advisor;
DROP TABLE IF EXISTS college_prereq;
DROP TABLE IF EXISTS college_takes;
DROP TABLE IF EXISTS college_teaches;
DROP TABLE IF EXISTS college_time_slot;
DROP TABLE IF EXISTS college_student;
DROP TABLE IF EXISTS college_section;
DROP TABLE IF EXISTS college_instructor;
DROP TABLE IF EXISTS college_course;
DROP TABLE IF EXISTS college_classroom;
DROP TABLE IF EXISTS college_department;
-- remove Covid DB
DROP TABLE IF EXISTS covid_locationdays;
DROP TABLE IF EXISTS covid_locations;
DROP TABLE IF EXISTS covid_provinces;
DROP TABLE IF EXISTS covid_regions;

CREATE TABLE IF NOT EXISTS "demo_databases" (
"db_id" int,
"name" text, 
"tables" text[],
"source" text,
PRIMARY KEY ("db_id")
);

INSERT INTO demo_databases VALUES (1, 'Perpetrator', '{"people", "perpetrator"}', 'spider');
INSERT INTO demo_databases VALUES (2, 'College', '{"advisor", "classroom", "course", "department", "instructor", "prereq", "section", "student", "takes", "teaches", "time_slot"}', 'spider');
INSERT INTO demo_databases VALUES (3, 'COVID', '{"provinces", "regions", "locations", "locationdays"}', 'COVID');
