function checkAnswer(questionId) {
    const userAnswer = document.getElementById(questionId).value;
    const feedback = document.getElementById(`${questionId}-feedback`);
    const questionQ1Answer = '2019';
    if (userAnswer.trim() === questionQ1Answer) {
        feedback.textContent = '答對了！';
        feedback.style.color = 'green';
    } else {
        feedback.textContent = '再試一次！';
        feedback.style.color = 'red';
    }
}