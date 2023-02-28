/*
 * All routes for Quizzes are defined here
 * Since this file is loaded in server.js into /quizzes,
 *   these routes are mounted onto /quizzes
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require("express");
const router = express.Router();
const quizQueries = require("../db/queries/quizzes");
const { pushAnswersIntoQuestionObject, calculateQuizScore, returnBooleanIsPublic } = require("../functions/helper");

// HOMEPAGE - show list of public quizzes
// NOTE - tested end to end - everything checks out
router.get("/", (req, res) => {
  //query returns an array of objects
  quizQueries
    .getQuizzes()
    .then((result) => {
      const quizzes = result;
      res.render("index", {
        quizzes: quizzes
      });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

// CREATE QUIZ - render page to create a new quiz
router.get("/create", (req, res) => {
  res.render("quiz_create");
});

// CREATE QUIZ - add newly created quiz to DB table
router.post("/", (req, res) => {
  //parse body for submitted quiz
  const newQuiz = req.body;
  console.log(newQuiz);

  // values to pass into addNewQuiz query

  const quizTitle = newQuiz["quiz-title"]
  console.log(quizTitle);
  const quizDescription = newQuiz["quiz-description"]
  console.log(quizDescription);
  const quizType = newQuiz["quiz-type"]
  console.log(quizType);
  const userID = 1; //NEED THIS INFO !!!
  const isPublic = returnBooleanIsPublic(newQuiz.privacy);
  console.log(isPublic);








  // quizQueries.addNewQuiz(newQuiz)
  // .then(quiz => {
  //   if (!quiz) {
  //     res.send("oops something went wrong! Please try submitting again")
  //     return;
  //   }
  //   res.send("new quiz has been created!")
  // })
  // .catch(error => res.send(error));
});

// VIEW QUIZ - show single quiz for user to attempt
// NOTE: (route is interacting with DB just fine - there is an issue in the ejs file)

router.get("/:quizid", (req, res) => {
  const quizId = req.params.quizid;
  //console.log('QUIZ ID', quizId);
  quizQueries.getSelectedQuiz(quizId).
  then((resultQuestions) => {
    const quizQuestions = resultQuestions;
    //console.log('QUIZ QUESTION', quizQuestions);

    quizQueries.getAnswersForSelectedQuiz(quizId)
    .then((resultAnswers) => {
      const quizAnswers = resultAnswers;
      //console.log('QUIZ ANSWERS:', quizAnswers)
      const quizQuestionsAnswers = pushAnswersIntoQuestionObject(quizQuestions, quizAnswers);
      // console.log('QUIZZES:', quizQuestionsAnswers)
      res.render("quiz_take",
    {quizzes: quizQuestionsAnswers
    });
    })
  });
});

// VIEW QUIZ - send quiz results to DB
router.post("/:quizid", (req, res) => {
  const quizId = req.params.quizid;
  //const userId = NEED USER ID !!!!!!
  console.log("QUIZ ID:",quizId);

  // get users answers and compare it to correct answer
  const userAnswers = req.body;
  quizQueries.getCorrectAnswerForQuiz(quizId).then((result) => {
    const correctAnswers = result;
    const quizScore = calculateQuizScore(correctAnswers, userAnswers);
    //console.log(quizScore);
    // RESULT LINK NEEDS TO BE UPDATED WITH USERID !!!!!!!!!!!!
    const quizResultLink = `http://localhost:8080/users/1/quizzes/${quizId}`;
    quizQueries.addQuizResult(quizId, 1, quizScore, quizResultLink)
    .then((quizResult) => {
      //console.log(quizResult);
      if (!quizResult) {
        res.send("Oops! It appears that something has gone wrong")
      }
      res.redirect('/quizzes');
    })
  })
});

// MY QUIZZES - post route to delete a quiz {POST MVP}
router.post("/:quizid/delete", (req, res) => {});

module.exports = router;
