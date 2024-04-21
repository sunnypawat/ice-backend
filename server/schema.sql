CREATE DATABASE projecticedb;
USE projecticedb

CREATE TABLE Article (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT, -- Foreign key to link to a NewsPage row
    title VARCHAR(255), -- This will be inherited from NewsPage, you might want to remove this if you only want the link via news_id
    content TEXT,
    imageLink TEXT, -- Changed to TEXT to hold a list of image links, assume list is stored as a serialized array or JSON
    author VARCHAR(100), -- This will be inherited from NewsPage, you might want to remove this if you only want the link via news_id
    FOREIGN KEY (news_id) REFERENCES NewsPage(ID) -- Establishes the foreign key relationship
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

CREATE TABLE UserCourseProgress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    course_id INT,
    completion_status ENUM('not started', 'in progress', 'completed') DEFAULT 'not started',
    score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (course_id) REFERENCES Courses(id)
);

CREATE TABLE UserModuleProgress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    module_id INT,
    completion_status ENUM('not started', 'in progress', 'completed') DEFAULT 'not started',
    score INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (module_id) REFERENCES Modules(id)
);

CREATE TABLE UserContentProgress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content_id INT,
    completion_status ENUM('not started', 'in progress', 'completed') DEFAULT 'not started',
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (content_id) REFERENCES Content(id)
);

CREATE TABLE Quizzes (
    quiz_id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_question TEXT NOT NULL,
    quiz_image VARCHAR(255),
    quiz_answerlist JSON NOT NULL,
    quiz_correct_answer VARCHAR(255) NOT NULL,
    course_id INT,
    module_id INT,
    content_id INT,
    FOREIGN KEY (course_id) REFERENCES Courses(id),
    FOREIGN KEY (module_id) REFERENCES Modules(id),
    FOREIGN KEY (content_id) REFERENCES Content(id)
);


CREATE TABLE UserQuizScores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    course_id INT NOT NULL,
    module_id INT NOT NULL,
    content_id INT NOT NULL,
    user_answer VARCHAR(255),  -- Nullable in case the user hasn't submitted an answer yet
    is_correct BOOLEAN,
    attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id),
    FOREIGN KEY (course_id) REFERENCES Courses(id),
    FOREIGN KEY (module_id) REFERENCES Modules(id),
    FOREIGN KEY (content_id) REFERENCES Content(id)
);
