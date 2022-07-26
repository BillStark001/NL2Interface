CREATE TABLE IF NOT EXISTS "perpetrator_people" (
"People_ID" int,
"Name" text,
"Height" real,
"Weight" real,
"Home Town" text,
PRIMARY KEY ("People_ID")
);
INSERT INTO "perpetrator_people" VALUES(1,'Ron Baxter',6.4000000000000003552,204.99999999999999999,'Los Angeles, CA');
INSERT INTO "perpetrator_people" VALUES(2,'Brent Boyd',6.2999999999999998223,185.0,'Baton Rouge, LA');
INSERT INTO "perpetrator_people" VALUES(3,'Tyrone Brayan',6.7000000000000001776,220.0,'Placentia, CA');
INSERT INTO "perpetrator_people" VALUES(4,'Rob Cunningham',6.7999999999999998223,215.0,'Westport, CT');
INSERT INTO "perpetrator_people" VALUES(5,'John Danks',6.5999999999999996447,190.0,'Beaver Dam, KY');
INSERT INTO "perpetrator_people" VALUES(6,'Ovie Dotson',6.5,200.0,'San Antonio, TX');
INSERT INTO "perpetrator_people" VALUES(7,'Gary Goodner',6.7000000000000001776,220.0,'Denton, TX');
INSERT INTO "perpetrator_people" VALUES(8,'Henry Johnson',6.5999999999999996447,190.0,'Los Angeles, CA');
INSERT INTO "perpetrator_people" VALUES(9,'Jim Krivacs',6.0999999999999996447,160.0,'Indianapolis, IN');
INSERT INTO "perpetrator_people" VALUES(10,'John Moore',6.0999999999999996447,170.0,'Altoona, PA');
INSERT INTO "perpetrator_people" VALUES(11,'Mike Murphy',6.7999999999999998223,215.0,'Austin, TX');

CREATE TABLE IF NOT EXISTS "perpetrator_perpetrator" (
"perpetrator_ID" int,
"People_ID" int,
"Date" text,
"Year" real,
"Location" text,
"Country" text,
"Killed" int,
"Injured" int,
PRIMARY KEY ("perpetrator_ID"),
FOREIGN KEY ("People_ID") REFERENCES "perpetrator_people"("People_ID")
);
INSERT INTO "perpetrator_perpetrator" VALUES(1,1,'04.26 April 26/27',1981.9999999999999999,'Uiryeong','South Korea',56,37);
INSERT INTO "perpetrator_perpetrator" VALUES(2,3,'11.18 Nov. 18',1994.9999999999999999,'Zhaodong','China',32,16);
INSERT INTO "perpetrator_perpetrator" VALUES(3,4,'05.21 May 21',1938.0,'Kaio','Japan',30,3);
INSERT INTO "perpetrator_perpetrator" VALUES(4,6,'09.20 Sep. 20',1993.9999999999999999,'Beijing','China',23,80);
INSERT INTO "perpetrator_perpetrator" VALUES(5,8,'04.00 April',1950.0,'Nainital','India',22,0);