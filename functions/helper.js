// function to push answers query into the quiz questions object -- USED IN GET /quizzes/:quizid
const pushAnswersIntoQuestionObject = (array1, array2) => {
  const updatedQuestionArray = array1.map(questionObject => {
    const answersArrayForEachQuestion = array2.filter(answersObject => {
      return questionObject.question_id === answersObject.question_id
    })

    questionObject["answers"] = answersArrayForEachQuestion;
    return questionObject;
  })
  return updatedQuestionArray;
}

// function to calculate score for quiz -- USED IN POST /quizzes/:quizid
const calculateQuizScore = (answersArray, inputObject) => {
  const userAnswer = Object.values(inputObject);
  const correctAnswer = [];
  let score = 0;
  for (const answers of answersArray) {
    correctAnswer.push(answers.answer)
  }
  console.log(userAnswer);
  console.log(correctAnswer);
  for (let i = 0; i < correctAnswer.length; i++) {
    if (correctAnswer[i] === userAnswer[i]) {
      score += 1;
    }
  }
  console.log(score);
  return score;
}

// og function
const pushAnswerIntoQuestion = (array1, array2) => {
  const updatedArray = array1.map(x => {
    const questionAnswers = array2.filter(y => {
      return x.question_id === y.question_id
    })

    x["answers"] = questionAnswers;
    console.log("RESULT TEST" ,x);
    return x;
  })
  return updatedArray;
}
module.exports = { pushAnswersIntoQuestionObject, calculateQuizScore }
