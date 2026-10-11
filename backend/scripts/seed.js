require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing
    await Admin.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});

    // Create Admin
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpassword', 10);
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@drrclub.edu',
      password: hashedPassword
    });
    console.log('Admin user created');

    // Create Quiz
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const quiz = await Quiz.create({
      title: 'Disaster Preparedness and Risk Reduction Challenge',
      description: 'Test your knowledge on disaster management and safety protocols. Be fast, be accurate!',
      openingTime: now,
      closingTime: tomorrow,
      status: 'Live',
      createdBy: admin._id
    });
    console.log('Quiz created');

    // Create Questions
    const questions = [
      {
        text: 'What is the most important item to include in an emergency kit?',
        options: ['Flashlight', 'Water', 'Extra clothes', 'Money'],
        correctAnswer: 'Water',
        timeLimit: 20,
      },
      {
        text: 'During an earthquake, what is the best immediate action if you are indoors?',
        options: ['Run outside', 'Drop, Cover, and Hold on', 'Stand near a window', 'Use the elevator'],
        correctAnswer: 'Drop, Cover, and Hold on',
        timeLimit: 20,
      },
      {
        text: 'Which organization is the primary agency for disaster management in India?',
        options: ['NDMA', 'WHO', 'UNICEF', 'ISRO'],
        correctAnswer: 'NDMA',
        timeLimit: 15,
      },
      {
        text: 'What is the first step in basic First Aid for a bleeding wound?',
        options: ['Apply a tourniquet', 'Wash with soap', 'Apply direct pressure', 'Elevate the wound immediately'],
        correctAnswer: 'Apply direct pressure',
        timeLimit: 20,
      },
      {
        text: 'What does early warning system (EWS) primarily rely on?',
        options: ['Community rumors', 'Scientific data and monitoring', 'Astrology', 'Past records only'],
        correctAnswer: 'Scientific data and monitoring',
        timeLimit: 15,
      },
      {
        text: 'In case of a fire, what should you do if the room fills with smoke?',
        options: ['Run quickly', 'Crawl low under the smoke', 'Open all windows', 'Hide under a bed'],
        correctAnswer: 'Crawl low under the smoke',
        timeLimit: 20,
      },
      {
        text: 'Which color code is generally used for maximum alert in weather warnings?',
        options: ['Yellow', 'Orange', 'Red', 'Green'],
        correctAnswer: 'Red',
        timeLimit: 15,
      },
      {
        text: 'What should you NOT do during a flood?',
        options: ['Move to higher ground', 'Turn off electricity', 'Walk or drive through moving water', 'Listen to emergency broadcasts'],
        correctAnswer: 'Walk or drive through moving water',
        timeLimit: 20,
      },
      {
        text: 'What is a tsunami?',
        options: ['A heavy rainfall', 'A series of ocean waves caused by underwater earthquakes', 'A severe cyclone', 'A volcanic eruption'],
        correctAnswer: 'A series of ocean waves caused by underwater earthquakes',
        timeLimit: 15,
      },
      {
        text: 'Community disaster resilience means:',
        options: ['Waiting for government help', 'The ability of a community to prepare for, respond to, and recover from a disaster', 'Ignoring small risks', 'Moving to another city'],
        correctAnswer: 'The ability of a community to prepare for, respond to, and recover from a disaster',
        timeLimit: 30,
      }
    ];

    for (let i = 0; i < questions.length; i++) {
      await Question.create({
        ...questions[i],
        quizId: quiz._id,
        order: i + 1
      });
    }
    console.log('Questions created');

    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
