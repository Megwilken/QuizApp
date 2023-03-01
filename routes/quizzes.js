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

// add quiz data to quizzes table
  const quizTitle = newQuiz["quiz-title"]
  const quizDescription = newQuiz["quiz-description"]
  const quizType = newQuiz["quiz-type"]
  const userId = req.cookies["user_id"]
  let quizId;
  const isPublic = returnBooleanIsPublic(newQuiz.privacy);

  quizQueries.addNewQuiz(userId, quizTitle, quizType, quizDescription, isPublic)
  .then(result => {
    quizId = result.id;
    const quizLink = `http://localhost:8080/quizzes/${quizId}`

// add quiz link to quizzes table
    return quizQueries.addQuizLink(quizId, quizLink)
  })
  .then(data =>{
      //console.log(data);
// insert questions into questions table
      const question1 = newQuiz["question-1"];
      const question2 = newQuiz["question-2"];
      const question3 = newQuiz["question-3"];
      const question4 = newQuiz["question-4"];
      const question5 = newQuiz["question-5"];
      return quizQueries.addQuizQuestions(quizId, question1, question2, question3, question4, question5)
    })
  .then(data => {
        console.log(data)
        const idQuestion1 = data[0].id;
        const idQuestion2 = data[1].id;
        const idQuestion3 = data[2].id;
        const idQuestion4 = data[3].id;
        const idQuestion5 = data[4].id;

        const answersQuestion1 = newQuiz["1answer-text"];
        const answersQuestion2 = newQuiz["2answer-text"]
        const answersQuestion3 = newQuiz["3answer-text"]
        const answersQuestion4 = newQuiz["4answer-text"]
        const answersQuestion5 = newQuiz["5answer-text"]

        const correctAnswerIndexQues1 = newQuiz["1answer-radio"]
        const correctAnswerIndexQues2 = newQuiz["1answer-radio"]
        const correctAnswerIndexQues3 = newQuiz["1answer-radio"]
        const correctAnswerIndexQues4 = newQuiz["1answer-radio"]
        const correctAnswerIndexQues5 = newQuiz["1answer-radio"]


        console.log(answersQuestion1, answersQuestion2, answersQuestion3, answersQuestion4, answersQuestion5)

      })











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
  userId = req.cookies["user_id"]
  console.log("QUIZ ID:",quizId);

  // get users answers and compare it to correct answer
  const userAnswers = req.body;
  quizQueries.getCorrectAnswerForQuiz(quizId).then((result) => {
    const correctAnswers = result;
    const quizScore = calculateQuizScore(correctAnswers, userAnswers);
    //console.log(quizScore);
    // RESULT LINK NEEDS TO BE UPDATED WITH USERID !!!!!!!!!!!!
    const quizResultLink = `http://localhost:8080/users/${userId}/quizzes/${quizId}`;
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
