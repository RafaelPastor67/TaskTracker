CREATE DATABASE IF NOT EXISTS taskflow;
USE taskflow;

Create TABLE users(
id int auto_increment primary key,
name varchar(100),
email varchar(100) UNIQUE,
password varchar(100),
created_at timestamp default current_timestamp
);

create TABLE tasks(
id int auto_increment primary key
);