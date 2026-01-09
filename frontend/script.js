const apiBase = "http://127.0.0.1:8000"; // change if your backend URL is different

// Fetch all questions from backend
async function fetchQuestions() {
  const response = await fetch(`${apiBase}/questions/`);
  const questions = await response.json();
  renderTable(questions);
}

// Render table rows
function renderTable(questions) {
  const tbody = document.querySelector("#questionsTable tbody");
  tbody.innerHTML = ""; // clear existing rows

  questions.forEach(q => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${q.id}</td>
      <td>${q.question_text}</td>
      <td>${q.answer_text}</td>
      <td>
        <button class="update-btn" onclick="updateQuestionPrompt(${q.id}, '${q.question_text}', '${q.answer_text}')">Update</button>
        <button class="delete-btn" onclick="deleteQuestion(${q.id})">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Add a new question
async function addQuestion() {
  const questionInput = document.getElementById("question");
  const answerInput = document.getElementById("answer");

  const data = {
    question_text: questionInput.value,
    answer_text: answerInput.value
  };

  if (!data.question_text || !data.answer_text) {
    alert("Please enter both question and answer");
    return;
  }

  const response = await fetch(`${apiBase}/question/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    questionInput.value = "";
    answerInput.value = "";
    fetchQuestions(); // refresh table
  } else {
    alert("Error adding question");
  }
}

// Delete a question
async function deleteQuestion(id) {
  if (!confirm("Are you sure you want to delete this question?")) return;

  const response = await fetch(`${apiBase}/question/${id}`, {
    method: "DELETE"
  });

  if (response.ok) {
    fetchQuestions(); // refresh table
  } else {
    alert("Error deleting question");
  }
}

// Prompt to update a question
function updateQuestionPrompt(id, currentQuestion, currentAnswer) {
  const newQuestion = prompt("Update Question:", currentQuestion);
  if (newQuestion === null) return; // Cancel clicked

  const newAnswer = prompt("Update Answer:", currentAnswer);
  if (newAnswer === null) return;

  updateQuestion(id, newQuestion, newAnswer);
}

// Update question in backend
async function updateQuestion(id, questionText, answerText) {
  const data = { question_text: questionText, answer_text: answerText };

  const response = await fetch(`${apiBase}/question/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    fetchQuestions(); // refresh table
  } else {
    alert("Error updating question");
  }
}

// Load questions on page load
fetchQuestions();
