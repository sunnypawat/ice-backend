CREATE DATABASE notes_app;
USE notes_app

CREATE TABLE article (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    contents TEXT NOT NULL,
    img VARCHAR(255),
    created TIMESTAMP NOT NULL DEFAULT NOW()
)

INSERT INTO article(title, contents, img)
VALUES 
('First Aricle', 'Generic text woohoo ez trading 1'),
('Second Aricle', 'Generic text woohoo ez trading 2')