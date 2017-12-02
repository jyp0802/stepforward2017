DROP DATABASE IF EXISTS stepforward_db;
CREATE DATABASE stepforward_db;
USE stepforward_db;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS TempUsers;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE Users (
  uid int not null auto_increment,
  name varchar(255) not null,
  password varchar(255) not null,
  earth varchar(255) not null,
  campus varchar(255) not null,
  year int not null,
  PRIMARY KEY (uid)
);

CREATE TABLE Classes (
	cid int not null auto_increment,
	title varchar(255) not null,
	speaker varchar(255) not null,
	location varchar(255) not null,
	max int,
	current int not null,
	details varchar(3000),
	PRIMARY KEY (cid)
);

CREATE TABLE Registration (
	uid int not null,
	cid int not null,
	PRIMARY KEY (uid, cid),
	FOREIGN KEY (uid) REFERENCES Users(uid) ON DELETE CASCADE,
	FOREIGN KEY (cid) REFERENCES Classes(cid) ON DELETE CASCADE
);