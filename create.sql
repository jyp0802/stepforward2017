DROP DATABASE IF EXISTS stepforward_db;
CREATE DATABASE stepforward_db;
USE stepforward_db;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Classes;
DROP TABLE IF EXISTS Registration;
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
	max int not null,
	current int not null,
	details varchar(3000),
	CHECK (current <= max),
	CHECK (current >= 0),
	PRIMARY KEY (cid)
);

CREATE TABLE Registration (
	uid int not null,
	cid int not null,
	PRIMARY KEY (uid),
	FOREIGN KEY (uid) REFERENCES Users(uid) ON DELETE CASCADE,
	FOREIGN KEY (cid) REFERENCES Classes(cid) ON DELETE CASCADE
);


delimiter |
CREATE TRIGGER register BEFORE UPDATE ON Classes
	FOR EACH ROW BEGIN
		IF NEW.current > NEW.max THEN
			SIGNAL SQLSTATE '45000';
		END IF;
	END;
	|
delimiter ;