CREATE DATABASE projectICE_db;
USE projectICE_db

CREATE TABLE Article (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    imageLink VARCHAR(255)
);

CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255)
);
