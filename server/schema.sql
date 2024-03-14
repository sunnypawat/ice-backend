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

CREATE TABLE NewsPage (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Subtitle VARCHAR(255),
    Description TEXT,
    Date DATETIME,
    Author VARCHAR(100),
    Picture VARCHAR(255)
);

CREATE TABLE Courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    picture VARCHAR(255)
);

CREATE TABLE Subdivisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    subdivision_title VARCHAR(50) NOT NULL,
    subdivision_description TEXT,
    FOREIGN KEY (course_id) REFERENCES Courses(id)
);

